Parse.Cloud.define(
    "hello",
    (Parse.User,
        async (req: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) => {
            const user = req.user;
            const params = req.params;
            return 'Hi';

        }),
);

Parse.Cloud.define('asyncFunction', async req => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // req.log.info(req);
    return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
    // throw new Parse.Error(9001, 'Saving test objects is not available.');
});
