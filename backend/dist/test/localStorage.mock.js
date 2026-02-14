"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(global, 'localStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 0,
    },
    writable: true,
});
//# sourceMappingURL=localStorage.mock.js.map