/**
 * ============================================================================
 * useAevatar Hook Unit Tests
 * ============================================================================
 * Tests for the useAevatar context hook
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useAevatar } from './useAevatar';
import { AevatarContext, type AevatarContextValue } from '../context/AevatarContext';

// ─────────────────────────────────────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────────────────────────────────────

function createMockContextValue(
  overrides: Partial<AevatarContextValue> = {}
): AevatarContextValue {
  return {
    client: null,
    connectionStatus: 'disconnected',
    activeSession: null,
    setActiveSession: vi.fn(),
    isReady: false,
    error: null,
    ...overrides,
  };
}

function createWrapper(value: AevatarContextValue) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AevatarContext.Provider value={value}>
        {children}
      </AevatarContext.Provider>
    );
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('useAevatar', () => {
  it('should throw error when used outside provider', () => {
    // Suppress expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useAevatar());
    }).toThrow('useAevatar must be used within an AevatarProvider');
    
    spy.mockRestore();
  });

  it('should return context value when inside provider', () => {
    const mockValue = createMockContextValue({
      connectionStatus: 'connected',
      isReady: true,
    });

    const { result } = renderHook(() => useAevatar(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.isReady).toBe(true);
    expect(result.current.client).toBeNull();
  });

  it('should return client when available', () => {
    const mockClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      createSession: vi.fn(),
    } as any;

    const mockValue = createMockContextValue({ client: mockClient });

    const { result } = renderHook(() => useAevatar(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.client).toBe(mockClient);
  });

  it('should return active session', () => {
    const mockSession = {
      id: 'session-123',
      messages: [],
      onEvent: vi.fn(),
    } as any;

    const mockValue = createMockContextValue({
      activeSession: mockSession,
    });

    const { result } = renderHook(() => useAevatar(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.activeSession).toBe(mockSession);
    expect(result.current.activeSession?.id).toBe('session-123');
  });

  it('should expose setActiveSession function', () => {
    const setActiveSession = vi.fn();
    const mockValue = createMockContextValue({ setActiveSession });

    const { result } = renderHook(() => useAevatar(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.setActiveSession(null);
    expect(setActiveSession).toHaveBeenCalledWith(null);
  });

  it('should return error when present', () => {
    const error = new Error('Connection failed');
    const mockValue = createMockContextValue({ error });

    const { result } = renderHook(() => useAevatar(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.error).toBe(error);
    expect(result.current.error?.message).toBe('Connection failed');
  });

  it('should reflect different connection statuses', () => {
    const statuses = ['disconnected', 'connecting', 'connected', 'error'] as const;

    statuses.forEach((status) => {
      const mockValue = createMockContextValue({ connectionStatus: status });
      const { result } = renderHook(() => useAevatar(), {
        wrapper: createWrapper(mockValue),
      });
      expect(result.current.connectionStatus).toBe(status);
    });
  });
});


