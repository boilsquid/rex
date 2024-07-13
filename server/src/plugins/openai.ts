import { FastifyInstance } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import OpenAI from 'openai';
import { openFile } from '../utils/files';
import { ChatCompletion } from 'openai/resources';

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


const elasticPrompt = openFile('src/prompts/elastic.txt');
const elasticResponsePrompt = openFile('src/prompts/elastic-response.txt');
async function plugin (fastify: FastifyInstance, opts: any) {
  const openai = new OpenAI({apiKey: fastify.config.OPENAI_API_KEY});
  
  fastify.post('/', opts, async (request: FastifyRequest<{ Body: { question: string } }>, reply: FastifyReply) => {
    const { question } = request.body;

    const jsonFormat: Record<string, string> = { "type": "json_object" };
    const textFormat: Record<string, string> = { "type": "text" };


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
    const parsedQuery = JSON.parse(storageQuery.content as string);
        
    const result = await fastify.opensearchQuery(parsedQuery);
    
    try {
      console.log("Being sent to openAI: ", JSON.stringify(result.body));
      const esResponsePromptRes: ChatCompletion = await openai.chat.completions.create({
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