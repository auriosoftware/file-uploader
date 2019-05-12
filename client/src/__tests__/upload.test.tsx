import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { waitForAsyncActions } from '../utils/test-utils/async-helpers';
import { initTestingDependencies } from '../resources';
import { RawFile } from '../utils/test-utils/raw-file';
import { MockUploadController } from '../utils/test-utils/mock-upload-controller';
import { App } from '../app';

describe('File Upload', () => {
    let componentWrapper: ReactWrapper;
    let controller: MockUploadController;

    beforeEach(() => {
        controller = new MockUploadController();
        initTestingDependencies(controller);
    });

    describe('when upload was initialized for 1 file', () => {
        beforeEach(async () => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitForAsyncActions();
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);

            await waitForAsyncActions();
            componentWrapper.update();
        });

        it('should display only 1 file', () => {
            expect(componentWrapper.find('[data-test-file]')).toHaveLength(1);
        });

        it('should display a file with correct name', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"]')).toBe(true);
        });

        it('should display a progress bar with 0 value', () => {
            expect(componentWrapper.find('[data-test-file-name="dummyFile.png"] [data-test-progress]').first().prop('value')).toEqual(0);
        });

        it('should display a uploading icon', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-uploading-icon]')).toBe(true);
        });

        it('should display an abort button', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-abort-button]')).toBe(true);
        });

    });

    describe('when a file upload was initialized and progress changed to 50%', () => {
        beforeEach(async () => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitForAsyncActions();
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.5});

            await waitForAsyncActions();
            componentWrapper.update();
        });

        it('should display a progress bar with 50 value', () => {
            expect(componentWrapper.find('[data-test-file-name="dummyFile.png"] [data-test-progress]').first().prop('value')).toEqual(50);
        });

        it('should display a uploading icon', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-uploading-icon]')).toBe(true);
        });

    });

    describe('when a file upload was initialized, processing a while and then was successfully uploaded', () => {
        beforeEach(async () => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitForAsyncActions();
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.5});
            controller.onFileProgress.fire({...file, progress: () => 0.9});
            controller.onFileUploaded.fire({...file, progress: () => 1});

            await waitForAsyncActions();
            componentWrapper.update();
        });

        it('should display a download button', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-download-button]')).toBe(true);
        });

        it('should display a done icon', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-done-icon]')).toBe(true);
        });

        it('should NOT display a progress bar', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-progress]')).toBe(false);
        });

        it('should NOT display a uploading icon', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-uploading-icon]')).toBe(false);
        });

        it('should NOT display an abort button', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-abort-button]')).toBe(false);
        });

    });

    describe('when a file upload was initialized, processing a while and then uploaded was ABORTED', () => {
        beforeEach(async () => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitForAsyncActions();
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.5});

            await waitForAsyncActions();
            componentWrapper.update();
            componentWrapper.find('[data-test-file-name="dummyFile.png"] [data-test-abort-button]').first().simulate('click');
            componentWrapper.update();
        });

        it('should display a aborted icon', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-aborted-icon]')).toBe(true);
        });

        it('should NOT display a download button', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-download-button]')).toBe(false);
        });

        it('should NOT display a progress bar', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-progress]')).toBe(false);
        });

        it('should NOT display an abort button', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-abort-button]')).toBe(false);
        });

    });

    describe('when a file upload was initialized, processing a while and then FAILED', () => {
        beforeEach(async () => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitForAsyncActions();
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.5});
            controller.onFileProgress.fire({...file, progress: () => 0.9});
            controller.onFileUploadFailed.fire({ file, message: 'oops'});

            await waitForAsyncActions();
            componentWrapper.update();
        });

        it('should display a failed icon', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-failed-icon]')).toBe(true);
        });

        it('should NOT display a download button', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-download-button]')).toBe(false);
        });

        it('should NOT display a progress bar', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-progress]')).toBe(false);
        });

        it('should NOT display a uploading icon', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-uploading-icon]')).toBe(false);
        });

        it('should NOT display an abort button', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"] [data-test-abort-button]')).toBe(false);
        });

    });

    describe('when a file upload was successfully uploaded and clicked on download', () => {
        beforeEach(async () => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitForAsyncActions();
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.9});
            controller.onFileUploaded.fire({...file, progress: () => 1});

            await waitForAsyncActions();
            componentWrapper.update();
            componentWrapper.find('[data-test-file-name="dummyFile.png"] [data-test-download-button]').first().simulate('click');
            componentWrapper.update();
        });

        it('should download correct file', () => {
            expect(window.location.href).toBe('/api/v1/files/dummyFile.png');
        });

    });

    describe('when upload was initialized for 2 files', () => {
        beforeEach(async () => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitForAsyncActions();
            const file1: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};
            const file2: RawFile = {fileName: 'dummyFile2.png', size: 100, uniqueIdentifier: 'id2', progress: () => 0};

            controller.onFileAdded.fire(file1);
            controller.onFileAdded.fire(file2);

            await waitForAsyncActions();
            componentWrapper.update();
        });

        it('should display 2 files', () => {
            expect(componentWrapper.find('[data-test-file]')).toHaveLength(2);
        });

        it('should display first file with correct name', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile.png"]')).toBe(true);
        });

        it('should display second file with correct name', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyFile2.png"]')).toBe(true);
        });

    });

    describe('when upload was initialized for 2 files and progress changed to 50% for the first file', () => {
        beforeEach(async () => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitForAsyncActions();
            const file1: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};
            const file2: RawFile = {fileName: 'dummyFile2.png', size: 100, uniqueIdentifier: 'id2', progress: () => 0};

            controller.onFileAdded.fire(file1);
            controller.onFileProgress.fire({...file1, progress: () => 0.5});
            controller.onFileAdded.fire(file2);

            await waitForAsyncActions();
            componentWrapper.update();
        });

        it('should display a progress bar with 50 value for first file', () => {
            expect(componentWrapper.find('[data-test-file-name="dummyFile.png"] [data-test-progress]').first().prop('value')).toEqual(50);
        });

        it('should display a progress bar with 0 value for second file', () => {
            expect(componentWrapper.find('[data-test-file-name="dummyFile2.png"] [data-test-progress]').first().prop('value')).toEqual(0);
        });

    });

});
