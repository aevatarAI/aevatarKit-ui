/**
 * ============================================================================
 * AevatarKit Minimal Demo
 * ============================================================================
 * Pure TypeScript demo without React - shows core SDK usage
 * ============================================================================
 */

import { createAevatarClient, type AevatarClient, type SessionInstance } from '@aevatar/kit-core';
import type { AgUiEvent, ConnectionStatus } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// DOM Elements
// ─────────────────────────────────────────────────────────────────────────────

const statusEl = document.getElementById('status')!;
const inputEl = document.getElementById('input') as HTMLInputElement;
const sendBtn = document.getElementById('send') as HTMLButtonElement;
const messagesEl = document.getElementById('messages')!;
const eventsEl = document.getElementById('events')!;

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

let client: AevatarClient;
let session: SessionInstance | null = null;
let currentMessageContent = '';

// ─────────────────────────────────────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────────────────────────────────────

function updateStatus(status: ConnectionStatus) {
  statusEl.className = status;
  statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

function addMessage(role: 'user' | 'assistant', content: string, isStreaming = false) {
  const existing = messagesEl.querySelector(`.message.${role}.streaming`);
  
  if (existing) {
    existing.querySelector('.content')!.textContent = content;
    if (!isStreaming) {
      existing.classList.remove('streaming');
    }
    return;
  }
  
  const div = document.createElement('div');
  div.className = `message ${role}${isStreaming ? ' streaming' : ''}`;
  div.innerHTML = `
    <div class="role">${role}</div>
    <div class="content">${content}</div>
  `;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addEvent(event: AgUiEvent) {
  const div = document.createElement('div');
  div.className = 'event';
  div.innerHTML = `
    <span class="event-type">${event.type}</span>
    <span class="event-time">${new Date(event.timestamp || Date.now()).toLocaleTimeString()}</span>
  `;
  eventsEl.insertBefore(div, eventsEl.firstChild);
  
  // Keep only last 20 events
  while (eventsEl.children.length > 20) {
    eventsEl.removeChild(eventsEl.lastChild!);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Handlers
// ─────────────────────────────────────────────────────────────────────────────

function handleEvent(event: AgUiEvent) {
  addEvent(event);
  
  switch (event.type) {
    case 'TEXT_MESSAGE_START':
      currentMessageContent = '';
      break;
      
    case 'TEXT_MESSAGE_CONTENT':
      currentMessageContent += event.delta;
      addMessage('assistant', currentMessageContent, true);
      break;
      
    case 'TEXT_MESSAGE_END':
      addMessage('assistant', currentMessageContent, false);
      currentMessageContent = '';
      sendBtn.disabled = false;
      break;
      
    case 'RUN_FINISHED':
      sendBtn.disabled = false;
      break;
      
    case 'RUN_ERROR':
      console.error('Run error:', event.message);
      sendBtn.disabled = false;
      break;
  }
}

async function sendMessage() {
  const content = inputEl.value.trim();
  if (!content || !session) return;
  
  inputEl.value = '';
  sendBtn.disabled = true;
  
  addMessage('user', content);
  
  try {
    await session.sendMessage(content);
  } catch (error) {
    console.error('Send error:', error);
    sendBtn.disabled = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────────────────────

async function init() {
  console.log('🚀 Initializing AevatarKit...');
  
  // Create client
  client = createAevatarClient({
    baseUrl: '/api',
    timeout: 30000,
    onConnectionChange: updateStatus,
    logger: { level: 'debug' },
  });
  
  // Connect
  updateStatus('connecting');
  
  try {
    await client.connect();
    console.log('✅ Connected to Aevatar backend');
    
    // Create session
    session = await client.createSession();
    console.log('📝 Session created:', session.id);
    
    // Subscribe to events
    session.onEvent(handleEvent);
    
    // Enable send button
    sendBtn.disabled = false;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    updateStatus('error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Listeners
// ─────────────────────────────────────────────────────────────────────────────

sendBtn.addEventListener('click', sendMessage);

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Start
init();

