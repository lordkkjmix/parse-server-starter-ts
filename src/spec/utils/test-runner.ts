const http = require('http');
const ParseServer = require('parse-server').ParseServer;
import { app, config } from '../../index';
export const dropDB = async (): Promise<void> => {
  await Parse.User.logOut();
  if ('database' in app) {
    return await (app.database as any).deleteEverything(true);
  }
};


let parseServerState: any;

/**
 * Starts the ParseServer instance
 * @param {Object} parseServerOptions Used for creating the `ParseServer`
 * @return {Promise} Runner state
 */
export async function startParseServer() {
  if ("databaseAdapter" in config) {
    delete config.databaseAdapter;
  }
  const parseServerOptions = Object.assign(config, {
    databaseURI: 'mongodb://localhost:27017/parse-test',
    masterKey: 'test',
    javascriptKey: 'test',
    appId: 'test',
    port: 30001,
    mountPath: '/test',
    serverURL: `http://localhost:30001/test`,
    logLevel: 'error',
    silent: true,
  });
  const parseServer = new ParseServer(parseServerOptions);
  //await parseServer.start();
  app.use(parseServerOptions.mountPath, parseServer);
  const httpServer = http.createServer(app);
  await new Promise(resolve => httpServer.listen(parseServerOptions.port, resolve));
  Object.assign(parseServerState = {}, {
    parseServer,
    httpServer,
    expressApp: app,
    parseServerOptions,
  });
  return parseServerOptions;
}

/**
 * Stops the ParseServer instance
 * @return {Promise}
 */
export async function stopParseServer() {
  await new Promise(resolve => parseServerState.httpServer.close(resolve));
  parseServerState = {};
}