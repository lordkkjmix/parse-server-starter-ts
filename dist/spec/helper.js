"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_runner_1 = require("./utils/test-runner");
beforeAll(async () => {
    await (0, test_runner_1.startParseServer)().catch((e) => console.log(e));
}, 100 * 60 * 2);
afterAll(async () => {
    await (0, test_runner_1.dropDB)();
    await (0, test_runner_1.stopParseServer)();
});
