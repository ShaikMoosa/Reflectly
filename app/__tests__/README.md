# Reflectly Testing Documentation

This directory contains tests for the Reflectly application. This document outlines the testing approach, test structure, and how to run tests.

## Testing Approach

We follow a 60/40 split between integration and unit tests:
- 60% Integration tests (API routes, database operations, component integration)
- 40% Unit tests (isolated component behavior, utility functions)

### Test Types

1. **Unit Tests**
   - Pure function behavior
   - Component rendering and events
   - Isolated hook logic
   - Mock all external dependencies

2. **Integration Tests**
   - CRUD operations with Supabase
   - API endpoint behavior
   - Component tests with real data fetching
   - Service interactions

## Directory Structure

```
app/__tests__/
├── api/                # API endpoint tests
│   └── subscription/   # Subscription-related API tests
├── components/         # Component tests
│   └── subscription/   # Subscription component tests
├── utils/              # Utility function tests
│   └── repositories/   # Repository tests
└── README.md           # This file
```

## Running Tests

### Prerequisites

- Node.js 16+
- npm or yarn

### Installing Dependencies

```bash
npm install
```

### Running All Tests

```bash
npm test
```

### Running Subscription Tests Only

```bash
node scripts/test-subscription.js
```

### Running Test Coverage Analysis

```bash
node scripts/subscription-coverage.js
```

This will generate a coverage report in the `coverage` directory. Open `coverage/index.html` in your browser to view the report.

## Writing Tests

### API Tests

API tests should test the following:
- Proper authentication checks
- Correct response formats
- Error handling
- Business logic implementation

Example:
```typescript
// Import the API handler
import { POST } from '@/app/api/subscription/cancel/route';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(),
}));

// Write tests
describe('API: Cancel Subscription', () => {
  it('should require authentication', async () => {
    // Test code
  });
});
```

### Component Tests

Component tests should test:
- Rendering in different states
- User interactions
- Integration with data hooks

Example:
```typescript
import { render } from '@testing-library/react';
import { SubscriptionPanel } from '@/app/components/subscription/subscription-panel';

// Mock hooks
jest.mock('@/app/hooks/use-subscription');

describe('SubscriptionPanel', () => {
  it('should render loading state correctly', () => {
    // Test code
  });
});
```

### Repository Tests

Repository tests should test:
- Data mapping
- Query construction
- Error handling

Example:
```typescript
import { SubscriptionRepository } from '@/app/utils/repositories';

// Mock Supabase
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('SubscriptionRepository', () => {
  it('should retrieve user subscription', async () => {
    // Test code
  });
});
```

## Conventions

1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Test error cases
5. Use data-testid for component queries

## Continuous Integration

All tests run automatically on pull requests and main branch commits.