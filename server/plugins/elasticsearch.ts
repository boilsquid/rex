import fp from 'fastify-plugin';

export default fp(async function (fastify, opts) {
  
});

interface SearchQuery {
  query: string;
}

async function performOpenSearchQuery(query: string): Promise<any> {
  const openSearch = new AWS.OpenSearch({
    region: process.env.AWS_REGION
  });

  const domainEndpoint = process.env.OPENSEARCH_DOMAIN_ENDPOINT;

  const params = {
    method: 'POST',
    body: JSON.stringify({
      query: {
        match: {
          message: query
        }
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };


  try {
    const url = `${domainEndpoint}/_search`;
    const response = await openSearch.makeRequest('POST', {url}, params).promise();
    return JSON.parse(response.body as string);
  } catch (error) {
    console.error('Error executing OpenSearch query:', error);
    throw error;
  }
}

