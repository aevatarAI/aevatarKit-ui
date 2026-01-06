/**
 * ============================================================================
 * Molecule Viewer Demo - AevatarKit
 * ============================================================================
 *
 * 展示 MoleculeViewer 组件的完整功能：
 * - PDB 文本数据渲染
 * - PDB ID 远程加载
 * - 多种渲染样式
 * - 颜色方案切换
 * - A2UI 模拟流式渲染
 *
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import { MoleculeViewer } from '@aevatar/kit-react';
import type { MoleculeStyle, MoleculeColorScheme } from '@aevatar/kit-react';
import { CRAMBIN_PDB, SAMPLE_MOLECULES } from './samplePdb';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MoleculeSource {
  type: 'pdbData' | 'pdbId';
  value: string;
  name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STYLES: { value: MoleculeStyle; label: string }[] = [
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'ribbon', label: 'Ribbon' },
  { value: 'stick', label: 'Stick' },
  { value: 'sphere', label: 'Sphere' },
  { value: 'line', label: 'Line' },
  { value: 'surface', label: 'Surface' },
  { value: 'ballstick', label: 'Ball & Stick' },
];

const COLOR_SCHEMES: { value: MoleculeColorScheme; label: string }[] = [
  { value: 'chain', label: 'Chain' },
  { value: 'secondary', label: 'Secondary Structure' },
  { value: 'residue', label: 'Residue' },
  { value: 'atom', label: 'Atom Type' },
  { value: 'bfactor', label: 'B-Factor' },
  { value: 'hydrophobicity', label: 'Hydrophobicity' },
];

const BACKGROUND_COLORS = [
  { value: '#1a1a2e', label: 'Dark Blue' },
  { value: '#0f0f23', label: 'Deep Space' },
  { value: '#000000', label: 'Black' },
  { value: '#1a1a1a', label: 'Dark Gray' },
  { value: '#0d1b2a', label: 'Navy' },
  { value: '#2d3436', label: 'Charcoal' },
];

// ─────────────────────────────────────────────────────────────────────────────
// App Component
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  // State
  const [source, setSource] = useState<MoleculeSource>({
    type: 'pdbData',
    value: CRAMBIN_PDB,
    name: 'Crambin',
  });
  const [style, setStyle] = useState<MoleculeStyle>('cartoon');
  const [colorScheme, setColorScheme] = useState<MoleculeColorScheme>('chain');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [showHBonds, setShowHBonds] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [customPdbId, setCustomPdbId] = useState('');

  // Handlers
  const handleMoleculeSelect = useCallback((mol: typeof SAMPLE_MOLECULES[0]) => {
    if (mol.pdbData) {
      setSource({ type: 'pdbData', value: mol.pdbData, name: mol.name });
    } else if (mol.pdbId) {
      setSource({ type: 'pdbId', value: mol.pdbId, name: mol.name });
    }
  }, []);

  const handleCustomPdbLoad = useCallback(() => {
    if (customPdbId.trim()) {
      setSource({
        type: 'pdbId',
        value: customPdbId.trim().toUpperCase(),
        name: customPdbId.trim().toUpperCase(),
      });
    }
  }, [customPdbId]);

  const handleLoad = useCallback(() => {
    console.log('Molecule loaded successfully');
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('Failed to load molecule:', error.message);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🧬</span>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Molecule Viewer Demo
              </h1>
              <p className="text-sm text-muted-foreground">
                AevatarKit A2UI Component - iCn3D Integration
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main Viewer */}
          <div className="space-y-4">
            {/* Current Molecule Info */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {source.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Source: {source.type === 'pdbData' ? 'Local PDB Data' : `RCSB PDB (${source.value})`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {autoRotate && (
                    <span className="rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">
                      Auto Rotate
                    </span>
                  )}
                  {showHBonds && (
                    <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                      H-Bonds
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Molecule Viewer */}
            <MoleculeViewer
              pdbData={source.type === 'pdbData' ? source.value : undefined}
              pdbId={source.type === 'pdbId' ? source.value : undefined}
              style={style}
              colorScheme={colorScheme}
              backgroundColor={backgroundColor}
              showHBonds={showHBonds}
              showWater={showWater}
              autoRotate={autoRotate}
              width="100%"
              height="500px"
              onLoad={handleLoad}
              onError={handleError}
            />

            {/* A2UI Usage Example */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">
                📋 A2UI JSON Example
              </h3>
              <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
{`{
  "type": "surfaceUpdate",
  "components": [{
    "id": "protein_viewer",
    "component": {
      "MoleculeViewer": {
        "pdbId": { "literalString": "${source.type === 'pdbId' ? source.value : '1CRN'}" },
        "style": { "literalString": "${style}" },
        "colorScheme": { "literalString": "${colorScheme}" },
        "backgroundColor": { "literalString": "${backgroundColor}" },
        "showHBonds": { "literalBoolean": ${showHBonds} }
      }
    }
  }]
}`}
              </pre>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-4">
            {/* Sample Molecules */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">
                🔬 Sample Molecules
              </h3>
              <div className="space-y-2">
                {SAMPLE_MOLECULES.map((mol) => (
                  <button
                    key={mol.id}
                    onClick={() => handleMoleculeSelect(mol)}
                    className={`w-full rounded-md border p-3 text-left transition-colors ${
                      source.name === mol.name
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium text-foreground">{mol.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {mol.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom PDB ID */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">
                🔍 Load by PDB ID
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPdbId}
                  onChange={(e) => setCustomPdbId(e.target.value)}
                  placeholder="e.g., 4INS"
                  className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleCustomPdbLoad}
                  disabled={!customPdbId.trim()}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Load
                </button>
              </div>
            </div>

            {/* Style Selection */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">
                🎨 Render Style
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      style === s.value
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">
                🌈 Color Scheme
              </h3>
              <div className="space-y-2">
                {COLOR_SCHEMES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColorScheme(c.value)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      colorScheme === c.value
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">
                🖼️ Background
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUND_COLORS.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => setBackgroundColor(bg.value)}
                    className={`aspect-square rounded-md border-2 transition-all ${
                      backgroundColor === bg.value
                        ? 'border-primary scale-110'
                        : 'border-transparent hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: bg.value }}
                    title={bg.label}
                  />
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">
                ⚙️ Options
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Show H-Bonds
                  </span>
                  <input
                    type="checkbox"
                    checked={showHBonds}
                    onChange={(e) => setShowHBonds(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Show Water
                  </span>
                  <input
                    type="checkbox"
                    checked={showWater}
                    onChange={(e) => setShowWater(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Auto Rotate
                  </span>
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Powered by{' '}
            <a
              href="https://www.ncbi.nlm.nih.gov/Structure/icn3d/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              iCn3D (NCBI)
            </a>
            {' '}&{' '}
            <a
              href="https://github.com/aevatar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              AevatarKit SDK
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

