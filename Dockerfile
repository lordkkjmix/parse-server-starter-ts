FROM node:latest
LABEL container_name="parse-starter-app"
LABEL version="1.0"
RUN mkdir app

ADD . /app
WORKDIR /app
RUN npm install

ENV PORT 1337
ENV APP_ID defaultAppId
ENV MASTER_KEY 12345678
ENV DATABASE_URI postgres://postgres:12345678@172.17.0.3:5432/parse-starter-app?ssl=false
ENV SERVER_NAME Jeudi Server
ENV DASHBOARD_HTTPS false

# Optional (default : 'app/cloud/main.js')
#ENV CLOUD_CODE_MAIN app/dist/cloud/main.js

# Optional (default : '/app')
ENV PARSE_MOUNT /api/v1.0

EXPOSE 1337

VOLUME /app
RUN npx tsc
#Production
#RUN rm -rf src
#CMD [ "npm", "start" ]
CMD [ "npm", "run", "dev" ]
