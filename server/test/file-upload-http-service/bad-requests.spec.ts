import { FileUploadServiceTestBed } from '../utils/file-upload-service.testbed';
import { FileChunksGenerator } from '../utils/file-chunks-generator';

describe('FileUploadHttpService bad requests handling', () => {

    let testBed: FileUploadServiceTestBed;

    const testFile = Buffer.from('111122223333');
    const testChunk = new FileChunksGenerator(testFile, 'foo.txt', 4).getChunk(1);

    beforeEach(async () => {
        testBed = new FileUploadServiceTestBed();
        await testBed.startService();
    });

    it('GET /v1/invalid should return 404', async () => {
        await testBed.request()
            .get('/v1/huh')
            .expect(404)
            .expect(/Cannot GET/);
    });

    it('GET /v1/files should return 404', async () => {
        await testBed.request()
            .get('/v1/files')
            .expect(404)
            .expect(/Cannot GET/);
    });

    it('GET /v1/files/test should return 404 when no such file was uploaded', async () => {
        await testBed.request()
            .get('/v1/files/test')
            .expect(404)
            .expect(/File not found: "test"/);
    });

    it('POST /v1/files lacking content type should return 400', async () => {
        await testBed.request()
            .post('/v1/files')
            .send({ some: 'body' })
            .expect(400)
            .expect(/expected multipart\/form-data/);
    });

    it('POST /v1/files with invalid content type should return 400', async () => {
        await testBed.request()
            .post('/v1/files')
            .set('Content-Type', 'application/json')
            .send({ some: 'body' })
            .expect(400)
            .expect(/expected multipart\/form-data/);
    });

    it('POST /v1/files without resumablejs arguments should return 400', async () => {
        await testBed.request()
            .post('/v1/files')
            .set('Content-Type', 'multipart\/form-data')
            .expect(400)
            .expect(/Invalid arguments/);
    });

    it('POST /v1/files with no "file" fields should return 400', async () => {

        await testBed.request()
            .post('/v1/files')
            .set('Content-Type', 'multipart\/form-data')
            .query(testChunk.queryParams)
            .field('nope', 'lol')
            .expect(400)
            .expect(/no file found/);
    });

    it('POST /v1/files with "file" field containing string should return 400', async () => {
        await testBed.request()
            .post('/v1/files')
            .set('Content-Type', 'multipart\/form-data')
            .query(testChunk.queryParams)
            .field('file', 'somestring')
            .expect(400)
            .expect(/no file found/);
    });
});
