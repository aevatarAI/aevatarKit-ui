/**
 * ============================================================================
 * A2UI Demo - JSON to UI Renderer
 * ============================================================================
 * 
 * 核心功能: 给定 A2UI JSON → 渲染出 UI
 * 
 * ============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { type ReactNode } from 'react';
import {
  ToastProvider,
  useToast,
  createStandardRegistry,
  A2uiRenderer,
  Row,
  Column,
  Text,
  Heading,
  Badge,
  Button,
  Select,
  Alert,
  // Theme System
  ThemeProvider,
  useTheme,
  ThemeModeToggle,
  ColorCustomizer,
  getPresetNames,
  type ThemePreset,
} from '@aevatar/kit-react';
import { createA2uiEngine, type RenderTreeNode } from '@aevatar/kit-a2ui';
import type { A2uiSurfaceUpdate, A2uiUserAction } from '@aevatar/kit-types';
import { examples, defaultJsonExample } from './mockA2uiData';

// Create component registry once
const registry = createStandardRegistry();

// ─────────────────────────────────────────────────────────────────────────────
// A2UI Renderer Panel
// ─────────────────────────────────────────────────────────────────────────────

interface RendererPanelProps {
  jsonData: A2uiSurfaceUpdate | null;
  error: string | null;
}

function RendererPanel({ jsonData, error }: RendererPanelProps) {
  const { toast } = useToast();
  const [tree, setTree] = useState<RenderTreeNode<ReactNode> | null>(null);
  const [userActions, setUserActions] = useState<A2uiUserAction[]>([]);

  // Create engine
  const engine = useMemo(() => {
    return createA2uiEngine<ReactNode>(registry, {
      events: {
        onUserAction: (action) => {
          setUserActions((prev) => [...prev.slice(-9), action]);
          toast({
            title: `Action: ${action.name}`,
            description: `From: ${action.sourceComponentId}`,
          });
        },
        onRenderTreeUpdated: (_surfaceId, newTree) => {
          setTree(newTree as RenderTreeNode<ReactNode> | null);
        },
        onError: (err, context) => {
          console.error('[A2UI Error]', context, err);
        },
      },
    });
  }, [toast]);

  // Process JSON when it changes
  useEffect(() => {
    if (!jsonData) {
      setTree(null);
      return;
    }

    try {
      const surfaceId = jsonData.surfaceId || 'default';
      console.log('[A2UI] Processing surfaceId:', surfaceId);
      console.log('[A2UI] Components:', jsonData.components);
      
      // 1. Process surfaceUpdate message directly
      engine.processMessage(jsonData);
      console.log('[A2UI] surfaceUpdate processed');
      
      // 2. Find root component (first one) and send beginRendering
      if (jsonData.components.length > 0) {
        const rootId = jsonData.components[0].id;
        console.log('[A2UI] Root component ID:', rootId);
        
        engine.processMessage({
          type: 'beginRendering',
          surfaceId,
          root: rootId,
        });
        console.log('[A2UI] beginRendering processed');
      }
      
      // Get render tree
      const newTree = engine.getRenderTree(surfaceId);
      console.log('[A2UI] Render tree:', newTree);
      setTree(newTree as RenderTreeNode<ReactNode> | null);
    } catch (err) {
      console.error('[Render Error]', err);
      setTree(null);
    }
  }, [jsonData, engine]);

  const handleUserAction = useCallback((action: A2uiUserAction) => {
    engine.dispatchUserAction(action);
  }, [engine]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert variant="destructive" title="JSON Parse Error" description={error} />
      </div>
    );
  }

  if (!jsonData) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-muted-foreground">
        <Column gap="sm" align="center">
          <Text variant="muted">Enter A2UI JSON to render</Text>
          <Text variant="muted" size="sm">or select an example from the dropdown</Text>
        </Column>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      {tree ? (
        <>
          <A2uiRenderer
            tree={tree}
            registry={registry}
            surfaceId={jsonData.surfaceId || 'default'}
            onUserAction={handleUserAction}
          />
          
          {userActions.length > 0 && (
            <div className="mt-6 p-3 rounded-md bg-muted/50 text-xs font-mono">
              <div className="text-muted-foreground mb-2 font-semibold">User Actions Log:</div>
              {userActions.map((action, i) => (
                <div key={i} className="text-foreground/80 py-0.5">
                  [{action.timestamp}] <span className="text-primary">{action.name}</span> → {action.sourceComponentId}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <Text variant="muted">No components to render</Text>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON Editor Panel
// ─────────────────────────────────────────────────────────────────────────────

interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

function EditorPanel({ value, onChange, error }: EditorPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          flex-1 w-full p-4 font-mono text-sm resize-none
          bg-zinc-950 text-zinc-100
          border-0 focus:outline-none focus:ring-0
          ${error ? 'border-l-4 border-l-destructive' : ''}
        `}
        placeholder="Paste A2UI JSON here..."
        spellCheck={false}
      />
      {error && (
        <div className="p-2 bg-destructive/10 border-t border-destructive/20 text-destructive text-xs font-mono">
          {error}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Controls Panel
// ─────────────────────────────────────────────────────────────────────────────

function ThemeControlsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { preset, setPreset, mode, setMode, resolvedMode, reset } = useTheme();
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  
  if (!isOpen) return null;
  
  const presets = getPresetNames();
  
  return (
    <div className="absolute right-4 top-14 z-50 w-80 rounded-lg border bg-card shadow-lg">
      <div className="border-b px-4 py-3">
        <Row justify="between" align="center">
          <Heading level={4}>Theme Settings</Heading>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </Row>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Mode Selector */}
        <div>
          <Text size="sm" weight="medium" className="mb-2 block">Mode</Text>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['light', 'dark', 'system'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                  mode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <Text size="xs" variant="muted" className="mt-1">
            Current: {resolvedMode}
          </Text>
        </div>
        
        {/* Tab Selector */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'presets'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            🎨 Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'custom'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            ✏️ Custom
          </button>
        </div>
        
        {/* Preset Selector Tab */}
        {activeTab === 'presets' && (
          <div>
            <Text size="sm" weight="medium" className="mb-2 block">Preset Theme</Text>
            <div className="grid grid-cols-4 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p as ThemePreset)}
                  className={`py-1.5 px-1 text-xs rounded-md transition-colors capitalize ${
                    preset === p
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-input hover:bg-accent'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Custom Colors Tab */}
        {activeTab === 'custom' && (
          <div>
            <Text size="sm" weight="medium" className="mb-3 block">Custom Colors</Text>
            <ColorCustomizer colors={['primary', 'secondary', 'accent', 'destructive']} />
            <Text size="xs" variant="muted" className="mt-3">
              Pick colors using the color picker. Changes apply to current mode ({resolvedMode}).
            </Text>
          </div>
        )}
        
        {/* Reset */}
        <div className="pt-2 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={reset}>
            Reset to Default
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────

function AppContent() {
  const [jsonText, setJsonText] = useState(defaultJsonExample);
  const [parsedData, setParsedData] = useState<A2uiSurfaceUpdate | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState('');
  const [showThemePanel, setShowThemePanel] = useState(false);

  // Parse JSON when text changes
  useEffect(() => {
    try {
      const data = JSON.parse(jsonText) as A2uiSurfaceUpdate;
      
      // Basic validation
      if (!data.type || data.type !== 'surfaceUpdate') {
        throw new Error('Invalid A2UI message: type must be "surfaceUpdate"');
      }
      if (!Array.isArray(data.components)) {
        throw new Error('Invalid A2UI message: components must be an array');
      }
      
      setParsedData(data);
      setParseError(null);
    } catch (err) {
      setParsedData(null);
      setParseError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }, [jsonText]);

  // Handle example selection
  const handleExampleSelect = useCallback((value: string) => {
    setSelectedExample(value);
    const example = examples.find((e) => e.name === value);
    if (example) {
      setJsonText(JSON.stringify(example.data, null, 2));
    }
  }, []);

  // Format JSON
  const handleFormat = useCallback(() => {
    try {
      const data = JSON.parse(jsonText);
      setJsonText(JSON.stringify(data, null, 2));
    } catch {
      // Ignore format errors
    }
  }, [jsonText]);

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3">
        <Row justify="between" align="center">
          <Row gap="md" align="center">
            <Heading level={3}>A2UI Demo</Heading>
            <Badge variant="outline">JSON → UI</Badge>
          </Row>
          <Row gap="sm" align="center">
            <Select
              value={selectedExample}
              onValueChange={handleExampleSelect}
              placeholder="Load Example..."
              options={examples.map((e) => ({ value: e.name, label: e.name }))}
              className="w-48"
            />
            <Button variant="outline" size="sm" onClick={handleFormat}>
              Format JSON
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <ThemeModeToggle size="sm" />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowThemePanel(!showThemePanel)}
            >
              🎨 Theme
            </Button>
          </Row>
        </Row>
      </header>
      
      {/* Theme Panel */}
      <ThemeControlsPanel 
        isOpen={showThemePanel} 
        onClose={() => setShowThemePanel(false)} 
      />

        {/* Main Content - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: JSON Editor */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="border-b px-4 py-2 bg-muted/50">
              <Row justify="between" align="center">
                <Text weight="medium" size="sm">A2UI JSON Input</Text>
                <Text variant="muted" size="sm">
                  {parsedData?.components?.length || 0} components
                </Text>
              </Row>
            </div>
            <div className="flex-1 overflow-hidden">
              <EditorPanel
                value={jsonText}
                onChange={setJsonText}
                error={parseError}
              />
            </div>
          </div>

          {/* Right: Rendered UI */}
          <div className="w-1/2 flex flex-col">
            <div className="border-b px-4 py-2 bg-muted/50">
              <Row justify="between" align="center">
                <Text weight="medium" size="sm">Rendered UI</Text>
                <Badge variant={parseError ? 'destructive' : 'success'}>
                  {parseError ? 'Error' : 'Valid'}
                </Badge>
              </Row>
            </div>
            <div className="flex-1 overflow-auto bg-background">
              <RendererPanel jsonData={parsedData} error={parseError} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t bg-card px-4 py-2">
          <Row justify="between" align="center">
            <Text variant="muted" size="sm">
              AevatarKit SDK • A2UI Components: 43 • Theme System: 8 presets
            </Text>
            <Text variant="muted" size="sm">
              Edit JSON on the left → See rendered UI on the right
            </Text>
          </Row>
        </footer>
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App Wrapper with Providers
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider defaultPreset="default" defaultMode="system">
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
