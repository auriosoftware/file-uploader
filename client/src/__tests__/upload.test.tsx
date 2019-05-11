import React from 'react';
import {mount, ReactWrapper} from 'enzyme';
import App from "../app";
import {Provider} from "react-redux";
import {store} from "../store/store";
import {waitFor} from "./utils/async-helpers";
import {uploadController} from "../resources";

describe('File Upload', () => {
    let componentWrapper: ReactWrapper;

    describe('when select a file via file input', () => {
        beforeEach(async() => {
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
            await waitFor(1000);
            const file = new File(['(⌐□_□)'], 'dummyValue.png', { type: 'image/png' });
            // uploadController.uploadFile(file);
            // i have to do this because `input.files =[file]` is not allowed
            const inputElement = componentWrapper.find('[data-test="file-upload-input"]');
            console.log(inputElement.debug());
            inputElement.simulate('change', {
                target: {
                    files: [file]
                }
            });
            await waitFor(2000);
            componentWrapper.update();
        });

        it('should display a correct file', () => {
            expect(true).toBe(true);
            expect(componentWrapper.exists('[data-test-file-name="dummyValue.png"]')).toBe(true);
        });
    });

});
