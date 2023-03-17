import { JestConfigWithTsJest } from 'ts-jest';

// noinspection JSUnusedGlobalSymbols
export default <JestConfigWithTsJest>{
  displayName: 'Unit',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};
