class ConfigService {
  // eslint-disable-next-line @typescript-eslint/ban-types
  async getConfig(): Promise<{configField: number,}> {
    return await Parse.Config.get({ useMasterKey: true }).then(
      (config) => {
        const configField = config.get(
          "configField"
        );
        return {
          configField,
        };
      },
      function(error) {
        throw error;
      }
    );
  }
}
export default ConfigService;
