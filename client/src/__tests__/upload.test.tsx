import React from 'react';
import {mount} from 'enzyme';
import App from "../app";
import {Provider} from "react-redux";
import {store} from "../store/store";

describe('ChangePassword', () => {
    let componentWrapper;

    describe('when page was loaded with reset token in query', () => {
        beforeEach(() => {
            // eslint-disable-next-line no-native-reassign
            // fetch = createSpy();
            componentWrapper = mount(<Provider store={store}><App/></Provider>);
        });

        it('should render change password page', () => {
            console.log(componentWrapper.debug());
            expect(true).toBe(true);
        });
    });

});
