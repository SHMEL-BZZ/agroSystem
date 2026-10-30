// client/src/setupTests.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}

class ResizeObserverMock {
    observe() { }
    unobserve() { }
    disconnect() { }
}
global.ResizeObserver = ResizeObserverMock;