import OpenAI from 'openai';

const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        question: { type: 'string' }
      }
    }
  }
}



async function plugin (fastify, opts) {
  const elasticPrompt = fastify.openFile('prompts/elastic.txt');
  const elasticResponsePrompt = fastify.openFile('prompts/elastic-response.txt');
  
  const openai = new OpenAI({apiKey: fastify.config.OPENAI_API_KEY});
  
  fastify.post('/', opts, async (request, reply) => {
    const { question } = request.body;

    const jsonFormat = { "type": "json_object" };
    const textFormat = { "type": "text" };


    // const res: ChatCompletion = await openai.chat.completions.create({
    //   messages: [
    //     { role: 'system', content: elasticPrompt },
    //     { role: 'user', content: question }
    //   ],
    //   model: 'gpt-4-turbo',
    //   response_format: format
    // });

    // const storageQuery = res.choices[0].message;
    const storageQuery = { content: `{
      "size": 0,
      "aggs": {
        "count_requests": {
          "terms": {
            "field": "url.domain.keyword",
            "include": "issuecards-api-bridgecard-co.relay.evervault.com"
          }
        }
      }
    }`};
    console.log('Storage Query:', JSON.stringify(storageQuery.content));
    const parsedQuery = JSON.parse(storageQuery.content);
        
    const result = await fastify.opensearchQuery(parsedQuery);
    
    try {
      console.log("Being sent to openAI: ", JSON.stringify(result.body));
      const esResponsePromptRes = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: elasticResponsePrompt },
          { role: 'user', content: JSON.stringify(result.body) }
        ],
        model: 'gpt-4-turbo',
        response_format: textFormat
      });
      const postStorageResponse = esResponsePromptRes.choices[0].message;
      console.log("postStorageResponse", postStorageResponse);
      
      return {"message": postStorageResponse.content};
    } catch (error) {
      console.error("Error", error);
      return {"error": error};
    }
  
  });
}

export default plugin;