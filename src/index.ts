
import express, { Request, Response } from 'express';
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const http = require('http');
const nodemailer = require("nodemailer");
const SERVER_PORT = process.env.PORT || 8080;
const SERVER_HOST = process.env.HOST || 'localhost';
const APP_ID = process.env.APP_ID || 'default';
const MASTER_KEY = process.env.MASTER_KEY || 'change_me';
const CLIENT_KEY = process.env.CLIENT_KEY || 'client_key';
const CLOUD_CODE_MAIN = process.env.CLOUD_CODE_MAIN || '/cloud/main.js';
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/test';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const MOUNT_PATH = process.env.PARSE_MOUNT || '/parse';
const SERVER_NAME = process.env.SERVER_NAME || '';
const DASHBOARD_HTTPS = process.env.DASHBOARD_HTTPS || false;
const SERVER_URL = process.env.SERVER_URL || `http://${SERVER_HOST}:${SERVER_PORT}${MOUNT_PATH}`;
const LIVEQUERY_CLASSE_NAMES: String[] = (process.env.LIVEQUERY_CLASSE_NAMES) as unknown as String[] || <String[]>["_User"];
const PUBLIC_SERVER_URL = process.env.PUBLIC_SERVER_URL || SERVER_URL;
const DASHBOARD_USER = process.env.DASHBOARD_USER || "user";
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || "pass";
const PARSE_SERVER_DIRECT_ACCESS = process.env.PARSE_SERVER_DIRECT_ACCESS || true;
const TESTING = process.env.TESTING || false;
//Email config
const VERIFY_USER_EMAILS = process.env.VERIFY_USER_EMAILS || false;
const PREVENT_LOGIN_WITH_UNVERIFIED_EMAIL = process.env.PREVENT_LOGIN_WITH_UNVERIFIED_EMAIL || false;
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SECURED_SMTP = process.env.SECURED_SMTP || false;
const IOS_NOTIFICATION_TOPIC = process.env.IOS_NOTIFICATION_TOPIC || "";
const FROM_ADDRESS = process.env.NO_REPLY_ADDRESS || 'sender@exemple.com';
const NO_REPLY_ADDRESS = process.env.NO_REPLY_ADDRESS || 'no_reply@exemple.com';

//Push Notification setting
const ANDROID_PUSH_API_KEY = process.env.ANDROID_PUSH_API_KEY || '';
const ANDROID_PUSH_SENDER_ID = process.env.ANDROID_PUSH_SENDER_ID || '000000';
const IOS_PUSH_KEY_ID = process.env.IOS_PUSH_KEY_ID || '';
const IOS_PUSH_TEAM_ID = process.env.IOS_PUSH_TEAM_ID || 'DEFAULT';
const filePath = (file: string) => path.resolve(__dirname, '../files/templates/', file);
const notificationKeyFilePath = (file: string) => path.resolve(__dirname, '../files/keys/', file);
const Country = {
    className: "Country",
    fields: {
        name: { type: "String", required: true },
    },
    classLevelPermissions: {
        find: { requiresAuthentication: true },
        count: { requiresAuthentication: true },
        get: { requiresAuthentication: true },
        // An empty object means that only master key is authorized to manage countries
        update: {},
        create: {},
        delete: {},
    },
};
let transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SECURED_SMTP ? 465 : 587,
    secure: SECURED_SMTP,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});
