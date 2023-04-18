const express = require('express');
import { Request, Response } from 'express';
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const http = require('http');
const SERVER_PORT = process.env.PORT || 8080;
const SERVER_HOST = process.env.HOST || 'localhost';
const APP_ID = process.env.APP_ID || '';
const MASTER_KEY = process.env.MASTER_KEY || '';
const CLOUD_CODE_MAIN = process.env.CLOUD_CODE_MAIN || '/cloud/main.js';
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/test';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const MOUNT_PATH = process.env.PARSE_MOUNT || '/parse';
const SERVER_NAME = process.env.SERVER_NAME || '';
const DASHBOARD_HTTPS = process.env.DASHBOARD_HTTPS || false;
const SERVER_URL = process.env.SERVER_URL || `http://${SERVER_HOST}:${SERVER_PORT}${MOUNT_PATH}`;
const LIVEQUERY_CLASSE_NAMES: String[] = (process.env.LIVEQUERY_CLASSE_NAMES) as unknown as String[] || <String[]>[];
const PUBLIC_SERVER_URL = process.env.PUBLIC_SERVER_URL || SERVER_URL;
const DASHBOARD_USER = process.env.DASHBOARD_USER || "user";
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || "12345";
const PARSE_SERVER_DIRECT_ACCESS = process.env.PARSE_SERVER_DIRECT_ACCESS || true;
const TESTING = process.env.TESTING || false;
export const config: Object = {
    databaseURI: DATABASE_URI,
    cloud: path.resolve(__dirname + CLOUD_CODE_MAIN),
    appId: APP_ID,
    masterKey: MASTER_KEY,
    serverURL: SERVER_URL,
    directAccess: PARSE_SERVER_DIRECT_ACCESS,
    enforcePrivateUsers: true,
    allowClientClassCreation: false,
    liveQuery: {
        classNames: LIVEQUERY_CLASSE_NAMES,
    },
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey
if (!DATABASE_URI) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}
export const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '../public')));

if (!TESTING) {
    const api = new ParseServer(config);
    app.use(MOUNT_PATH, api);
}
//Parse DashBoard
const dashboard = new ParseDashboard(
    {
        apps: [
            {
                serverURL: MOUNT_PATH,
                appId: APP_ID,
                masterKey: MASTER_KEY,
                appName: SERVER_NAME,
                publicServerURL: PUBLIC_SERVER_URL,
                //iconName: "appIcon.png", //to uncomment, add app icon in folder "/icons"
                supportedPushLocales: ["en", "fr"]
            },
        ],
        // iconsFolder: "icons",
        users: [
            {
                user: DASHBOARD_USER,
                pass: DASHBOARD_PASS,
            }
        ],
    },
    { allowInsecureHTTP: DASHBOARD_HTTPS }
);
app.use(
    '/dashboard',
    dashboard
);
app.get('/', (request: Request, res: Response) => {
    res.status(200).send("I dream of being a website.  Please star the parse-server repo on GitHub!");
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', (request: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/test.html'));
});


if (!TESTING) {
    const httpServer = http.createServer(app);
    httpServer.listen(SERVER_PORT, () => {
        console.log(
            `${SERVER_NAME} is now running in ${IS_DEVELOPMENT ? "dev" : "prod"} mode on http://${SERVER_HOST}:${SERVER_PORT}${MOUNT_PATH}`
        );
    });
    ParseServer.createLiveQueryServer(httpServer);
}
module.exports = {
    app, config
}