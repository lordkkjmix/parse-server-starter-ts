/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const request = require('request');

class UserService {
  async getUser(userId?: string,username?: string,email?: string) {
    const query = new Parse.Query(Parse.User);
    if(userId){
      query.equalTo("objectId", userId);
    }
    if(username){
      query.equalTo("username", username);
    }
    if(email){
      query.equalTo("email", email);
    }
    return await query.first({ useMasterKey: true });
  }
  async getUserDeviceFcmToken(user: Parse.Object<Parse.Attributes>):Promise<string> {
    const SessionQuery = new Parse.Query(Parse.Session);
    SessionQuery.equalTo("user", user);
    SessionQuery.descending("createdAt");
    return await SessionQuery.first({ useMasterKey: true }).then(
      async (session: Parse.Object) => {
        console.log(session.get("installationId"));
        const InstQuery = new Parse.Query(Parse.Installation);
        InstQuery.equalTo("installationId", session.get("installationId"));
        InstQuery.descending("createdAt");
        return await InstQuery.first({ useMasterKey: true }).then(
          (installation: Parse.Object) => {
            return installation.get("deviceToken");
          })})
  }
  async getUserDeviceInstallationByUserId(userId:string): Promise<Parse.Object<Parse.Attributes>>{
    const SessionQuery = new Parse.Query(Parse.Session);
    const user = await this.getUser(userId);
    SessionQuery.equalTo("user", user);
    SessionQuery.descending("createdAt");
    return await SessionQuery.first({ useMasterKey: true }).then(
      async (session: Parse.Object) => {
        console.log(session.get("installationId"));
        const InstQuery = new Parse.Query(Parse.Installation);
        InstQuery.equalTo("installationId", session.get("installationId"));
        InstQuery.descending("createdAt");
        return await InstQuery.first({ useMasterKey: true }).then(
          (installation: Parse.Object) => {
            return installation;
          })})
  }

  async verificationEmailRequestByUsername(username: string){
    return await this.getUser(null,username,null).then(user=>{
      if(user){
        const options = {
          'method': 'POST',
          'url': `${process.env.PUBLIC_SERVER_URL}/verificationEmailRequest`,
          'headers': {
            'X-Parse-Application-Id': Parse.applicationId,
            'Content-Type': 'application/json',
            'X-Parse-Master-Key':Parse.masterKey
          },
          body: JSON.stringify({
            "email": user.getEmail()
          })
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        request(options, function (error: string, response: { body: any; }) {
          if (error) throw new Error(error);
          console.log(response.body);
        });
      }else{
        throw new Error("user not found");
      }
    });

  }
  async requestPasswordResetByUsername(username: string){
    return await this.getUser(null,username,null).then(user=>{
      if(user){
        const options = {
          'method': 'POST',
          'url': `${process.env.PUBLIC_SERVER_URL}/requestPasswordReset`,
          'headers': {
            'X-Parse-Application-Id': Parse.applicationId,
            'Content-Type': 'application/json',
            'X-Parse-Master-Key':Parse.masterKey
          },
          body: JSON.stringify({
            "email": user.getEmail()
          })
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        request(options, function (error: string, response: { body: any; }) {
          if (error) throw new Error(error);
          console.log(response.body);
        });
      }else{
        throw new Error("user not found");
      }
    });
  }
  async updateUserBalance(userId:string, amount:number){
    const user:Parse.User<Parse.Attributes> = await this.getUser(userId);
    if(user){
      const currentBalance:number =  user.get("balance");
      const newUserBalance:number = currentBalance + (amount);
      user.set("balance", newUserBalance);
      return await user.save(null,{useMasterKey: true });
    }
    else
      throw new Error("user not found");
  }
}
export default UserService;
