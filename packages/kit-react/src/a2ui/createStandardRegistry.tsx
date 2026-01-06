/**
 * ============================================================================
 * A2UI Standard Component Registry Factory
 * ============================================================================
 * 
 * 创建预注册标准组件的 A2UI 组件注册表
 * 包含 44 个 shadcn/ui + Radix UI 标准组件 + 科学可视化组件
 * 
 * Categories:
 * - Layout (7): Container, Row, Column, Grid, Card, Divider, Spacer
 * - Input (12): TextField, TextArea, Checkbox, Switch, Select, etc.
 * - Content (15): Text, Heading, Button, Image, Progress, etc.
 * - Feedback (5): Dialog, AlertDialog, Toast, Popover, Skeleton
 * - Navigation (4): Tabs, Accordion, DropdownMenu, Breadcrumb
 * - Science (1): MoleculeViewer (iCn3D)
 * 
 * ============================================================================
 */

import type { ReactNode } from 'react';
import { createComponentRegistry, type A2uiComponentRegistry, type ComponentRenderer } from '@aevatar/kit-a2ui';

// Layout Components (7)
import {
  Container,
  Row,
  Column,
  Grid,
  Card,
  Divider,
  Spacer,
} from './components/layout';

// Input Components (12)
import {
  Label,
  TextField,
  TextArea,
  Checkbox,
  Switch,
  Select,
  NumberInput,
  Radio,
  Slider,
  DatePicker,
  TimePicker,
  DateTimePicker,
  FileUpload,
} from './components/inputs';

// Content Components (15)
import {
  Text,
  Heading,
  Paragraph,
  Link,
  Badge,
  Button,
  Image,
  Progress,
  Alert,
  Avatar,
  Code,
  List,
  Table,
  Icon,
  Tooltip,
} from './components/content';

// Feedback Components (5)
import {
  Dialog,
  AlertDialog,
  Popover,
  Skeleton,
} from './components/feedback';

// Navigation Components (4)
import {
  Tabs,
  Accordion,
  DropdownMenu,
  Breadcrumb,
} from './components/navigation';

