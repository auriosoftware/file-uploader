import React from 'react';
import {mount, ReactWrapper} from 'enzyme';
import App from "../app";
import {Provider} from "react-redux";
import {store} from "../store/store";
import {waitFor} from "./utils/async-helpers";
import {initTestingDependencies} from "../resources";
import {signal} from "../utils/signal";
import {RawFile} from "../services/redux-upload-action-dispatcher";

describe('File Upload', () => {
    let componentWrapper: ReactWrapper;
    let controller: any;

    beforeEach(() => {
        controller = {
            onFileAdded: signal<RawFile>(),
            onFileProgress: signal<RawFile>(),
            onFileUploadFailed: signal<RawFile>(),
            onFileUploaded: signal<RawFile>(),
            abortUpload: () => undefined,
            uploadFile(file: File): void {
            }
        };
        initTestingDependencies(controller);
    });

    describe('when upload was initialized for 1 file', () => {
        beforeEach(async () => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitFor(100);
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};
            controller.onFileAdded.fire(file);
            await waitFor(100);
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
            await waitFor(100);
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.5});

            await waitFor(100);
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
            await waitFor(100);
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.5});
            controller.onFileProgress.fire({...file, progress: () => 0.9});
            controller.onFileUploaded.fire({...file, progress: () => 1});

            await waitFor(100);
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
            await waitFor(100);
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.5});

            await waitFor(100);
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
            await waitFor(100);
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.5});
            controller.onFileProgress.fire({...file, progress: () => 0.9});
            controller.onFileUploadFailed.fire({...file, progress: () => 1});

            await waitFor(100);
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
            await waitFor(100);
            const file: RawFile = {fileName: 'dummyFile.png', size: 222, uniqueIdentifier: 'id', progress: () => 0};

            controller.onFileAdded.fire(file);
            controller.onFileProgress.fire({...file, progress: () => 0.9});
            controller.onFileUploaded.fire({...file, progress: () => 1});

            await waitFor(100);
            componentWrapper.update();
            componentWrapper.find('[data-test-file-name="dummyFile.png"] [data-test-download-button]').first().simulate('click');
            componentWrapper.update();
        });

        it('should download correct file', () => {
            expect(window.location.href).toBe('/api/v1/files/dummyFile.png');
        });

    });


});

