# File Uploader
This is a simple application for uploading files written entirely with Typescript. It has two component:
 * React web application using Redux and [ResumableJS](http://www.resumablejs.com/), 
    hosted with [Caddy](https://caddyserver.com/) webserver. Tested with [Jest](https://jestjs.io/) and [Enzyme](https://airbnb.io/enzyme/).
 * NodeJS backend based on [Express](https://expressjs.com/), with runtime typechecking via [io-ts](https://github.com/gcanti/io-ts).
    Tested with [Mocha](https://mochajs.org/) and [supertest](https://github.com/visionmedia/supertest).

## How to run it

### Production mode
You will need [Docker Engine](https://docs.docker.com/engine/) v17.04.0+ and [Docker Compose](https://docs.docker.com/compose/) v1.12.0+.

Run `docker-compose up` in this folder and both services will be built and started up in the docker environment.
 * the UI will be available on `http://localhost` (port 80) by default
 * the backend will be available on `http://localhost:3001` by default

Some folders from the running containers will be mapped to the `data` folder:
```
/data
   /logs ...... log files
   /tmp ....... temporary storage for uploaded chunks
   /uploads ... uploaded files go here 
```
 
All the ports and paths mentioned above can be changed in the `.env` file in this folder 
(changes require `docker-compose down && docker-compose up` to take effect).

### Development mode
If you want to run in in the development node you need **NodeJS** and **npm**.

You have to run the client and server separately:

**Server**
1. go to server folder
2. run `npm install`
3. run `npm start` starts a dev environment

The server will be listening on `localhost:3001`.

**Client**
1. go to client folder
2. run `npm install`
3. run `npm start`

The web application will be available on `http://localhost:3000`.

You can also run tests with `npm run test`.

**Some useful commands for both applications**
-   `npm run test` runs tests
-   `npm run lint` performs typescript linting with [tslint](https://palantir.github.io/tslint/)


