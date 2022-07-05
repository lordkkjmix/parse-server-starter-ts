import UserService from "../user/user.service";

class NotificationService {
  async sendNotificationToUserByUserId(userId: string, title:string, message:string,):Promise<boolean> {
    const SessionQuery = new Parse.Query(Parse.Session);
    const user = await  new UserService().getUser(userId);
    SessionQuery.equalTo("user", user);
    SessionQuery.descending("createdAt");
    return await SessionQuery.first({ useMasterKey: true }).then(
      async (session: Parse.Object) => {
        if(session){
          const InstQuery = new Parse.Query(Parse.Installation);
          InstQuery.equalTo("installationId", session.get("installationId"));
          InstQuery.descending("createdAt");
          return Parse.Push.send({
            where: InstQuery,
            data: {
              data:{
              },
              alert:message,
              title:title,
              notification:{
                title:title,
                body:message
              },
              content_available:1,
              priority:10
            },
          }, { useMasterKey: true })
            .then(function() {
              return true;
            }, function(error) {
              console.log(error);
              return false;
            });
        }
        throw new Error("user session not found to send notification");
      });
  }
}
export default NotificationService;
