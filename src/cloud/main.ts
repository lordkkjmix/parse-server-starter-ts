import UserService from "../cloud/user/user.service";
import NotificationService from "../cloud/notification/notification.service";

Parse.Cloud.define(
  "verificationEmailRequestByUsername",
  (Parse.User,
  async (req: any) => {
    const user = req.user;
    let username: string;
    const params = req.params;
    if (params && params.username) {
      username = params.username;
    } else {
      username = user ? user.get("username") : user;
    }
    return await new UserService().verificationEmailRequestByUsername(username);}),
  {
    fields: {
      username: {
        type: String,
        error: "username is required",
        options: (val: string) => {
          return val !== "";
        },
      }
    },
  }
);
Parse.Cloud.define(
  "requestPasswordResetByUsername",
  (Parse.User,
  async (req: any) => {
    const user = req.user;
    let username: string;
    const params = req.params;
    if (params && params.username) {
      username = params.username;
    } else {
      username = user ? user.get("username") : user;
    }
    return await new UserService().requestPasswordResetByUsername(username);}),
  {
    fields: {
      username: {
        type: String,
        error: "username is required",
        options: (val: string) => {
          return val !== "";
        },
      }
    },
  }
);

