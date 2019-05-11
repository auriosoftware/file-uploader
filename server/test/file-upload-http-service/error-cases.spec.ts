import { FileUploadServiceTestBed } from '../utils/file-upload-service.testbed';

describe('FileUploadHttpService bad requests handling', () => {

    let testBed: FileUploadServiceTestBed;

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
            .expect(/No such file: test/);
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

    it('POST /v1/files with no form-data fields should return 400', async () => {
        await testBed.request()
            .post('/v1/files')
            .set('Content-Type', 'multipart\/form-data')
            .expect(400)
            .expect(/Boundary not found/);
    });

    it('POST /v1/files with no "file" fields should return 400', async () => {
        await testBed.request()
            .post('/v1/files')
            .set('Content-Type', 'multipart\/form-data')
            .field('nope', 'lol')
            .expect(400)
            .expect(/no file uploaded/);
    });

    it('POST /v1/files with "file" field containing string should return 400', async () => {
        await testBed.request()
            .post('/v1/files')
            .set('Content-Type', 'multipart\/form-data')
            .field('file', 'somestring')
            .expect(400)
            .expect(/no file uploaded/);
    });

    it('POST /v1/files with unspecified file name should return 400', async () => {
        await testBed.request()
            .post('/v1/files')
            .set('Content-Type', 'multipart\/form-data')
            .attach('file', Buffer.alloc(1000))
            .expect(400)
            .expect(/filename not specified/);
    });
});
