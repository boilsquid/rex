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

const openai = new OpenAI({apiKey: ''});
const elasticPrompt = openFile('prompts/elastic.txt');

async function plugin (fastify: FastifyInstance) {
  fastify.post('/', opts, async (request: FastifyRequest<{ Body: { question: string } }>, reply: FastifyReply) => {
    const { question } = request.body;
    
    const format: Record<string, string> = { "type": "json_object" };

    const res: ChatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: elasticPrompt },
        { role: 'user', content: question }
      ],
      model: 'gpt-4-turbo',
      response_format: format
    });

    const storageQuery = res.choices[0].message;
    
    return {"message": "Hello World!"};
  });
}

export default plugin;