import { readFileSync } from 'node:fs';
import fp from 'fastify-plugin';

export default fp(async function (fastify) {
  fastify.decorate('openFile', openFile);
});

function openFile(path) {
  const fileReader = readFileSync(path);
  return fileReader.toString();
}