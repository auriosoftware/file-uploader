import { FileUploadServiceTestBed } from '../utils/file-upload-service.testbed';
import { NOT_FOUND, SERVICE_UNAVAILABLE } from "http-status-codes";
import { expect } from 'chai';

describe('FileUploadHttpService lifecycle', () => {

    let testBed: FileUploadServiceTestBed;

    beforeEach(async () => {
        testBed = new FileUploadServiceTestBed();
    });

    it ('should not be able to start the service when it is already running', async ()=> {
        await testBed.startService();
        return expect(testBed.startService()).to.be.rejectedWith(Error, /Cannot start/)
    });

    describe('while waiting for file repository to initialize', () => {
        beforeEach(async () => {
            testBed.startService({
                getFileRepository: () => new Promise(() => {
                })
            }).catch();
        });

        it('should not handle requests', async () => {
            await testBed.uploadFile('foo', Buffer.alloc(1))
                .expect(NOT_FOUND);
        });
    });

    describe('while shutting down service and waiting for file repository cleanup', () => {
        beforeEach(async () => {
            testBed.fileRepository.cleanup = () => new Promise(() => {});

            await testBed.startService();
            testBed.stopService().catch();
        });

        it('should not handle requests', async () => {
            await testBed.uploadFile('foo', Buffer.alloc(1))
                .expect(SERVICE_UNAVAILABLE);
        });
    })
});
