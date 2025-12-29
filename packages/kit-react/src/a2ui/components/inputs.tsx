/**
 * ============================================================================
 * A2UI Input Components (shadcn/ui + Radix UI)
 * ============================================================================
 * 
 * 输入组件: TextField, TextArea, Checkbox, Switch, Select, NumberInput,
 *          Radio, DatePicker, TimePicker, DateTimePicker, Slider, FileUpload
 * 
 * ============================================================================
 */

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { useA2uiAction } from '../A2uiRenderer';

// ─────────────────────────────────────────────────────────────────────────────
// Label
// ─────────────────────────────────────────────────────────────────────────────

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {}

export function Label({ className, ...props }: LabelProps) {
  return <LabelPrimitive.Root className={cn(labelVariants(), className)} {...props} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// TextField (Input)
// ─────────────────────────────────────────────────────────────────────────────

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextField({
  className,
  type = 'text',
  label,
  error,
  hint,
  id,
  ...props
}: TextFieldProps) {
  const actionCtx = useA2uiAction();
  const inputId = id || React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e);
    actionCtx?.dispatchAction('change', { value: e.target.value });
  };

  return (
    <div className="grid w-full gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        type={type}
        id={inputId}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
        onChange={handleChange}
      />
      {(error || hint) && (
        <p className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

// Alias
export const Input = TextField;

// ─────────────────────────────────────────────────────────────────────────────
// TextArea
// ─────────────────────────────────────────────────────────────────────────────

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextArea({ className, label, error, hint, id, ...props }: TextAreaProps) {
  const actionCtx = useA2uiAction();
  const textareaId = id || React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange?.(e);
    actionCtx?.dispatchAction('change', { value: e.target.value });
  };

  return (
    <div className="grid w-full gap-1.5">
      {label && <Label htmlFor={textareaId}>{label}</Label>}
      <textarea
        id={textareaId}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
        onChange={handleChange}
      />
      {(error || hint) && (
        <p className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
}

export function Checkbox({ className, label, id, onCheckedChange, ...props }: CheckboxProps) {
  const actionCtx = useA2uiAction();
  const checkboxId = id || React.useId();

  const handleCheckedChange = (checked: CheckboxPrimitive.CheckedState) => {
    onCheckedChange?.(checked);
    actionCtx?.dispatchAction('change', { value: checked });
  };

  return (
    <div className="flex items-center space-x-2">
      <CheckboxPrimitive.Root
        id={checkboxId}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          className
        )}
        onCheckedChange={handleCheckedChange}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M10 3L4.5 8.5L2 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <Label htmlFor={checkboxId} className="cursor-pointer">
          {label}
        </Label>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Switch (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
}

export function Switch({ className, label, id, onCheckedChange, ...props }: SwitchProps) {
  const actionCtx = useA2uiAction();
  const switchId = id || React.useId();

  const handleCheckedChange = (checked: boolean) => {
    onCheckedChange?.(checked);
    actionCtx?.dispatchAction('change', { value: checked });
  };

  return (
    <div className="flex items-center space-x-2">
      <SwitchPrimitive.Root
        id={switchId}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2',
          'border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
          className
        )}
        onCheckedChange={handleCheckedChange}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0',
            'transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
          )}
        />
      </SwitchPrimitive.Root>
      {label && (
        <Label htmlFor={switchId} className="cursor-pointer">
          {label}
        </Label>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Select (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  options?: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Select({
  value,
  options = [],
  placeholder = 'Select...',
  label,
  error,
  disabled,
  onValueChange,
  className,
}: SelectProps) {
  const actionCtx = useA2uiAction();

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    actionCtx?.dispatchAction('change', { value: newValue });
  };

  return (
    <div className="grid w-full gap-1.5">
      {label && <Label>{label}</Label>}
      <SelectPrimitive.Root value={value} onValueChange={handleValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input',
            'bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&>span]:line-clamp-1',
            error && 'border-destructive',
            className
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-50">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover',
              'text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
            )}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2',
                    'text-sm outline-none focus:bg-accent focus:text-accent-foreground',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NumberInput
// ─────────────────────────────────────────────────────────────────────────────

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  onChange?: (value: number) => void;
}

export function NumberInput({ className, label, error, hint, id, onChange, ...props }: NumberInputProps) {
  const actionCtx = useA2uiAction();
  const inputId = id || React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onChange?.(value);
    actionCtx?.dispatchAction('change', { value });
  };

  return (
    <div className="grid w-full gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        type="number"
        id={inputId}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {(error || hint) && (
        <p className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Radio (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioProps {
  value?: string;
  options?: RadioOption[];
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Radio({
  value,
  options = [],
  label,
  orientation = 'vertical',
  onValueChange,
  className,
}: RadioProps) {
  const actionCtx = useA2uiAction();

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    actionCtx?.dispatchAction('change', { value: newValue });
  };

  return (
    <div className="grid gap-2">
      {label && <Label>{label}</Label>}
      <RadioGroupPrimitive.Root
        value={value}
        onValueChange={handleValueChange}
        className={cn(
          'grid gap-2',
          orientation === 'horizontal' && 'grid-flow-col',
          className
        )}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupPrimitive.Item
              value={option.value}
              disabled={option.disabled}
              className={cn(
                'aspect-square h-4 w-4 rounded-full border border-primary text-primary',
                'ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-current" />
              </RadioGroupPrimitive.Indicator>
            </RadioGroupPrimitive.Item>
            <Label className="cursor-pointer font-normal">{option.label}</Label>
          </div>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slider (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
}

export function Slider({ className, label, showValue, onValueChange, ...props }: SliderProps) {
  const actionCtx = useA2uiAction();
  const [localValue, setLocalValue] = React.useState(props.value || props.defaultValue || [0]);

  const handleValueChange = (value: number[]) => {
    setLocalValue(value);
    onValueChange?.(value);
    actionCtx?.dispatchAction('change', { value: value[0] });
  };

  return (
    <div className="grid gap-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <Label>{label}</Label>}
          {showValue && <span className="text-sm text-muted-foreground">{localValue[0]}</span>}
        </div>
      )}
      <SliderPrimitive.Root
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        onValueChange={handleValueChange}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DatePicker (Native HTML5 with styling)
// ─────────────────────────────────────────────────────────────────────────────

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function DatePicker({ className, label, error, id, ...props }: DatePickerProps) {
  const actionCtx = useA2uiAction();
  const inputId = id || React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e);
    actionCtx?.dispatchAction('change', { value: e.target.value });
  };

  return (
    <div className="grid w-full gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        type="date"
        id={inputId}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TimePicker (Native HTML5 with styling)
// ─────────────────────────────────────────────────────────────────────────────

export interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function TimePicker({ className, label, error, id, ...props }: TimePickerProps) {
  const actionCtx = useA2uiAction();
  const inputId = id || React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e);
    actionCtx?.dispatchAction('change', { value: e.target.value });
  };

  return (
    <div className="grid w-full gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        type="time"
        id={inputId}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DateTimePicker (Native HTML5 with styling)
// ─────────────────────────────────────────────────────────────────────────────

export interface DateTimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function DateTimePicker({ className, label, error, id, ...props }: DateTimePickerProps) {
  const actionCtx = useA2uiAction();
  const inputId = id || React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e);
    actionCtx?.dispatchAction('change', { value: e.target.value });
  };

  return (
    <div className="grid w-full gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        type="datetime-local"
        id={inputId}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FileUpload
// ─────────────────────────────────────────────────────────────────────────────

export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  hint?: string;
  accept?: string;
  onFilesChange?: (files: FileList | null) => void;
}

export function FileUpload({ className, label, hint, accept, onFilesChange, id, ...props }: FileUploadProps) {
  const actionCtx = useA2uiAction();
  const inputId = id || React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e);
    onFilesChange?.(e.target.files);
    actionCtx?.dispatchAction('change', { files: e.target.files?.length || 0 });
  };

  return (
    <div className="grid w-full gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        type="file"
        id={inputId}
        accept={accept}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

