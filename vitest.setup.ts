/**
 * ============================================================================
 * Vitest Global Setup
 * ============================================================================
 * Setup file for all tests - configures testing environment
 * ============================================================================
 */

import '@testing-library/jest-dom/vitest';

// Mock console.error to suppress expected errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress React act() warnings and expected errors
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('[EventRouter]'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});


