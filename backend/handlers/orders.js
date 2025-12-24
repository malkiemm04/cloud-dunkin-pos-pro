const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.createOrder = async (event) => {
    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            },
            body: '',
        };
    }
    
    const order = JSON.parse(event.body || '{}');
    
    const params = {
        TableName: process.env.ORDERS_TABLE,
        Item: {
            id: require('crypto').randomUUID(),
            ...order,
            createdAt: new Date().toISOString(),
            status: 'pending'
        }
    };
    
    try {
        await dynamoDB.put(params).promise();
        
        console.log('Order created successfully', {
            orderId: params.Item.id,
            total: order.total,
            itemCount: order.items ? order.items.length : 0,
            timestamp: params.Item.createdAt
        });
        
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: 'Order created successfully',
                orderId: params.Item.id
            }),
        };
    } catch (error) {
        console.error('Create order error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to create order' }),
        };
    }
};

exports.getOrders = async (event) => {
    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            },
            body: '',
        };
    }
    
    const params = {
        TableName: process.env.ORDERS_TABLE,
        Limit: 100,
        ScanIndexForward: false
    };
    
    try {
        const data = await dynamoDB.scan(params).promise();
        
        console.log('Orders retrieved successfully', {
            orderCount: data.Items ? data.Items.length : 0,
            timestamp: new Date().toISOString()
        });
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data.Items || []),
        };
    } catch (error) {
        console.error('Get orders error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to retrieve orders' }),
        };
    }
};

