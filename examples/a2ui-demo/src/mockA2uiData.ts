/**
 * ============================================================================
 * Mock A2UI JSON Data - Simulated Agent Responses
 * ============================================================================
 * 
 * A2UI 组件格式:
 * {
 *   "id": "unique-id",
 *   "component": {
 *     "ComponentType": {
 *       "prop": "value",
 *       "children": { "explicitList": ["child-id"] }
 *     }
 *   }
 * }
 * 
 * ============================================================================
 */

import type { A2uiSurfaceUpdate, A2uiComponentInstance } from '@aevatar/kit-types';

// Helper to create component
function c(
  id: string,
  type: string,
  props: Record<string, unknown> = {},
  childIds?: string[]
): A2uiComponentInstance {
  return {
    id,
    component: {
      [type]: {
        ...props,
        ...(childIds && childIds.length > 0 ? { children: { explicitList: childIds } } : {}),
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Example 1: Simple Card
// ─────────────────────────────────────────────────────────────────────────────

export const simpleCardExample: A2uiSurfaceUpdate = {
  type: 'surfaceUpdate',
  surfaceId: 'simple-card',
  components: [
    c('root', 'Card', { title: 'Hello A2UI!', subtitle: 'Agent-generated UI' }, ['content']),
    c('content', 'Column', { gap: 'md' }, ['text1', 'btn1']),
    c('text1', 'Text', { text: 'This card was generated from A2UI JSON.' }),
    c('btn1', 'Button', { text: 'Click Me', variant: 'default' }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Example 2: User Profile
// ─────────────────────────────────────────────────────────────────────────────

export const userProfileExample: A2uiSurfaceUpdate = {
  type: 'surfaceUpdate',
  surfaceId: 'user-profile',
  components: [
    c('root', 'Card', { title: 'User Profile' }, ['profile-row', 'divider', 'stats']),
    c('profile-row', 'Row', { gap: 'lg', align: 'center' }, ['avatar', 'info']),
    c('avatar', 'Avatar', { fallback: 'JD', size: 'lg' }),
    c('info', 'Column', { gap: 'xs' }, ['name', 'email', 'role']),
    c('name', 'Heading', { level: 3, text: 'John Doe' }),
    c('email', 'Text', { text: 'john@example.com', variant: 'muted' }),
    c('role', 'Badge', { text: 'Developer', variant: 'secondary' }),
    c('divider', 'Divider', { className: 'my-4' }),
    c('stats', 'Grid', { cols: 3, gap: 'md' }, ['stat1', 'stat2', 'stat3']),
    c('stat1', 'Column', { align: 'center' }, ['stat1-num', 'stat1-label']),
    c('stat1-num', 'Heading', { level: 2, text: '42' }),
    c('stat1-label', 'Text', { text: 'Projects', variant: 'muted', size: 'sm' }),
    c('stat2', 'Column', { align: 'center' }, ['stat2-num', 'stat2-label']),
    c('stat2-num', 'Heading', { level: 2, text: '128' }),
    c('stat2-label', 'Text', { text: 'Commits', variant: 'muted', size: 'sm' }),
    c('stat3', 'Column', { align: 'center' }, ['stat3-num', 'stat3-label']),
    c('stat3-num', 'Heading', { level: 2, text: '15' }),
    c('stat3-label', 'Text', { text: 'Reviews', variant: 'muted', size: 'sm' }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Example 3: Login Form
// ─────────────────────────────────────────────────────────────────────────────

export const loginFormExample: A2uiSurfaceUpdate = {
  type: 'surfaceUpdate',
  surfaceId: 'login-form',
  components: [
    c('root', 'Card', { title: 'Sign In', subtitle: 'Enter your credentials' }, ['form']),
    c('form', 'Column', { gap: 'md' }, ['email', 'password', 'remember', 'submit-row']),
    c('email', 'TextField', { label: 'Email', placeholder: 'you@example.com', type: 'email' }),
    c('password', 'TextField', { label: 'Password', placeholder: '••••••••', type: 'password' }),
    c('remember', 'Checkbox', { label: 'Remember me' }),
    c('submit-row', 'Row', { gap: 'sm', justify: 'between' }, ['forgot', 'submit']),
    c('forgot', 'Button', { text: 'Forgot password?', variant: 'link' }),
    c('submit', 'Button', { text: 'Sign In' }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Example 4: Dashboard Alerts
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardAlertsExample: A2uiSurfaceUpdate = {
  type: 'surfaceUpdate',
  surfaceId: 'dashboard-alerts',
  components: [
    c('root', 'Column', { gap: 'md' }, ['title', 'alert1', 'alert2', 'alert3', 'alert4']),
    c('title', 'Heading', { level: 2, text: 'System Status' }),
    c('alert1', 'Alert', { title: 'All Systems Operational', description: 'No issues detected in the last 24 hours.', variant: 'success' }),
    c('alert2', 'Alert', { title: 'Scheduled Maintenance', description: 'System update scheduled for tonight at 2:00 AM UTC.', variant: 'info' }),
    c('alert3', 'Alert', { title: 'High Memory Usage', description: 'Server memory usage is above 80%. Consider scaling up.', variant: 'warning' }),
    c('alert4', 'Alert', { title: 'API Rate Limit', description: 'You have reached 90% of your monthly API quota.', variant: 'destructive' }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Example 5: Product Card
// ─────────────────────────────────────────────────────────────────────────────

export const productCardExample: A2uiSurfaceUpdate = {
  type: 'surfaceUpdate',
  surfaceId: 'product-card',
  components: [
    c('root', 'Card', {}, ['image', 'content']),
    c('image', 'Image', { src: 'https://via.placeholder.com/400x200?text=Product+Image', alt: 'Product', aspectRatio: 'video', className: 'w-full rounded-t-lg' }),
    c('content', 'Column', { gap: 'sm', className: 'p-4' }, ['badges', 'title', 'desc', 'price-row', 'actions']),
    c('badges', 'Row', { gap: 'xs' }, ['badge1', 'badge2']),
    c('badge1', 'Badge', { text: 'New', variant: 'default' }),
    c('badge2', 'Badge', { text: 'Sale', variant: 'destructive' }),
    c('title', 'Heading', { level: 3, text: 'Premium Headphones' }),
    c('desc', 'Text', { text: 'High-quality wireless headphones with noise cancellation.', variant: 'muted' }),
    c('price-row', 'Row', { gap: 'sm', align: 'baseline' }, ['price', 'original']),
    c('price', 'Heading', { level: 2, text: '$199' }),
    c('original', 'Text', { text: '$299', variant: 'muted', className: 'line-through' }),
    c('actions', 'Row', { gap: 'sm' }, ['cart-btn', 'wishlist-btn']),
    c('cart-btn', 'Button', { text: 'Add to Cart' }),
    c('wishlist-btn', 'Button', { text: 'Wishlist', variant: 'outline' }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Example 6: Settings Form
// ─────────────────────────────────────────────────────────────────────────────

export const settingsFormExample: A2uiSurfaceUpdate = {
  type: 'surfaceUpdate',
  surfaceId: 'settings-form',
  components: [
    c('root', 'Card', { title: 'Notification Settings', subtitle: 'Manage your preferences' }, ['form']),
    c('form', 'Column', { gap: 'lg' }, ['email-section', 'divider1', 'push-section', 'divider2', 'actions']),
    c('email-section', 'Column', { gap: 'md' }, ['email-title', 'email-opt1', 'email-opt2', 'email-opt3']),
    c('email-title', 'Text', { text: 'Email Notifications', weight: 'semibold' }),
    c('email-opt1', 'Switch', { label: 'Weekly digest' }),
    c('email-opt2', 'Switch', { label: 'Product updates' }),
    c('email-opt3', 'Switch', { label: 'Marketing emails' }),
    c('divider1', 'Divider', {}),
    c('push-section', 'Column', { gap: 'md' }, ['push-title', 'push-opt1', 'push-opt2']),
    c('push-title', 'Text', { text: 'Push Notifications', weight: 'semibold' }),
    c('push-opt1', 'Switch', { label: 'Desktop notifications' }),
    c('push-opt2', 'Switch', { label: 'Mobile notifications' }),
    c('divider2', 'Divider', {}),
    c('actions', 'Row', { gap: 'sm', justify: 'end' }, ['cancel', 'save']),
    c('cancel', 'Button', { text: 'Cancel', variant: 'outline' }),
    c('save', 'Button', { text: 'Save Changes' }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Example 7: Progress Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export const progressDashboardExample: A2uiSurfaceUpdate = {
  type: 'surfaceUpdate',
  surfaceId: 'progress-dashboard',
  components: [
    c('root', 'Card', { title: 'Project Progress' }, ['content']),
    c('content', 'Column', { gap: 'lg' }, ['overall', 'tasks']),
    c('overall', 'Column', { gap: 'sm' }, ['overall-label', 'overall-progress']),
    c('overall-label', 'Row', { justify: 'between' }, ['overall-text', 'overall-pct']),
    c('overall-text', 'Text', { text: 'Overall Completion', weight: 'medium' }),
    c('overall-pct', 'Text', { text: '68%', variant: 'primary' }),
    c('overall-progress', 'Progress', { value: 68 }),
    c('tasks', 'Column', { gap: 'md' }, ['task1', 'task2', 'task3']),
    c('task1', 'Column', { gap: 'xs' }, ['task1-row', 'task1-progress']),
    c('task1-row', 'Row', { justify: 'between' }, ['task1-name', 'task1-badge']),
    c('task1-name', 'Text', { text: 'Design Phase' }),
    c('task1-badge', 'Badge', { text: 'Complete', variant: 'success' }),
    c('task1-progress', 'Progress', { value: 100 }),
    c('task2', 'Column', { gap: 'xs' }, ['task2-row', 'task2-progress']),
    c('task2-row', 'Row', { justify: 'between' }, ['task2-name', 'task2-badge']),
    c('task2-name', 'Text', { text: 'Development' }),
    c('task2-badge', 'Badge', { text: 'In Progress', variant: 'warning' }),
    c('task2-progress', 'Progress', { value: 65 }),
    c('task3', 'Column', { gap: 'xs' }, ['task3-row', 'task3-progress']),
    c('task3-row', 'Row', { justify: 'between' }, ['task3-name', 'task3-badge']),
    c('task3-name', 'Text', { text: 'Testing' }),
    c('task3-badge', 'Badge', { text: 'Pending', variant: 'secondary' }),
    c('task3-progress', 'Progress', { value: 20 }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// All Examples
// ─────────────────────────────────────────────────────────────────────────────

export const examples: { name: string; data: A2uiSurfaceUpdate }[] = [
  { name: 'Simple Card', data: simpleCardExample },
  { name: 'User Profile', data: userProfileExample },
  { name: 'Login Form', data: loginFormExample },
  { name: 'Dashboard Alerts', data: dashboardAlertsExample },
  { name: 'Product Card', data: productCardExample },
  { name: 'Settings Form', data: settingsFormExample },
  { name: 'Progress Dashboard', data: progressDashboardExample },
];

// Default example JSON (for editing)
export const defaultJsonExample = `{
  "type": "surfaceUpdate",
  "surfaceId": "custom",
  "components": [
    {
      "id": "root",
      "component": {
        "Card": {
          "title": "Custom Card",
          "subtitle": "Edit this JSON to create your UI",
          "children": { "explicitList": ["content"] }
        }
      }
    },
    {
      "id": "content",
      "component": {
        "Column": {
          "gap": "md",
          "children": { "explicitList": ["text", "button"] }
        }
      }
    },
    {
      "id": "text",
      "component": {
        "Text": {
          "text": "Hello from A2UI!"
        }
      }
    },
    {
      "id": "button",
      "component": {
        "Button": {
          "text": "Click Me",
          "variant": "default"
        }
      }
    }
  ]
}`;

