/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.module.ts', '!main.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      // Branches is capped below the others: every Nest class with a constructor-injected
      // dependency compiles (via emitDecoratorMetadata) to a helper with one branch Istanbul
      // can never see exercised, so 100% branch coverage isn't reachable in a DI-heavy codebase.
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
