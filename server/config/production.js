module.exports = {
    httpServer: {
        port: 3001,
        host: "localhost",
        basePath: "/api",
    },
    fileRepository: {
        temporaryDirectory: "/usr/src/app/data/tmp",
        fileUploadDirectory: "/usr/src/app/data/uploads",
        maxFileSizeInMB: 500
    },
    logging: {
        level: "debug"
    }
};
