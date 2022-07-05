const express = require('express');
import { Request, Response } from 'express';
const ParseServer = require('parse-server').ParseServer;
const path = require('path');
const ParseDashboard = require('parse-dashboard');
const sgMail = require('@sendgrid/mail');

const SERVER_PORT = process.env.PORT || 8080;
const SERVER_HOST = process.env.HOST || 'localhost';
const APP_ID = process.env.APP_ID || '';
const MASTER_KEY = process.env.MASTER_KEY || '';
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/test';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const MOUNT_PATH = process.env.PARSE_MOUNT || '/parse';
const JAVASCRIPT_KEY = process.env.JAVASCRIPT_KEY || '';
const REST_API_KEY = process.env.REST_API_KEY || '';
const CLIENT_KEY = process.env.CLIENT_KEY || '';
const SERVER_NAME = process.env.SERVER_NAME || '';
const DASHBOARD_HTTPS = process.env.DASHBOARD_HTTPS || true;
const DOT_NET_KEY = process.env.DOT_NET_KEY || '';
const FILE_KEY = process.env.FILE_KEY || '';
const CLOUD_CODE_MAIN = process.env.CLOUD_CODE_MAIN || '/cloud/main.js';
const SENDGRID_KEY = process.env.SENDGRID_KEY || '';
const SENDGRID_FROM_ADDRESS = process.env.SENDGRID_FROM_ADDRESS || '';
const ANDROID_PUSH_API_KEY = process.env.ANDROID_PUSH_API_KEY || '';
const ANDROID_PUSH_SENDER_ID = process.env.ANDROID_PUSH_SENDER_ID || '';
const IOS_PUSH_KEY_ID = process.env.IOS_PUSH_KEY_ID || '';
const IOS_PUSH_TEAM_ID = process.env.IOS_PUSH_TEAM_ID || '';
const ENCRYPT_DASHBOARD_PASS = process.env.ENCRYPT_DASHBOARD_PASS || true;
const DASHBOARD_SESSION_KEY = process.env.DASHBOARD_SESSION_KEY || "dashboard_default_session_token";
const SERVER_URL = process.env.SERVER_URL || `http://${SERVER_HOST}:${SERVER_PORT}${MOUNT_PATH}`;
const PUBLIC_SERVER_URL = process.env.PUBLIC_SERVER_URL || SERVER_URL;
const IOS_NOTIFICATION_TOPIC = process.env.IOS_NOTIFICATION_TOPIC || "";
const DASHBOARD_USER = process.env.DASHBOARD_USER || "user";
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || "12345";
const DASHBOARD_USER1 = process.env.DASHBOARD_USER1;
const DASHBOARD_PASS1 = process.env.DASHBOARD_PASS1;
const VERIFY_USER_EMAILS = process.env.VERIFY_USER_EMAILS || false;
const PREVENT_LOGIN_WITH_UNVERIFIED_EMAIL  = process.env.PREVENT_LOGIN_WITH_UNVERIFIED_EMAIL || false;
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));
const filePath = (file:string) => path.resolve(__dirname, '../spec/templates/', file);
const notificationKeyFilePath = (file:string) => path.resolve(__dirname, '../spec/keys/', file);
sgMail.setApiKey(SENDGRID_KEY);
if (!DATABASE_URI) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
const PushAdapter = require('@parse/push-adapter').default;
const pushOptions = {
  android: {  apiKey: ANDROID_PUSH_API_KEY, senderId:Number(ANDROID_PUSH_SENDER_ID)},
  ios: {
    token: {
      key: notificationKeyFilePath('AuthKey_FCMKEY.p8'),
      keyId: IOS_PUSH_KEY_ID,
      teamId: IOS_PUSH_TEAM_ID
    },
    topic: IOS_NOTIFICATION_TOPIC,
    production: IS_DEVELOPMENT
  }
}
const config = {
  databaseURI: DATABASE_URI,
  cloud: path.resolve(__dirname + CLOUD_CODE_MAIN),
  appId: APP_ID,
  masterKey: MASTER_KEY,
  javascriptKey: JAVASCRIPT_KEY,
  restAPIKey: REST_API_KEY,
  clientKey: CLIENT_KEY,
  serverURL: SERVER_URL,
  dotNetKey: DOT_NET_KEY,
  fileKey: FILE_KEY,
  appName: SERVER_NAME,
  publicServerURL: PUBLIC_SERVER_URL,
  verifyUserEmails:VERIFY_USER_EMAILS,
  preventLoginWithUnverifiedEmail:PREVENT_LOGIN_WITH_UNVERIFIED_EMAIL,
  emailAdapter: !test
    ? { module: 'parse-server-api-mail-adapter',
      options: {
        sender: SENDGRID_FROM_ADDRESS,
        templates: {
          passwordResetEmail: {
            subjectPath: filePath('password_reset_email_subject.txt'),
            textPath: filePath('password_reset_email.txt'),
            htmlPath: filePath('password_reset_email.html')
          },
          verificationEmail: {
            subjectPath: filePath('verification_email_subject.txt'),
            textPath: filePath('verification_email.txt'),
            htmlPath: filePath('verification_email.html')
          },
          customEmail: {
            subjectPath: filePath('verification_email_subject.txt'),
            textPath: filePath('verification_email.txt'),
            htmlPath: filePath('verification_email.html')
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiCallback: async (data:any/* ,{, locale  }*/) =>{
          const customPayload = {
            from: data.payload.from,
            to: data.payload.to,
            subject: data.payload.subject,
            html: data.payload.html,
          };
          await sgMail.send(customPayload);
        }
      }}
    : '',
  push: !test
    ? {
      adapter: new PushAdapter(pushOptions),
    }
    : '',
  liveQuery: {
    classNames: ['_User',],
  },
};
const app = express();
// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '../public')));
if (!test) {
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
        publicServerURL:PUBLIC_SERVER_URL,
        //iconName: "appIcon.png", //to uncomment, add app icon in folder "/icons"
        supportedPushLocales: ["en", "fr"]
      },
    ],
    iconsFolder: "icons",
    users: [
      {
        user:DASHBOARD_USER,
        pass:DASHBOARD_PASS,
      },
      {
        user:DASHBOARD_USER1,
        pass:DASHBOARD_PASS1,
      },
    ],
    // useEncryptedPasswords: ENCRYPT_DASHBOARD_PASS, //Enable it if you whant to encrypt dashboard password. available encrypt is Bcrypt
    cookieSessionSecret:DASHBOARD_SESSION_KEY,
    //trustProxy:true
  },
  { allowInsecureHTTP: DASHBOARD_HTTPS }
);
app.use(
  '/dashboard',
  dashboard
);
app.get('/', function(request: Request, res: Response) {
  res.status(200).send("Il n'y a de vent favorable que pour celui qui sait où il va.");
});

if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(SERVER_PORT, function() {
    console.log(
      `${SERVER_NAME} is now running in ${IS_DEVELOPMENT ? "dev" : "prod"} mode on http://${SERVER_HOST}:${SERVER_PORT}${MOUNT_PATH}`
    );
  });
  ParseServer.createLiveQueryServer(httpServer);
}
module.exports = {
  app,
  config,
};
