const GRAPHQL_GET_PROJECTS_QUERY = `
query {
  projects {
    title
    shortDescription
    fullDescription
    coverImage {
      url
      fileName
      size
    }
    screenshots {
      url
      fileName
      size
    }
  }
}`;

export const handler = async (event: any) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    // Handle preflight requests (CORS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    // Allow only GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    try {
        const response = await fetch('https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clvkp3ut01ajw07wc38106mxt/master', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: GRAPHQL_GET_PROJECTS_QUERY })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch data' })
        };
    }
};