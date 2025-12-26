const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.getUploadUrl = async (event) => {
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
    
    try {
        const { fileName, fileType } = JSON.parse(event.body || '{}');
        
        if (!fileName || !fileType) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'fileName and fileType are required' }),
            };
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(fileType)) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'Invalid file type. Only images are allowed.' }),
            };
        }
        
        const bucketName = process.env.IMAGES_BUCKET || 'dunkin-pos-images-dev';
        const key = `menu-items/${Date.now()}-${fileName}`;
        
        // Generate presigned URL for upload (valid for 5 minutes)
        const params = {
            Bucket: bucketName,
            Key: key,
            ContentType: fileType,
            Expires: 300, // 5 minutes
        };
        
        const uploadUrl = s3.getSignedUrl('putObject', params);
        
        // Generate the public URL (via CloudFront)
        const imageUrl = `https://${process.env.IMAGES_CDN_DOMAIN || 'd1234567890.cloudfront.net'}/${key}`;
        
        console.log('Presigned URL generated', {
            key: key,
            fileType: fileType,
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
            body: JSON.stringify({
                uploadUrl: uploadUrl,
                imageUrl: imageUrl,
                key: key
            }),
        };
    } catch (error) {
        console.error('Get upload URL error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to generate upload URL', details: error.message }),
        };
    }
};

