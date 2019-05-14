import { FileUploadServiceTestBed } from '../utils/file-upload-service.testbed';
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import { FileChunksGenerator } from '../utils/file-chunks-generator';

describe('FileUploadHttpService features', () => {
    let testBed: FileUploadServiceTestBed;

    beforeEach(async () => {
        testBed = new FileUploadServiceTestBed();
    });

    it('Should be able to upload file in single chunk', async () => {
        const file = Buffer.alloc(40);
        const chunks = new FileChunksGenerator(file, 'foo.txt', 50);

        await testBed.startService();
        await testBed.uploadChunk(chunks.getChunk(1)).expect(OK);
        await testBed.downloadFile('foo.txt')
            .expect(OK)
            .expect(file.toString());

    });

    it('Should be able to upload file made of multiple chunks', async () => {
        const file = Buffer.from('1111222233');
        const fileChunks = new FileChunksGenerator(file, 'foo.txt', 4);

        await testBed.startService();
        await testBed.uploadChunk(fileChunks.getChunk(1)).expect(OK);
        await testBed.uploadChunk(fileChunks.getChunk(2)).expect(OK);
        await testBed.uploadChunk(fileChunks.getChunk(3)).expect(OK);
        await testBed.downloadFile('foo.txt')
            .expect(OK)
            .expect(file.toString());
    });

    it('Should support chunks being sent out of order and redundantly', async () => {
        const file = Buffer.from('111122223333444455');
        const fileChunks = new FileChunksGenerator(file, 'foo.txt', 4);

        await testBed.startService();
        await testBed.uploadChunk(fileChunks.getChunk(5)).expect(OK);
        await testBed.uploadChunk(fileChunks.getChunk(1)).expect(OK);
        await testBed.uploadChunk(fileChunks.getChunk(3)).expect(OK);
        await testBed.uploadChunk(fileChunks.getChunk(2)).expect(OK);
        await testBed.uploadChunk(fileChunks.getChunk(4)).expect(OK);
        await testBed.uploadChunk(fileChunks.getChunk(2)).expect(OK);
        await testBed.downloadFile('foo.txt')
            .expect(OK)
            .expect(file.toString());
    });

    it('Should support all chunks being sent simultaneously', async () => {
        const file = Buffer.from('111122223333444455');
        const fileChunks = new FileChunksGenerator(file, 'foo.txt', 4);

        await testBed.startService();

        await Promise.all([
            testBed.uploadChunk(fileChunks.getChunk(1)).expect(OK),
            testBed.uploadChunk(fileChunks.getChunk(2)).expect(OK),
            testBed.uploadChunk(fileChunks.getChunk(3)).expect(OK),
            testBed.uploadChunk(fileChunks.getChunk(4)).expect(OK),
            testBed.uploadChunk(fileChunks.getChunk(5)).expect(OK)
        ]);
        await testBed.downloadFile('foo.txt')
            .expect(OK)
            .expect(file.toString());
    });

    it('Should support multiple simultaneous chunk uploads for multiple files', async () => {
        const fooFile = Buffer.alloc(8, '1');
        const barFile = Buffer.alloc(8, '2');
        const fooChunks = new FileChunksGenerator(fooFile, 'foo.bin', 4);
        const barChunks = new FileChunksGenerator(barFile, 'bar.bin', 4);

        await testBed.startService();

        await Promise.all([
            await testBed.uploadChunk(fooChunks.getChunk(1)).expect(OK),
            await testBed.uploadChunk(fooChunks.getChunk(2)).expect(OK),
            await testBed.uploadChunk(barChunks.getChunk(1)).expect(OK)
        ]);
        await Promise.all([
            await testBed.uploadChunk(fooChunks.getChunk(3)).expect(OK),
            await testBed.uploadChunk(barChunks.getChunk(2)).expect(OK),
            await testBed.uploadChunk(barChunks.getChunk(3)).expect(OK)
        ]);

        await testBed.downloadFile('foo.bin')
            .expect(OK)
            .expect(fooFile.toString());
        await testBed.downloadFile('bar.bin')
            .expect(OK)
            .expect(barFile.toString());
    });

    it('Should not return the file until all chunks were received', async () => {
        const file = Buffer.from('1111222233');
        const fileChunks = new FileChunksGenerator(file, 'foo.txt', 4);

        await testBed.startService();
        await testBed.uploadChunk(fileChunks.getChunk(1)).expect(OK);
        await testBed.uploadChunk(fileChunks.getChunk(3)).expect(OK);
        await testBed.downloadFile('foo.txt')
            .expect(NOT_FOUND);
    });

    it('Should detect a corrupted chunk in chunk storage', async () => {
        const file = Buffer.from('1111222233');
        const fileChunks = new FileChunksGenerator(file, 'foo.txt', 4);

        await testBed.startService();
        await testBed.uploadChunk(fileChunks.getChunk(1)).expect(OK);
        await testBed.uploadChunk(fileChunks.getChunk(2)).expect(OK);

        const writer = await testBed.chunksRepository.getFileWriter(`.resumable-chunk.foo.txt.2`);
        writer.write('corruption');
        writer.end();

        await testBed.uploadChunk(fileChunks.getChunk(3))
            .expect(INTERNAL_SERVER_ERROR);

        await testBed.downloadFile('foo.txt')
            .expect(NOT_FOUND);
    });

    describe('when maximum file size limit is set to 1000 bytes', () => {
        beforeEach(async () => {
            await testBed.startService({
                maximumFileSizeInBytes: 1000
            });
        });

        it('should be able to upload a 1000 bytes file', async () => {
            const file = Buffer.alloc(1000);
            const fileChunks = new FileChunksGenerator(file, 'fileWith1000bytes.bin', 500);

            await testBed.uploadChunk(fileChunks.getChunk(1)).expect(200);
            await testBed.uploadChunk(fileChunks.getChunk(2)).expect(200);
            await testBed.downloadFile('fileWith1000bytes.bin').expect(200);
        });

        it('should NOT be able to upload a 1001 bytes file', async () => {
            const file = Buffer.alloc(1001);
            const fileChunks = new FileChunksGenerator(file, 'fileWith1001bytes.bin', 500);

            await testBed.uploadChunk(fileChunks.getChunk(1))
                .expect(400)
                .expect(/too large/);
            await testBed.downloadFile('fileWith1001bytes.bin').expect(404);
        });

    });

});
