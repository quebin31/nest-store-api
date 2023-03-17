import { JestConfigWithTsJest } from 'ts-jest';

// noinspection JSUnusedGlobalSymbols
export default <JestConfigWithTsJest>{
  displayName: 'E2E',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: ['.e2e.spec.ts$', '.spec.ts$'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
