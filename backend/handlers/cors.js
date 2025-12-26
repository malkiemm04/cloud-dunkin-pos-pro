/**
 * Generic CORS handler for OPTIONS preflight requests
 * This ensures all OPTIONS requests return proper CORS headers
 */
exports.handleOptions = async (event) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Max-Age': '86400', // 24 hours
        },
        body: '',
    };
};

