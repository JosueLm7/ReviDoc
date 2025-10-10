# Backend Tests

This directory contains comprehensive tests for the backend application.

## Test Structure

\`\`\`
tests/
├── setup.js                    # Test environment setup
├── unit/                       # Unit tests
│   ├── models/                 # Model tests
│   │   ├── User.test.js
│   │   ├── Document.test.js
│   │   └── Review.test.js
│   ├── middleware/             # Middleware tests
│   │   └── auth.test.js
│   └── services/               # Service tests
│       └── fileProcessor.test.js
├── integration/                # Integration tests
│   └── routes/                 # Route tests
│       ├── auth.test.js
│       ├── documents.test.js
│       └── reviews.test.js
└── e2e/                        # End-to-end tests
    └── complete-workflow.test.js
\`\`\`

## Running Tests

### Run all tests
\`\`\`bash
npm test
\`\`\`

### Run tests in watch mode
\`\`\`bash
npm run test:watch
\`\`\`

### Run only unit tests
\`\`\`bash
npm run test:unit
\`\`\`

### Run only integration tests
\`\`\`bash
npm run test:integration
\`\`\`

### Run only e2e tests
\`\`\`bash
npm run test:e2e
\`\`\`

### Run with coverage
\`\`\`bash
npm test -- --coverage
\`\`\`

## Test Coverage

The test suite covers:

### Models (Unit Tests)
- User model: creation, validation, password hashing, JWT generation
- Document model: creation, validation, word count calculation
- Review model: creation, score calculations, issue management

### Middleware (Unit Tests)
- Authentication: token validation, user verification
- Authorization: role-based access control

### Services (Unit Tests)
- File processor: text extraction, validation, cleaning
- AI service: text analysis (mocked)

### Routes (Integration Tests)
- Auth routes: register, login, logout, get current user
- Document routes: upload, list, get, update, delete
- Review routes: create, list, get, add feedback

### Complete Workflows (E2E Tests)
- Full user registration and authentication flow
- Complete document lifecycle (upload, update, delete)
- Review creation and feedback flow

## Test Environment

Tests use:
- **Jest** as the testing framework
- **Supertest** for HTTP endpoint testing
- **mongodb-memory-server** for in-memory MongoDB
- Mock implementations for external services (OpenAI, file system)

## Writing New Tests

When adding new tests:

1. Place unit tests in `tests/unit/`
2. Place integration tests in `tests/integration/`
3. Place e2e tests in `tests/e2e/`
4. Follow existing naming conventions
5. Use descriptive test names
6. Clean up resources in `afterEach` hooks
7. Mock external dependencies

## CI/CD Integration

These tests are designed to run in CI/CD pipelines. Ensure:
- All tests pass before merging
- Coverage thresholds are maintained
- No external dependencies required
