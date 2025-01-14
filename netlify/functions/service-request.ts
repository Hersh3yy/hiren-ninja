// netlify/functions/service-request.ts

// Replace these with your actual values
const CLICKUP_API_KEY = 'pk_56675276_Z47SPO66036EC0Q8TR805FVSFY423BDC';
const CLICKUP_LIST_ID = '901507749589';

interface ServiceRequest {
    name: string;
    email: string;
    serviceType: string;
    timeline: string;
    description: string;
}

interface ClickUpTask {
    name: string;
    description: string;
    status: string;
    tags: string[];
    priority?: number;
    due_date?: number;
    notify_all?: boolean;
}

const createClickUpTask = async (taskData: ClickUpTask) => {
    const response = await fetch(`https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`, {
        method: 'POST',
        headers: {
            'Authorization': `${CLICKUP_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ClickUp API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
};

const getServiceTags = (serviceType: string): string[] => {
    const tagMap: { [key: string]: string[] } = {
        discovery: ['Lead', 'Discovery'],
        website: ['Lead', 'Website'],
        application: ['Lead', 'Application'],
        maintenance: ['Lead', 'Maintenance']
    };
    return tagMap[serviceType] || ['Lead'];
};

const getPriority = (timeline: string): number => {
    const priorityMap: { [key: string]: number } = {
        urgent: 1,  // Highest priority
        soon: 2,    // High priority
        flexible: 3 // Normal priority
    };
    return priorityMap[timeline] || 3;
};

export const handler = async (event: any) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        const data: ServiceRequest = JSON.parse(event.body || '');
        console.log('Received service request:', data);

        // Format the task description with markdown
        const taskDescription = `
### Contact Details
- **Name:** ${data.name}
- **Email:** ${data.email}

### Service Request Details
- **Service Type:** ${data.serviceType}
- **Timeline:** ${data.timeline}

### Project Description
${data.description}

---
*Submitted via website form*
        `.trim();

        // Prepare task data for ClickUp
        const taskData: ClickUpTask = {
            name: `[${data.serviceType.toUpperCase()}] ${data.name} - New Lead`,
            description: taskDescription,
            status: 'NEW',
            tags: getServiceTags(data.serviceType),
            priority: getPriority(data.timeline),
            notify_all: true
        };

        // Create the task in ClickUp
        const clickUpResponse = await createClickUpTask(taskData);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Service request created successfully',
                taskId: clickUpResponse.id
            })
        };

    } catch (error: any) {
        console.error('Service request error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Failed to process service request',
                error: error.message
            })
        };
    }
};