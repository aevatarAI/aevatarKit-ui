/**
 * ============================================================================
 * A2UI React Module Exports
 * ============================================================================
 * 
 * A2UI SDK React 集成
 * - 43 个 shadcn/ui + Radix UI 标准组件
 * - A2UI 渲染器和上下文
 * - 标准组件注册表
 * 
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core A2UI React Components
// ─────────────────────────────────────────────────────────────────────────────

export {
  A2uiRenderer,
  A2uiActionContext,
  useA2uiAction,
  useA2uiClickHandler,
  useA2uiChangeHandler,
  type A2uiRendererProps,
  type A2uiActionContext as A2uiActionContextType,
} from './A2uiRenderer';

export {
  A2uiProvider,
  useA2uiContext,
  useA2uiContextSafe,
  useA2uiTree,
  useA2uiEngine,
  useA2uiRegistry,
  useA2uiEventProcessor,
  useA2uiDataUpdater,
  useA2uiActionDispatcher,
  type A2uiProviderProps,
  type A2uiContextValue,
} from './A2uiProvider';

export {
  useA2ui,
  useA2uiData,
  useA2uiSurface,
  useA2uiStream,
  type UseA2uiOptions,
  type UseA2uiResult,
  type UseA2uiStreamOptions,
  type UseA2uiStreamResult,
} from './useA2ui';

// ─────────────────────────────────────────────────────────────────────────────
// Standard Component Registry
// ─────────────────────────────────────────────────────────────────────────────

export {
  createStandardRegistry,
  getStandardComponentTypes,
  isStandardComponent,
  getComponentCategories,
  type StandardRegistryOptions,
} from './createStandardRegistry';

// ─────────────────────────────────────────────────────────────────────────────
// All Standard Components (43个)
// ─────────────────────────────────────────────────────────────────────────────

export * from './components';

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

export { cn } from './lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Feedback Providers (need to be wrapped at app level)
// ─────────────────────────────────────────────────────────────────────────────

export { ToastProvider, useToast } from './components/feedback';

