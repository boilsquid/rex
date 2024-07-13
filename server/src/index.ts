import fastify from 'fastify';
import openAIPlugin from './plugins/openai';
import elasticsearch from './plugins/elasticsearch';
import 'dotenv/config';
import FastifyEnv from '@fastify/env';


const schema = {
  type: 'object',
  required: ['OPENAI_API_KEY', 'OPENSEARCH_DOMAIN', 'OPENSEARCH_ARN'],
  properties: {
    OPENAI_API_KEY: {
      type: 'string'
    },
    OPENSEARCH_DOMAIN: {
      type: 'string'
    },
    OPENSEARCH_ARN: {
      type: 'string'
    }
  }
}

const options = {
  confKey: 'config',
  schema,
  dotenv: true,
  data: process.env
}

const server = fastify();
server.register(FastifyEnv, options)

server.register(elasticsearch);
server.register(openAIPlugin, {
  prefix: '/prompt'
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
