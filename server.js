import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import openAIPlugin from './plugins/openai.js'
import elasticsearch from './plugins/elasticsearch.js';
import files from './plugins/files.js';
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

const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
})

await server.register(FastifyVite, { 
  root: import.meta.url, 
  renderer: '@fastify/react',
})

await server.vite.ready()

server.decorate('db', {
  todoList: [
    'Do laundry',
    'Respond to emails',
    'Write report',
  ]
})

server.put('/api/todo/items', (req, reply) => {
  server.db.todoList.push(req.body)
  reply.send({ ok: true })
})

server.delete('/api/todo/items', (req, reply) => {
  server.db.todoList.splice(req.body, 1)
  reply.send({ ok: true })
})

server.register(files)
server.register(FastifyEnv, options)
server.register(elasticsearch);
server.register(openAIPlugin, {
  prefix: '/prompt'
});

await server.listen({ port: 3000 })
