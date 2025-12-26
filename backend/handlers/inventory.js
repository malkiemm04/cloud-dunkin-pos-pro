const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.updateInventory = async (event) => {
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
    
    const itemId = event.pathParameters?.id;
    const updates = JSON.parse(event.body || '{}');
    
    const params = {
        TableName: process.env.INVENTORY_TABLE,
        Key: { id: itemId },
        UpdateExpression: 'SET #quantity = :quantity, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
            '#quantity': 'quantity'
        },
        ExpressionAttributeValues: {
            ':quantity': updates.quantity,
            ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
    };
    
    try {
        const result = await dynamoDB.update(params).promise();
        
        console.log('Inventory updated successfully', {
            itemId: itemId,
            newQuantity: updates.quantity,
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
            body: JSON.stringify(result.Attributes || {}),
        };
    } catch (error) {
        console.error('Update inventory error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to update inventory' }),
        };
    }
};

exports.getInventory = async (event) => {
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
        TableName: process.env.INVENTORY_TABLE,
    };
    
    try {
        const data = await dynamoDB.scan(params).promise();
        
        console.log('Inventory retrieved successfully', {
            itemCount: data.Items.length,
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
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        console.error('Get inventory error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to retrieve inventory' }),
        };
    }
};

exports.createInventory = async (event) => {
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
    
    const { id, name, category, quantity, lowAlert } = JSON.parse(event.body || '{}');
    
    if (!id || !name || quantity === undefined) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Missing required fields: id, name, quantity' }),
        };
    }
    
    const item = {
        id: id,
        name: name,
        category: category || 'General',
        quantity: quantity || 0,
        lowAlert: lowAlert || 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const params = {
        TableName: process.env.INVENTORY_TABLE,
        Item: item
    };
    
    try {
        await dynamoDB.put(params).promise();
        
        console.log('Inventory item created successfully', {
            itemId: id,
            timestamp: new Date().toISOString()
        });
        
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        };
    } catch (error) {
        console.error('Create inventory error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to create inventory item' }),
        };
    }
};

exports.deleteInventory = async (event) => {
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
    
    const itemId = event.pathParameters?.id;
    
    if (!itemId) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Missing item ID' }),
        };
    }
    
    const params = {
        TableName: process.env.INVENTORY_TABLE,
        Key: { id: itemId }
    };
    
    try {
        await dynamoDB.delete(params).promise();
        
        console.log('Inventory item deleted successfully', {
            itemId: itemId,
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
            body: JSON.stringify({ message: 'Inventory item deleted successfully', id: itemId }),
        };
    } catch (error) {
        console.error('Delete inventory error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to delete inventory item' }),
        };
    }
};