const PushAdapter = require('@parse/push-adapter').default;
const pushOptions = {
    android: { apiKey: ANDROID_PUSH_API_KEY, senderId: Number(ANDROID_PUSH_SENDER_ID) },
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
const emailAdapterConfig = {
    module: 'parse-server-api-mail-adapter',
    options: {
        sender: FROM_ADDRESS,
        templates: {
            passwordResetEmail: {
                subjectPath: filePath('password_reset_email_subject.txt'),
                textPath: filePath('password_reset_email.txt'),
                htmlPath: filePath('password_reset_email.html')
            },
            verificationEmail: {
                subjectPath: filePath('verify_email_subject.txt'),
                textPath: filePath('verify_email.txt'),
                htmlPath: filePath('verify_email.html')
            },
            customEmail: {
                subjectPath: filePath('custom_email_subject.txt'),
                textPath: filePath('custom_email.txt'),
                htmlPath: filePath('custom_email.html'),
                // Placeholders are filled into the template file contents.
                // For example, the placeholder `{{appName}}` in the email
                // will be replaced the value defined here.
                placeholders: {
                    appName: SERVER_NAME
                },
                // Extras to add to the email payload that is accessible in the
                // `apiCallback`.
                extra: {
                    replyTo: NO_REPLY_ADDRESS
                },
                // A callback that makes the Parse User accessible and allows
                // to return user-customized placeholders that will override
                // the default template placeholders. It also makes the user
                // locale accessible, if it was returned by the `localeCallback`,
                // and the current placeholders that will be augmented.

                /*placeholderCallback: async ({ user, locale, placeholders }: { user: any, locale: any, placeholders: any }) => {
                    return {
                        phone: user.get('phone'),
                    };
                },*/

                // A callback that makes the Parse User accessible and allows
                // to return the locale of the user for template localization.

                /*localeCallback: async ({ user }: { user: any }) => {
                    return user.get('locale');
                }*/
            }
        },
        apiCallback: async ({ payload, locale }: { payload: any, locale: any }) => {
            // send mail with defined transport object
            //You can use other mail service
            await transporter.sendMail({
                from: payload.from, // '"Fred Foo 👻" <foo@example.com>' sender address
                to: payload.to, //"bar@example.com, baz@example.com", list of receivers
                subject: payload.subject, //"Hello ✔", Subject line
                //text: "Hello world?", // use plain text body
                html: payload.html, // html body
            }).then((info: any) => console.log("Email sent: %s", info.messageId)).catch(console.error);
        }
    }
}
export const app = express();
export const config: Object = {
    databaseURI: DATABASE_URI,
    cloud: path.resolve(__dirname + CLOUD_CODE_MAIN),
    appId: APP_ID,
    masterKey: MASTER_KEY,
    //javascriptKey: JAVASCRIPT_KEY,
    //restAPIKey: REST_API_KEY,
    //clientKey: CLIENT_KEY,
    //dotNetKey: DOT_NET_KEY,
    fileKey: CLIENT_KEY,
    appName: SERVER_NAME,
    publicServerURL: PUBLIC_SERVER_URL,
    serverURL: SERVER_URL,
    directAccess: PARSE_SERVER_DIRECT_ACCESS,
    enforcePrivateUsers: true,
    allowClientClassCreation: false,
    verifyUserEmails: VERIFY_USER_EMAILS,
    preventLoginWithUnverifiedEmail: PREVENT_LOGIN_WITH_UNVERIFIED_EMAIL,
    // Define schemas of Parse Server
    // For more knowledge about schemas: https://docs.parseplatform.org/defined-schema/guide/#getting-started
    schema: {
        definitions: [Country],
        // If set to `true`, the Parse Server API for schema changes is disabled and schema 
        // changes are only possible by redeployingParse Server with a new schema definition
        lockSchemas: true,
        // If set to `true`, Parse Server will automatically delete non-defined classes from
        // the database; internal classes like `User` or `Role` are never deleted.
        strict: true,
        // If set to `true`, a field type change will cause the field including its data to be
        // deleted from the database, and then a new field to be created with the new type
        recreateModifiedFields: false,
        // If set to `true`, Parse Server will automatically delete non-defined class fields;
        // internal fields in classes like User or Role are never deleted.
        deleteExtraFields: false,
    },
    serverStartComplete: () => {
        // Parse Server is ready with up-to-date schema
        app.get("/ready", (req: any, res: any) => {
            res.send("true");
        });
    },
    liveQuery: {
        classNames: LIVEQUERY_CLASSE_NAMES,
    },
    emailAdapter: !TESTING
        ? emailAdapterConfig
        : '',
    push: !TESTING && (ANDROID_PUSH_API_KEY || IOS_PUSH_KEY_ID)
        ? {
            adapter: new PushAdapter(pushOptions),
        }
        : '',
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey
if (!DATABASE_URI) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '../public')));

if (!TESTING) {
    const api = new ParseServer(config);
    app.use(MOUNT_PATH, api);
}
//Parse DashBoard
//You can remove and use in other instance
const dashboard = new ParseDashboard(
    {
        apps: [
            {
                serverURL: MOUNT_PATH,
                appId: APP_ID,
                masterKey: MASTER_KEY,
                appName: SERVER_NAME,
                publicServerURL: PUBLIC_SERVER_URL,
                iconName: "parse-logo.png", //to uncomment, add app icon in folder "/icons"
                supportedPushLocales: ["en", "fr"]
            },
        ],
        iconsFolder: "public/assets/images",
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
