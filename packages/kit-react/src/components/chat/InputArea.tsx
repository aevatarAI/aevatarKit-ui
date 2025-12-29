/**
 * ============================================================================
 * InputArea Component
 * ============================================================================
 */

import React, { useState, useCallback, KeyboardEvent } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface InputAreaProps {
  /** Placeholder text */
  placeholder?: string;
  
  /** Whether input is disabled */
  disabled?: boolean;
  
  /** Callback when message is sent */
  onSend: (content: string) => void;
  
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function InputArea({
  placeholder = 'Type a message...',
  disabled = false,
  onSend,
  className = '',
}: InputAreaProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue('');
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className={`aevatar-input-area ${className}`} style={styles.container}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        style={{
          ...styles.input,
          ...(disabled ? styles.inputDisabled : {}),
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        style={{
          ...styles.button,
          ...(disabled || !value.trim() ? styles.buttonDisabled : {}),
        }}
      >
        Send
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    borderTop: '1px solid var(--aevatar-border, #e2e8f0)',
    backgroundColor: 'var(--aevatar-background, #ffffff)',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid var(--aevatar-border, #e2e8f0)',
    borderRadius: 'var(--aevatar-radius, 8px)',
    backgroundColor: 'var(--aevatar-surface, #f8fafc)',
    color: 'var(--aevatar-text, #1e293b)',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
  },
  inputDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  button: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    borderRadius: 'var(--aevatar-radius, 8px)',
    backgroundColor: 'var(--aevatar-primary, #6366f1)',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

