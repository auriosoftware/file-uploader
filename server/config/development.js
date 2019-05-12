var path = require("path");

module.exports = {
    httpServer: {
        port: 3001,
        host: "0.0.0.0",
        basePath: "/api",
    },
    fileRepository: {
        fileUploadDirectory: path.resolve(path.join('data', 'uploads')),
        temporaryDirectory: path.resolve(path.join('data', 'tmp')),
        maxFileSizeInMB: 1
    },
    logging: {
        level: "debug"
    }
};
