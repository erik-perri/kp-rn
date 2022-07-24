import failOnConsole from 'jest-fail-on-console';

failOnConsole();

jest.mock('../src/lib/utilities/KpHelperModule', () =>
  require('./KpHelperModuleMock'),
);

expect.extend({
  toEqualUint8Array(received: Uint8Array, expected: Uint8Array) {
    const message = () =>
      `expected ${received.join(',')} to equal ${expected.join(',')}`;

    if (received.byteLength !== expected.byteLength) {
      return {pass: false, message};
    }

    for (let i = 0; i < received.byteLength; i++) {
      if (received[i] !== expected[i]) {
        return {pass: false, message};
      }
    }

    return {pass: true, message};
  },
});

interface CustomMatchers<R = unknown> {
  toEqualUint8Array(expected: Uint8Array): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

export default {};
