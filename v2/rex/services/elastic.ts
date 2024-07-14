import { Client } from '@opensearch-project/opensearch';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';


function opensearchClient() {
  const domain = process.env.OPENSEARCH_DOMAIN_ENDPOINT;

  return new Client({
    ...AwsSigv4Signer({
      getCredentials: getTemporaryCredentialProvider(process.env.OPENSEARCH_ARN as string),
      'region': 'us-east-1',
      service: 'es',
    }),
    node: `https://${process.env.OPENSEARCH_DOMAIN}`,
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
  return async (query: string) => {
    try {
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

const query = opensearchQuery(opensearchClient());

export { query };
