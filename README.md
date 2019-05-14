# File Uploader
This is a simple application for uploading and downloading files. It has two components:
 * **Client** - A React web application that uses:
    * Redux with [typescript-fsa](https://github.com/aikoven/typescript-fsa), [reselect](https://github.com/reduxjs/reselect) and [redux-saga](https://github.com/redux-saga/redux-saga) for state management
    * The [ResumableJS](http://www.resumablejs.com/) file upload engine
    * [Material-UI](https://material-ui.com/) with some SASS styling for look and feel
    * The [Caddy](https://caddyserver.com/) webserver for hosting
    * [Jest](https://jestjs.io/) with [Enzyme](https://airbnb.io/enzyme/) for testing
 * **Server** - A NodeJS backend that uses:
    * [Express](https://expressjs.com/) for exposing a REST API
    * [busboy](https://github.com/mscdex/busboy) for handling multipart POST requests
    * [io-ts](https://github.com/gcanti/io-ts) for run-time typechecking and request data validation
    * [Mocha](https://mochajs.org/) with [chai](https://www.chaijs.com/) and [supertest](https://github.com/visionmedia/supertest) for testing

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


## Ideas for futher improvement

**Client**

  * pause and resume download
  * list and existing uploaded files on page load and allow deletion
continue uploads on reload
  * more informative UI (speed and upload status, time remainig, stalled connection warning, …)
  * more explicit user actions feedback (via toasts or similar)
  * use custom file upoad DOM listener instead instead of using ResumableJS

**Server**

  * Swagger API documentation
  * CRC checking
  * proper cleanup of dead chunks by the chunk assembler
  * more robustness against corrupted ResumableJS metadata in POST requests
  * support for querying which chunks are already uploaded
  * revive existing chunks upon server restart
