// netlify/functions/service-request.ts
export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body || '');
        console.log('Received service request:', data);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Log what would be sent to ClickUp
        const taskData = {
            name: `${data.serviceType}: ${data.name}`,
            description: `
### Contact Details
- **Name:** ${data.name}
- **Email:** ${data.email}

### Service Request Details
- **Service Type:** ${data.serviceType}
- **Timeline:** ${data.timeline}

### Project Description
${data.description}
            `.trim(),
            status: 'New Lead'
        };

        console.log('Would create ClickUp task:', taskData);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Service request received successfully',
                data: taskData
            })
        };

    } catch (error) {
        console.error('Service request error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to process service request',
                error: error.message
            })
        };
    }
};