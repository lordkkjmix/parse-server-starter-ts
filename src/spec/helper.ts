import { startParseServer, stopParseServer, dropDB } from './utils/test-runner';
beforeAll(async () => {
  await startParseServer().catch((e) => console.log(e));
}, 100 * 60 * 2);
afterAll(async () => {
  await dropDB();
  await stopParseServer();
});