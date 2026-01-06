/**
 * ============================================================================
 * A2UI Content Components (shadcn/ui + Radix UI)
 * ============================================================================
 * 
 * 内容组件: Text, Heading, Paragraph, Link, Badge, Button, Image, 
 *          Progress, Alert, Avatar, Code, List, Table, Icon, Markdown
 * 
 * ============================================================================
 */

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { useA2uiAction } from '../A2uiRenderer';

// ─────────────────────────────────────────────────────────────────────────────
// Text
// ─────────────────────────────────────────────────────────────────────────────

const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    variant: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      destructive: 'text-destructive',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
    variant: 'default',
  },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof textVariants> {
  text?: string;
}

export function Text({ className, size, weight, variant, text, children, ...props }: TextProps) {
  return (
    <span className={cn(textVariants({ size, weight, variant }), className)} {...props}>
      {text || children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Heading
// ─────────────────────────────────────────────────────────────────────────────

const headingVariants = cva('font-semibold tracking-tight', {
  variants: {
    level: {
      1: 'text-4xl lg:text-5xl',
      2: 'text-3xl lg:text-4xl',
      3: 'text-2xl lg:text-3xl',
      4: 'text-xl lg:text-2xl',
      5: 'text-lg lg:text-xl',
      6: 'text-base lg:text-lg',
    },
  },
  defaultVariants: {
    level: 2,
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  text?: string;
}

export function Heading({ className, level, text, children, ...props }: HeadingProps) {
  const Tag = `h${level || 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <Tag className={cn(headingVariants({ level }), className)} {...props}>
      {text || children}
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Paragraph
// ─────────────────────────────────────────────────────────────────────────────

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  text?: string;
}

export function Paragraph({ className, text, children, ...props }: ParagraphProps) {
  return (
    <p className={cn('leading-7 [&:not(:first-child)]:mt-4', className)} {...props}>
      {text || children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Link
// ─────────────────────────────────────────────────────────────────────────────

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
  external?: boolean;
}

export function Link({ className, text, external, children, ...props }: LinkProps) {
  const actionCtx = useA2uiAction();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    props.onClick?.(e);
    actionCtx?.dispatchAction('click', { href: props.href });
  };

  return (
    <a
      className={cn(
        'font-medium text-primary underline-offset-4 hover:underline',
        className
      )}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
      {...props}
    >
      {text || children}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge (shadcn/ui style)
// ─────────────────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-500/80',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  text?: string;
}

export function Badge({ className, variant, text, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {text || children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Button (shadcn/ui style)
// ─────────────────────────────────────────────────────────────────────────────

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  text?: string;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  text,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const actionCtx = useA2uiAction();
  const Comp = asChild ? Slot : 'button';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e);
    actionCtx?.dispatchAction('click', {});
  };

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {text || children}
    </Comp>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Image
// ─────────────────────────────────────────────────────────────────────────────

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: 'auto' | 'square' | 'video' | 'portrait';
  fallback?: string;
}

export function Image({ className, aspectRatio, alt, fallback, onError, ...props }: ImageProps) {
  const [error, setError] = React.useState(false);

  const aspectRatioClass = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }[aspectRatio || 'auto'];

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setError(true);
    onError?.(e);
  };

  if (error && fallback) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground rounded-md',
          aspectRatioClass,
          className
        )}
      >
        <span className="text-sm">{fallback}</span>
      </div>
    );
  }

  return (
    <img
      className={cn('rounded-md object-cover', aspectRatioClass, className)}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  label?: string;
  showValue?: boolean;
}

export function Progress({ className, value, label, showValue, ...props }: ProgressProps) {
  return (
    <div className="grid gap-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showValue && <span className="text-sm text-muted-foreground">{value}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Alert
// ─────────────────────────────────────────────────────────────────────────────

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100 [&>svg]:text-blue-600',
        success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100 [&>svg]:text-green-600',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100 [&>svg]:text-yellow-600',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
}

export function Alert({ className, variant, title, description, children, ...props }: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
      {description && <div className="text-sm [&_p]:leading-relaxed">{description}</div>}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  }[size];

  return (
    <AvatarPrimitive.Root className={cn('relative flex shrink-0 overflow-hidden rounded-full', sizeClass, className)}>
      <AvatarPrimitive.Image className="aspect-square h-full w-full" src={src} alt={alt} />
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium">
        {fallback || alt?.charAt(0)?.toUpperCase()}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Code
// ─────────────────────────────────────────────────────────────────────────────

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  language?: string;
  text?: string;
}

export function Code({ className, inline = true, text, children, ...props }: CodeProps) {
  if (inline) {
    return (
      <code
        className={cn(
          'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
          className
        )}
        {...props}
      >
        {text || children}
      </code>
    );
  }

  return (
    <pre className={cn('overflow-x-auto rounded-lg bg-muted p-4', className)}>
      <code className="font-mono text-sm" {...props}>
        {text || children}
      </code>
    </pre>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List
// ─────────────────────────────────────────────────────────────────────────────

export interface ListItem {
  id: string;
  content: string;
  icon?: React.ReactNode;
}

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  items?: ListItem[];
  ordered?: boolean;
}

export function List({ className, items = [], ordered, children, ...props }: ListProps) {
  const Tag = ordered ? 'ol' : 'ul';
  
  return (
    <Tag
      className={cn(
        'my-4 ml-6 [&>li]:mt-2',
        ordered ? 'list-decimal' : 'list-disc',
        className
      )}
      {...props}
    >
      {items.length > 0
        ? items.map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              {item.icon}
              <span>{item.content}</span>
            </li>
          ))
        : children}
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Table (简化版)
// ─────────────────────────────────────────────────────────────────────────────

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
}

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  columns?: TableColumn[];
  data?: Record<string, unknown>[];
}

export function Table({ className, columns = [], data = [], ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props}>
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((row, i) => (
            <tr key={i} className="border-b transition-colors hover:bg-muted/50">
              {columns.map((col) => (
                <td key={col.key} className="p-4 align-middle">
                  {String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon (基础 SVG 图标容器)
// ─────────────────────────────────────────────────────────────────────────────

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Icon({ className, name: _name, size = 'md', children, ...props }: IconProps) {
  const sizeClass = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  }[size];

  return (
    <svg
      className={cn(sizeClass, 'shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export function Tooltip({ content, children, side = 'top', delayDuration = 200 }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={delayDuration}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            className={cn(
              'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
              'data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
              'data-[side=top]:slide-in-from-bottom-2'
            )}
            sideOffset={4}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

