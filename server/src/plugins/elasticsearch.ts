import fp from 'fastify-plugin';
import { Client } from '@opensearch-project/opensearch';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { FastifyInstance } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
  const opensearchClient = getOpensearchClient(fastify);
  fastify.decorate('opensearch', opensearchClient);
  fastify.decorate('opensearchQuery', opensearchQuery(opensearchClient));
});

export function getOpensearchClient(fastify: FastifyInstance) {
  const domain = process.env.OPENSEARCH_DOMAIN_ENDPOINT;

  return new Client({
    ...AwsSigv4Signer({
      getCredentials: getTemporaryCredentialProvider(fastify.config.OPENSEARCH_ARN),
      'region': 'us-east-1',
      service: 'es',
    }),
    node: `https://${fastify.config.OPENSEARCH_DOMAIN}`,
  });
}

function getTemporaryCredentialProvider(opensearchArn: string) {
  const ElasticSearchAccessPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: 'es:ESHttp*',
        Resource: `${opensearchArn}/*`,
      },
    ],
  };

  return fromTemporaryCredentials({
    params: {
      RoleArn: `arn:aws:iam::926384192966:role/evervault-team-cage-role`,
      RoleSessionName: 'rex-signed-client',
      DurationSeconds: 3600,
      Policy: JSON.stringify(ElasticSearchAccessPolicy),
    },
    clientConfig: {
      region: 'us-east-1',
    },
  });
}

function opensearchQuery(opensearchClient: Client) {
  return async (query: Record<string, any>) => {
    try {
      console.log('Executing ES query:', query);
      const result = await opensearchClient.search({
        index: 'log-12-7-2024,log-11-7-2024,log-10-7-2024',
        body: query
      });
      return result;
    } catch (error) {
      console.error('Error executing search query:', error);
      throw error;
    }
  };
}
