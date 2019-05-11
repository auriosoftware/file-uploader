import { FileUploadServiceTestBed } from '../utils/file-upload-service.testbed';
import * as crypto from 'crypto';
import { NOT_FOUND, OK } from 'http-status-codes';

describe('FileUploadHttpService features', () => {
    let testBed: FileUploadServiceTestBed;

    beforeEach(async () => {
        testBed = new FileUploadServiceTestBed();
    });

    it('Should be able to upload file', async () => {
        await testBed.startService();
        await testBed.uploadFile('test', Buffer.alloc(1000))
            .expect(200);
    });

    describe('when text file "foo.txt" was successfully uploaded', async () => {
        const fileContent = 'samplecontent';

        beforeEach(async () => {
            await testBed.startService();
            await testBed.uploadFile('foo.txt', Buffer.from(fileContent))
                .expect(200);
        });

        it('should be available for download', async () => {
            await testBed.request()
                .get('/v1/files/foo.txt')
                .expect(200)
                .expect('Content-Disposition', 'attachment; filename="foo.txt"')
                .expect(fileContent);
        });
    });

    describe('when binary file "foo.bin" was successfully uploaded', async () => {
        const fileContent = crypto.randomBytes(1000);

        beforeEach(async () => {
            await testBed.startService();
            await testBed.uploadFile('foo.bin', Buffer.from(fileContent))
                .expect(200);
        });

        it('should be available for download', async () => {
            await testBed.request()
                .get('/v1/files/foo.bin')
                .expect(200)
                .expect('Content-Disposition', 'attachment; filename="foo.bin"')
                .expect((response) => {
                    if (response.text !== fileContent.toString()) throw new Error('Unexpected file');
                });
        });
    });

    describe('when uploading request contains multiple files', async () => {
        it('should only upload the first file and ignore the rest', async () => {
            const file1 = Buffer.from('f1content');
            const file2 = Buffer.from('f2content');

            await testBed.startService();
            await testBed.request()
                .post('/v1/files')
                .set('Content-Type', 'multipart\/form-data')
                .attach('file1', file1, { filename: 'f1' })
                .attach('file2', file2, { filename: 'f2' })
                .expect(200);

            await testBed.downloadFile('f1').expect(OK).expect('f1content');
            await testBed.downloadFile('f2').expect(NOT_FOUND);
        });
    });

    describe('when maximum file size limit is set to 1000 bytes', () => {
        beforeEach(async () => {
            await testBed.startService({
                maximumFileSizeInBytes: 1000
            });
        });

        it('should be able to upload a 1000 bytes file', async () => {
            await testBed.uploadFile('fileWith1000bytes.bin', Buffer.alloc(1000))
                .expect(200);
        });

        it('should NOT be able to upload a 1001 bytes file', async () => {
            await testBed.uploadFile('fileWith1001bytes.bin', Buffer.alloc(1001))
                .expect(400)
                .expect(/exceeds maximum allowed size/);
        });

    });

});
