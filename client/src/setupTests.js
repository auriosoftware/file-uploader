import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
mockWindowLocationHref(); // Redirection is tested in integration tests => we have to make window.location.href mutable in jsdom

function mockWindowLocationHref() {
    // since jest 22.01 we cannot change window.location directly. See the https://github.com/facebook/jest/issues/5124
    const windowLocation = JSON.stringify(window.location);
    delete window.location;
    window.location = {
        ...windowLocation,
        href: { writable: true },
    };
}

