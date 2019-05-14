var path = require("path");

module.exports = {
    httpServer: {
        port: 3001,
        host: "localhost",
        basePath: "/api",
    },
    fileRepository: {
        fileUploadDirectory: path.resolve(path.join("data", "uploads")),
        temporaryDirectory: path.resolve(path.join("data", "tmp")),
        maxFileSizeInMB: 500
    },
    logging: {
        level: "debug"
    }
};
