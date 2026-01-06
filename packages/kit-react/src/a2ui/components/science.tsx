/**
 * ============================================================================
 * A2UI Science Components - 科学可视化组件
 * ============================================================================
 *
 * 包含分子结构、蛋白质等科学数据可视化组件
 * 使用 3Dmol.js (npm) 进行 3D 分子渲染
 *
 * ============================================================================
 */

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import * as $3Dmol from '3dmol';
import { cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// MoleculeViewer Types
// ─────────────────────────────────────────────────────────────────────────────

export type MoleculeStyle =
  | 'ribbon'
  | 'cartoon'
  | 'sphere'
  | 'stick'
  | 'line'
  | 'surface'
  | 'ballstick';

export type MoleculeColorScheme =
  | 'chain'
  | 'secondary'
  | 'residue'
  | 'atom'
  | 'bfactor'
  | 'hydrophobicity'
  | 'charge';

export interface MoleculeViewerProps {
  /** PDB 格式文本数据 */
  pdbData?: string;
  /** PDB ID (从 RCSB 远程加载) */
  pdbId?: string;
  /** 渲染样式 */
  style?: MoleculeStyle;
  /** 颜色方案 */
  colorScheme?: MoleculeColorScheme;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 是否显示水分子 */
  showWater?: boolean;
  /** 是否显示氢键 */
  showHBonds?: boolean;
  /** 是否显示配体 */
  showLigands?: boolean;
  /** 是否允许旋转 */
  enableRotate?: boolean;
  /** 是否允许缩放 */
  enableZoom?: boolean;
  /** 是否自动旋转 */
  autoRotate?: boolean;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 自定义类名 */
  className?: string;
  /** 加载完成回调 */
  onLoad?: () => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** A2UI action 回调 */
  onAction?: () => void;
  /** 子元素 */
  children?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// MoleculeViewer Component
// ─────────────────────────────────────────────────────────────────────────────

export const MoleculeViewer = memo(function MoleculeViewer({
  pdbData,
  pdbId,
  style = 'cartoon',
  colorScheme = 'chain',
  backgroundColor = '#1a1a2e',
  showWater = false,
  showHBonds = false,
  showLigands = true,
  enableRotate = true,
  enableZoom = true,
  autoRotate = false,
  width = '100%',
  height = '400px',
  className,
  onLoad,
  onError,
}: MoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moleculeInfo, setMoleculeInfo] = useState<{
    name?: string;
    atoms?: number;
    residues?: number;
  } | null>(null);

  // Get 3Dmol style config
  const getStyleConfig = useCallback((styleName: MoleculeStyle, scheme: MoleculeColorScheme) => {
    // Color configuration
    const colorConfig: Record<MoleculeColorScheme, any> = {
      chain: { color: 'spectrum' },
      secondary: { color: 'ssPyMOL' },
      residue: { color: 'residue' },
      atom: { colorscheme: 'Jmol' },
      bfactor: { color: 'b' },
      hydrophobicity: { colorscheme: 'hydrophobicity' },
      charge: { colorscheme: 'charge' },
    };

    const color = colorConfig[scheme] || { color: 'spectrum' };

    // Style configuration
    const styleConfig: Record<MoleculeStyle, any> = {
      cartoon: { cartoon: { ...color } },
      ribbon: { cartoon: { style: 'trace', ...color } },
      stick: { stick: { ...color } },
      sphere: { sphere: { ...color } },
      line: { line: { ...color } },
      surface: { surface: { opacity: 0.8, ...color } },
      ballstick: { stick: { radius: 0.15, ...color }, sphere: { radius: 0.3, ...color } },
    };

    return styleConfig[styleName] || styleConfig.cartoon;
  }, []);

  // Initialize viewer
  const initViewer = useCallback(async () => {
    if (!containerRef.current) return;
    if (!pdbData && !pdbId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Clear previous instance
      if (viewerRef.current) {
        viewerRef.current.clear();
      }
      containerRef.current.innerHTML = '';

      // Get actual container dimensions and set container size
      const rect = containerRef.current.getBoundingClientRect();
      const viewerWidth = rect.width || 600;
      const viewerHeight = rect.height || 400;
      
      // Set container dimensions explicitly for 3Dmol
      containerRef.current.style.width = `${viewerWidth}px`;
      containerRef.current.style.height = `${viewerHeight}px`;

      // Create viewer (3Dmol reads dimensions from container)
      const viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor,
        antialias: true,
        disableFog: true,
      } as $3Dmol.ViewerSpec);
      viewerRef.current = viewer;

      // Fetch PDB data if pdbId is provided
      let pdbContent = pdbData;
      if (!pdbContent && pdbId) {
        const response = await fetch(`https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDB ${pdbId}: ${response.statusText}`);
        }
        pdbContent = await response.text();
      }

      if (!pdbContent) {
        throw new Error('No PDB data available');
      }

      // Add model
      viewer.addModel(pdbContent, 'pdb');

      // Get atom count for info
      const atoms = viewer.getModel().selectedAtoms({});
      const residueSet = new Set<string>();
      atoms.forEach((atom: any) => {
        if (atom.resi !== undefined) {
          residueSet.add(`${atom.chain || ''}_${atom.resi}`);
        }
      });

      setMoleculeInfo({
        name: pdbId?.toUpperCase() || 'Molecule',
        atoms: atoms.length,
        residues: residueSet.size,
      });

      // Apply style (use type assertions to work around incomplete type definitions)
      const styleConfig = getStyleConfig(style, colorScheme);
      
      // Apply main style to all atoms
      viewer.setStyle({}, styleConfig as $3Dmol.AtomStyleSpec);

      // Hide water molecules if needed
      if (!showWater) {
        viewer.setStyle({ resn: 'HOH' } as $3Dmol.AtomSelectionSpec, {} as $3Dmol.AtomStyleSpec);
        viewer.setStyle({ resn: 'WAT' } as $3Dmol.AtomSelectionSpec, {} as $3Dmol.AtomStyleSpec);
      }

      // Show ligands with different style if enabled
      if (showLigands) {
        viewer.addStyle(
          { hetflag: true } as $3Dmol.AtomSelectionSpec,
          { stick: { colorscheme: 'Jmol', radius: 0.2 } } as $3Dmol.AtomStyleSpec
        );
      }

      // Show hydrogen bonds if enabled (highlight backbone N and O)
      if (showHBonds) {
        viewer.addStyle(
          { atom: 'N' } as $3Dmol.AtomSelectionSpec,
          { sphere: { radius: 0.15, color: 'cyan' } } as $3Dmol.AtomStyleSpec
        );
        viewer.addStyle(
          { atom: 'O' } as $3Dmol.AtomSelectionSpec,
          { sphere: { radius: 0.15, color: 'red' } } as $3Dmol.AtomStyleSpec
        );
      }

      // Zoom to fit
      viewer.zoomTo();

      // Auto rotate
      if (autoRotate) {
        viewer.spin('y', 1);
      } else {
        viewer.spin(false);
      }

      // Render
      viewer.render();

      setIsLoading(false);
      onLoad?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load molecule';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [
    pdbData,
    pdbId,
    style,
    colorScheme,
    backgroundColor,
    showWater,
    showHBonds,
    showLigands,
    enableRotate,
    enableZoom,
    autoRotate,
    getStyleConfig,
    onLoad,
    onError,
  ]);

  // Initialize on mount and data change
  useEffect(() => {
    if (pdbData || pdbId) {
      initViewer();
    }

    return () => {
      // Cleanup on unmount
      if (viewerRef.current) {
        viewerRef.current.clear();
        viewerRef.current = null;
      }
    };
  }, [pdbData, pdbId, initViewer]);

  // Update spin state
  useEffect(() => {
    if (viewerRef.current) {
      if (autoRotate) {
        viewerRef.current.spin('y', 1);
      } else {
        viewerRef.current.spin(false);
      }
    }
  }, [autoRotate]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current || !viewerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (viewerRef.current && width > 0 && height > 0) {
          viewerRef.current.resize(width, height);
          viewerRef.current.render();
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isLoading]);

  // Compute dimensions
  const computedWidth = typeof width === 'number' ? `${width}px` : width;
  const computedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-background',
        'shadow-sm transition-shadow hover:shadow-md',
        className
      )}
      style={{ width: computedWidth, height: computedHeight }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-12 w-12">
              {/* DNA helix animation */}
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <div
                className="absolute inset-2 animate-spin rounded-full border-4 border-primary/30 border-b-primary"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Loading molecule...
            </span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-destructive/5 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <svg
              className="h-10 w-10 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-medium text-destructive">{error}</span>
            <button
              onClick={() => initViewer()}
              className="mt-2 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Molecule Info Badge */}
      {!isLoading && !error && moleculeInfo && (
        <div className="absolute left-2 top-2 z-10 rounded-md bg-background/80 px-2 py-1 text-xs font-mono backdrop-blur-sm">
          <span className="font-semibold text-foreground">{moleculeInfo.name}</span>
          <span className="ml-2 text-muted-foreground">
            {moleculeInfo.atoms?.toLocaleString()} atoms
          </span>
        </div>
      )}

      {/* 3Dmol Container */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          backgroundColor,
        }}
      />

      {/* Controls Hint */}
      {!isLoading && !error && (
        <div className="absolute bottom-2 right-2 z-10 rounded-md bg-background/60 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
          Drag to rotate • Scroll to zoom
        </div>
      )}
    </div>
  );
});

MoleculeViewer.displayName = 'MoleculeViewer';

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export default MoleculeViewer;

