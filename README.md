# File Uploader
This is a simple file uploader application which is written in Typescript.

## How to run it

### Development mode
If you want to run in in the development node you need **node** and **npm**.

And then you have to to run **client** and **frontend** application.

**Client**
1. go to client folder
2. run `npm install`
3. run `npm start` starts a dev environment (on the localhost:3000)


**Server**
1. go to server folder
2. run `npm install`
3. run `npm start` starts a dev environment (on the localhost:3001)


Some useful commands for both applications:
-   `npm run test` runs tests
-   `npm run lint` performs typescript linting with [tslint](https://palantir.github.io/tslint/)

### Production mode
You will need a **docker engine 17.04.0+** and **docker compose support**.

Then, you can just type `docker-compose up` in the root folder and both service will run in the docker environment.
