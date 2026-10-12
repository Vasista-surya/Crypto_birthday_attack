import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock EventSource for SSE tests
// @ts-expect-error - adding to global for tests
global.EventSource = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  onerror: null,
})) as any;

// Mock fetch
// @ts-expect-error - adding to global for tests
global.fetch = vi.fn();

// Mock ResizeObserver for Recharts
// @ts-expect-error - adding to global for tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));