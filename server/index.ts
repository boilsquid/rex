import fastify from 'fastify';
import openAIPlugin from './plugins/openai';
import 'dotenv/config';

const server = fastify();

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
