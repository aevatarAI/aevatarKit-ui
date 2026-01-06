# MoleculeViewer 组件文档

> A2UI 分子可视化组件 - 基于 iCn3D (NCBI)

---

## 📋 概述

`MoleculeViewer` 是 AevatarKit A2UI 的科学可视化组件，用于渲染蛋白质、分子结构等 PDB 格式数据。

- **渲染引擎**: iCn3D (NCBI 开发)
- **技术栈**: WebGL + Three.js
- **数据格式**: PDB 文本 / PDB ID (RCSB 远程加载)

---

## 🚀 快速开始

### 基础用法

```tsx
import { MoleculeViewer } from '@aevatar/kit-react/a2ui';

// 使用 PDB 文本数据
<MoleculeViewer
  pdbData={pdbTextContent}
  style="cartoon"
  colorScheme="chain"
  height="400px"
/>

// 使用 PDB ID 远程加载
<MoleculeViewer
  pdbId="1CRN"
  style="ribbon"
  colorScheme="secondary"
/>
```

### A2UI JSON 用法

```json
{
  "type": "surfaceUpdate",
  "components": [{
    "id": "protein_viewer",
    "component": {
      "MoleculeViewer": {
        "pdbId": { "literalString": "4INS" },
        "style": { "literalString": "cartoon" },
        "colorScheme": { "literalString": "chain" },
        "backgroundColor": { "literalString": "#1a1a2e" },
        "showHBonds": { "literalBoolean": true },
        "width": { "literalString": "100%" },
        "height": { "literalString": "500px" }
      }
    }
  }]
}
```

---

## 📖 API 参考

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pdbData` | `string` | - | PDB 格式文本数据 |
| `pdbId` | `string` | - | PDB ID (从 RCSB 加载) |
| `style` | `MoleculeStyle` | `'cartoon'` | 渲染样式 |
| `colorScheme` | `MoleculeColorScheme` | `'chain'` | 颜色方案 |
| `backgroundColor` | `string` | `'#1a1a2e'` | 背景颜色 |
| `showWater` | `boolean` | `false` | 显示水分子 |
| `showHBonds` | `boolean` | `false` | 显示氢键 |
| `showLigands` | `boolean` | `true` | 显示配体 |
| `enableRotate` | `boolean` | `true` | 允许旋转 |
| `enableZoom` | `boolean` | `true` | 允许缩放 |
| `autoRotate` | `boolean` | `false` | 自动旋转 |
| `width` | `string \| number` | `'100%'` | 宽度 |
| `height` | `string \| number` | `'400px'` | 高度 |
| `onLoad` | `() => void` | - | 加载完成回调 |
| `onError` | `(error: Error) => void` | - | 错误回调 |

### MoleculeStyle

```typescript
type MoleculeStyle =
  | 'ribbon'      // 带状
  | 'cartoon'     // 卡通 (默认)
  | 'sphere'      // 球体
  | 'stick'       // 棍状
  | 'line'        // 线条
  | 'surface'     // 表面
  | 'ballstick';  // 球棍
```

### MoleculeColorScheme

```typescript
type MoleculeColorScheme =
  | 'chain'           // 按链着色 (默认)
  | 'secondary'       // 按二级结构
  | 'residue'         // 按残基类型
  | 'atom'            // 按原子类型
  | 'bfactor'         // 按 B-Factor
  | 'hydrophobicity'  // 按疏水性
  | 'charge';         // 按电荷
```

---

## 🎯 使用场景

### 1. 蛋白质结构展示

```tsx
<MoleculeViewer
  pdbId="1HHO"              // 血红蛋白
  style="cartoon"
  colorScheme="chain"
  showHBonds={true}
/>
```

### 2. 药物分子对接

```tsx
<MoleculeViewer
  pdbId="6LU7"              // COVID-19 主蛋白酶
  style="surface"
  showLigands={true}
  colorScheme="hydrophobicity"
/>
```

### 3. 教育演示

```tsx
<MoleculeViewer
  pdbData={dnaHelixPdb}
  style="ballstick"
  autoRotate={true}
  backgroundColor="#000000"
/>
```

---

## 📊 性能建议

| 分子大小 | 原子数 | 推荐配置 |
|----------|--------|----------|
| 小分子 | < 500 | 任意样式 |
| 中等蛋白 | 500-5000 | `cartoon`, `ribbon` |
| 大型复合物 | 5000-20000 | `cartoon`, 禁用 `autoRotate` |
| 超大结构 | > 20000 | `line`, 考虑简化 |

### 数据传输建议

- **小数据 (< 50KB)**: 直接使用 `pdbData`
- **大数据 (> 50KB)**: 使用 `pdbId` 远程加载
- **超大数据**: 考虑服务端预处理/压缩

---

## 🔧 后端集成

### A2UI 消息格式

```json
{
  "type": "surfaceUpdate",
  "components": [{
    "id": "viewer",
    "component": {
      "MoleculeViewer": {
        "pdbData": { "path": "/molecule/pdb" },
        "style": { "literalString": "cartoon" }
      }
    }
  }]
}
```

```json
{
  "type": "dataModelUpdate",
  "path": "/molecule",
  "contents": [{
    "key": "pdb",
    "valueString": "HEADER    PROTEIN\nATOM      1  N   ALA A   1..."
  }]
}
```

---

## 🏃 运行示例

```bash
cd examples/molecule-demo
pnpm install
pnpm dev
# 访问 http://localhost:5174
```

---

## 📚 参考资源

- [iCn3D 官方文档](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html)
- [RCSB PDB 数据库](https://www.rcsb.org/)
- [PDB 文件格式规范](https://www.wwpdb.org/documentation/file-format)

---

*版本: 0.2.0*  
*创建日期: 2025-12-31*

