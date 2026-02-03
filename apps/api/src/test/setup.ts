// Vitest setup file
// Add global test utilities and mocks here

// Mock environment variables for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.ENVIRONMENT = 'test';
