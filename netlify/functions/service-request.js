// netlify/functions/service-request.ts
import { Handler } from '@netlify/functions'
import axios from 'axios'

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    try {
        const data = JSON.parse(event.body || '')

        const response = await axios.post(
            process.env.CMS_ENDPOINT!,
            {
                query: `
          mutation CreateServiceRequest($input: ServiceRequestInput!) {
            createServiceRequest(data: $input) {
              data {
                id
                attributes {
                  status
                }
              }
            }
          }
        `,
                variables: {
                    input: {
                        ...data,
                        status: 'NEW'
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CMS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        }

    } catch (error: any) {
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({
                message: error.message
            })
        }
    }
}