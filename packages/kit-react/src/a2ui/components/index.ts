/**
 * ============================================================================
 * A2UI Components Index
 * ============================================================================
 * 
 * 导出所有 A2UI 标准组件 (43个)
 * 
 * Layout (7): Container, Row, Column, Grid, Card, Divider, Spacer
 * Input (12): TextField, TextArea, Checkbox, Switch, Select, NumberInput,
 *             Radio, DatePicker, TimePicker, DateTimePicker, Slider, FileUpload
 * Content (15): Text, Heading, Paragraph, Link, Badge, Button, Image,
 *               Progress, Alert, Avatar, Code, List, Table, Icon, Tooltip
 * Feedback (5): Dialog, AlertDialog, Toast, Popover, Skeleton
 * Navigation (4): Tabs, Accordion, DropdownMenu, Breadcrumb
 * 
 * ============================================================================
 */

// Layout Components
export {
  Container,
  Row,
  Column,
  Grid,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Divider,
  Separator,
  Spacer,
  type ContainerProps,
  type RowProps,
  type ColumnProps,
  type GridProps,
  type CardProps,
  type DividerProps,
  type SpacerProps,
} from './layout';

// Input Components
export {
  Label,
  TextField,
  Input,
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
  type LabelProps,
  type TextFieldProps,
  type TextAreaProps,
  type CheckboxProps,
  type SwitchProps,
  type SelectProps,
  type SelectOption,
  type NumberInputProps,
  type RadioProps,
  type RadioOption,
  type SliderProps,
  type DatePickerProps,
  type TimePickerProps,
  type DateTimePickerProps,
  type FileUploadProps,
} from './inputs';

// Content Components
export {
  Text,
  Heading,
  Paragraph,
  Link,
  Badge,
  Button,
  buttonVariants,
  Image,
  Progress,
  Alert,
  Avatar,
  Code,
  List,
  Table,
  Icon,
  Tooltip,
  type TextProps,
  type HeadingProps,
  type ParagraphProps,
  type LinkProps,
  type BadgeProps,
  type ButtonProps,
  type ImageProps,
  type ProgressProps,
  type AlertProps,
  type AvatarProps,
  type CodeProps,
  type ListProps,
  type ListItem,
  type TableProps,
  type TableColumn,
  type IconProps,
  type TooltipProps,
} from './content';

// Feedback Components
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  AlertDialog,
  ToastProvider,
  useToast,
  Popover,
  Skeleton,
  type DialogProps,
  type AlertDialogProps,
  type ToastData,
  type PopoverProps,
  type SkeletonProps,
} from './feedback';

// Navigation Components
export {
  Tabs,
  Accordion,
  DropdownMenu,
  Breadcrumb,
  type TabsProps,
  type TabItem,
  type AccordionProps,
  type AccordionItem,
  type DropdownMenuProps,
  type DropdownMenuItem,
  type BreadcrumbProps,
  type BreadcrumbItem,
} from './navigation';

