/**
 * ============================================================================
 * useConnection Hook Unit Tests
 * ============================================================================
 * Tests for the useConnection hook
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useConnection } from './useConnection';
import { AevatarContext, type AevatarContextValue } from '../context/AevatarContext';

// ─────────────────────────────────────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────────────────────────────────────

function createMockClient() {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn(),
    createSession: vi.fn(),
    getConnectionStatus: vi.fn().mockReturnValue('disconnected'),
    onConnectionChange: vi.fn().mockReturnValue(() => {}),
  };
}

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

describe('useConnection', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
  });

  it('should return connection status', () => {
    const mockValue = createMockContextValue({
      client: mockClient as any,
      connectionStatus: 'connected',
    });

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.status).toBe('connected');
  });

  it('should return isConnected true when connected', () => {
    const mockValue = createMockContextValue({
      client: mockClient as any,
      connectionStatus: 'connected',
    });

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('should return isConnected false when disconnected', () => {
    const mockValue = createMockContextValue({
      client: mockClient as any,
      connectionStatus: 'disconnected',
    });

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should return isConnected false when connecting', () => {
    const mockValue = createMockContextValue({
      client: mockClient as any,
      connectionStatus: 'connecting',
    });

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should provide connect function', async () => {
    const mockValue = createMockContextValue({
      client: mockClient as any,
      connectionStatus: 'disconnected',
    });

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(mockValue),
    });

    await act(async () => {
      await result.current.connect();
    });

    expect(mockClient.connect).toHaveBeenCalled();
  });

  it('should provide disconnect function', () => {
    const mockValue = createMockContextValue({
      client: mockClient as any,
      connectionStatus: 'connected',
    });

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(mockValue),
    });

    act(() => {
      result.current.disconnect();
    });

    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it('should throw error when connect called without client', async () => {
    const mockValue = createMockContextValue({
      client: null,
      connectionStatus: 'disconnected',
    });

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(mockValue),
    });

    // Should throw 'Client not initialized'
    await expect(
      act(async () => {
        await result.current.connect();
      })
    ).rejects.toThrow('Client not initialized');
  });

  it('should handle disconnect when client is null', () => {
    const mockValue = createMockContextValue({
      client: null,
      connectionStatus: 'disconnected',
    });

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(mockValue),
    });

    // Should not throw
    act(() => {
      result.current.disconnect();
    });
  });

  it('should reflect error status', () => {
    const mockValue = createMockContextValue({
      client: mockClient as any,
      connectionStatus: 'error',
    });

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isConnected).toBe(false);
  });
});


