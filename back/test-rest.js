const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const path = require('path');

const test = async () => {
    try {
        console.log("Testing Firestore via REST API...");
        
        const auth = new GoogleAuth({
            keyFile: 'C:/Users/Asus/Desktop/express-erp-a764b-firebase-adminsdk-fbsvc-45f9590745.json',
            scopes: ['https://www.googleapis.com/auth/datastore']
        });

        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const token = tokenResponse.token;

        const projectId = 'express-erp-a764b';
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/test?documentId=rest_test`;

        console.log("Attempting REST write...");
        const response = await axios.post(url, {
            fields: {
                msg: { stringValue: 'Hello from REST' },
                time: { stringValue: new Date().toISOString() }
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("REST Success!", response.data);
        process.exit(0);
    } catch (err) {
        console.error("REST test failed:", err.response ? err.response.data : err.message);
        process.exit(1);
    }
};

test();