// Science Components (1)
import { MoleculeViewer } from './components/science';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StandardRegistryOptions {
  /** 是否允许未注册的组件 */
  allowUnregistered?: boolean;
  /** 额外的组件注册 */
  additionalComponents?: Record<string, ComponentRenderer<Record<string, unknown>, ReactNode>>;
  /** 组件覆盖 */
  overrides?: Record<string, ComponentRenderer<Record<string, unknown>, ReactNode>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard Component Renderers (43个组件)
// 使用 React.createElement 确保正确渲染
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
const standardRenderers: Record<string, ComponentRenderer<any, ReactNode>> = {
  // ==================== Layout (7) ====================
  Container: (props: any) => <Container {...props} />,
  Row: (props: any) => <Row {...props} />,
  Column: (props: any) => <Column {...props} />,
  Grid: (props: any) => <Grid {...props} />,
  Card: (props: any) => <Card {...props} />,
  Divider: (props: any) => <Divider {...props} />,
  Separator: (props: any) => <Divider {...props} />, // alias
  Spacer: (props: any) => <Spacer {...props} />,
  
  // ==================== Input (12) ====================
  Label: (props: any) => <Label {...props} />,
  TextField: (props: any) => <TextField {...props} />,
  Input: (props: any) => <TextField {...props} />, // alias
  TextArea: (props: any) => <TextArea {...props} />,
  Checkbox: (props: any) => <Checkbox {...props} />,
  Switch: (props: any) => <Switch {...props} />,
  Select: (props: any) => <Select {...props} />,
  NumberInput: (props: any) => <NumberInput {...props} />,
  Radio: (props: any) => <Radio {...props} />,
  RadioGroup: (props: any) => <Radio {...props} />, // alias
  Slider: (props: any) => <Slider {...props} />,
  DatePicker: (props: any) => <DatePicker {...props} />,
  TimePicker: (props: any) => <TimePicker {...props} />,
  DateTimePicker: (props: any) => <DateTimePicker {...props} />,
  FileUpload: (props: any) => <FileUpload {...props} />,
  
  // ==================== Content (15) ====================
  Text: (props: any) => <Text {...props} />,
  Heading: (props: any) => <Heading {...props} />,
  Paragraph: (props: any) => <Paragraph {...props} />,
  Link: (props: any) => <Link {...props} />,
  Badge: (props: any) => <Badge {...props} />,
  Button: (props: any) => <Button {...props} />,
  Image: (props: any) => <Image {...props} />,
  Progress: (props: any) => <Progress {...props} />,
  ProgressBar: (props: any) => <Progress {...props} />, // alias
  Alert: (props: any) => <Alert {...props} />,
  Avatar: (props: any) => <Avatar {...props} />,
  Code: (props: any) => <Code {...props} />,
  List: (props: any) => <List {...props} />,
  Table: (props: any) => <Table {...props} />,
  Icon: (props: any) => <Icon {...props} />,
  Tooltip: (props: any) => <Tooltip {...props} />,
  
  // ==================== Feedback (5) ====================
  Dialog: (props: any) => <Dialog {...props} />,
  Modal: (props: any) => <Dialog {...props} />, // alias
  AlertDialog: (props: any) => <AlertDialog {...props} />,
  ConfirmDialog: (props: any) => <AlertDialog {...props} />, // alias
  Popover: (props: any) => <Popover {...props} />,
  Skeleton: (props: any) => <Skeleton {...props} />,
  
  // ==================== Navigation (4) ====================
  Tabs: (props: any) => <Tabs {...props} />,
  Accordion: (props: any) => <Accordion {...props} />,
  DropdownMenu: (props: any) => <DropdownMenu {...props} />,
  Dropdown: (props: any) => <DropdownMenu {...props} />, // alias
  Breadcrumb: (props: any) => <Breadcrumb {...props} />,
  
  // ==================== Science (1) ====================
  MoleculeViewer: (props: any) => <MoleculeViewer {...props} />,
  ProteinViewer: (props: any) => <MoleculeViewer {...props} />, // alias
  Molecule3D: (props: any) => <MoleculeViewer {...props} />, // alias
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─────────────────────────────────────────────────────────────────────────────
// Factory Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 创建包含标准组件的 A2UI 组件注册表
 */
export function createStandardRegistry(
  options: StandardRegistryOptions = {}
): A2uiComponentRegistry<ReactNode> {
  const {
    allowUnregistered = false,
    additionalComponents = {},
    overrides = {},
  } = options;

  const registry = createComponentRegistry<ReactNode>({
    allowUnregistered,
    fallbackRenderer: allowUnregistered 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (_props: any) => null
      : undefined,
  });

  // 注册标准组件 (可被覆盖)
  const allRenderers = {
    ...standardRenderers,
    ...overrides,
    ...additionalComponents,
  };

  for (const [type, renderer] of Object.entries(allRenderers)) {
    registry.register(type, renderer);
  }

  return registry;
}

/**
 * 获取标准组件列表
 */
export function getStandardComponentTypes(): string[] {
  return Object.keys(standardRenderers);
}

/**
 * 检查是否为标准组件
 */
export function isStandardComponent(type: string): boolean {
  return type in standardRenderers;
}

/**
 * 获取组件分类
 */
export function getComponentCategories(): Record<string, string[]> {
  return {
    layout: ['Container', 'Row', 'Column', 'Grid', 'Card', 'Divider', 'Spacer'],
    input: ['Label', 'TextField', 'TextArea', 'Checkbox', 'Switch', 'Select', 
            'NumberInput', 'Radio', 'Slider', 'DatePicker', 'TimePicker', 
            'DateTimePicker', 'FileUpload'],
    content: ['Text', 'Heading', 'Paragraph', 'Link', 'Badge', 'Button', 
              'Image', 'Progress', 'Alert', 'Avatar', 'Code', 'List', 
              'Table', 'Icon', 'Tooltip'],
    feedback: ['Dialog', 'AlertDialog', 'Popover', 'Skeleton'],
    navigation: ['Tabs', 'Accordion', 'DropdownMenu', 'Breadcrumb'],
    science: ['MoleculeViewer'],
  };
}
