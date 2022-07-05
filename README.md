# Parse Server Full Starter in TypeScript

## Available Features

* Authentification
* Push Notificaton

### Launch server MongoDB

* After official MongoDB Installation and dotEnv service
```bash
$ mongod --dbpath=data
$ npm run start-local
```

### Launch with mongodb-runner

```bash
$ npm install -g mongodb-runner
$ mongodb-runner start
$ npm install dotenv
$ npm run start-local
```
### Input your own code

* Set your dotenv/pm2 env variable or default will be used
* You can edit all files in /src (all files in /dist will be replace on launch)
