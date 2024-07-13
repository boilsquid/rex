import fastify from 'fastify';

declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = Server,
    HttpRequest = IncomingMessage,
    HttpResponse = ServerResponse,
  > {
    opensearch: function;
    opensearchQuery: function;
    config: Record<string, string>;
  }
}