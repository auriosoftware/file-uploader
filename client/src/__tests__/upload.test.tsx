import React from 'react';
import {mount, ReactWrapper} from 'enzyme';
import App from "../app";
import {Provider} from "react-redux";
import {initStore, store} from "../store/store";
import {waitFor} from "./utils/async-helpers";
import {uploadController} from "../resources";

describe('File Upload', () => {
    let componentWrapper: ReactWrapper;

    beforeEach(() => {
        fetch = jest.fn();
    });

    describe('when try to upload a file', () => {
        beforeEach(async() => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitFor(100);
            const file = new File(['file content'], 'dummyValue.png', { type: 'image/png' });

            // componentWrapper.find('input').simulate({target: files: [file]});

            uploadController.uploadFile(file);
            await waitFor(100);
            componentWrapper.update();
        });

        it('should display a correct file', () => {
            expect(componentWrapper.exists('[data-test-file-name="dummyValue.png"]')).toBe(true);
        });

        it('should call a correct endpoint', () => {
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });

});
