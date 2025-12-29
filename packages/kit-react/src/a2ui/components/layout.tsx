/**
 * ============================================================================
 * A2UI Layout Components (shadcn/ui + Radix UI)
 * ============================================================================
 * 
 * 布局组件: Container, Row, Column, Grid, Card, Divider, Spacer
 * 
 * ============================================================================
 */

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Container
// ─────────────────────────────────────────────────────────────────────────────

const containerVariants = cva('mx-auto w-full px-4', {
  variants: {
    maxWidth: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    maxWidth: 'lg',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export function Container({ className, maxWidth, children, ...props }: ContainerProps) {
  return (
    <div className={cn(containerVariants({ maxWidth }), className)} {...props}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Row (Flex Row)
// ─────────────────────────────────────────────────────────────────────────────

const rowVariants = cva('flex flex-row', {
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'center',
    justify: 'start',
    wrap: false,
  },
});

export interface RowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof rowVariants> {}

export function Row({ className, gap, align, justify, wrap, children, ...props }: RowProps) {
  return (
    <div className={cn(rowVariants({ gap, align, justify, wrap }), className)} {...props}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Column (Flex Column)
// ─────────────────────────────────────────────────────────────────────────────

const columnVariants = cva('flex flex-col', {
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
  },
  defaultVariants: {
    gap: 'sm',
    align: 'stretch',
    justify: 'start',
  },
});

export interface ColumnProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof columnVariants> {}

export function Column({ className, gap, align, justify, children, ...props }: ColumnProps) {
  return (
    <div className={cn(columnVariants({ gap, align, justify }), className)} {...props}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid
// ─────────────────────────────────────────────────────────────────────────────

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  defaultVariants: {
    cols: 2,
    gap: 'md',
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export function Grid({ className, cols, gap, children, ...props }: GridProps) {
  return (
    <div className={cn(gridVariants({ cols, gap }), className)} {...props}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card (shadcn/ui style)
// ─────────────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function Card({ className, title, subtitle, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    >
      {(title || subtitle) && (
        <div className="flex flex-col space-y-1.5 p-6 pb-0">
          {title && <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Divider / Separator (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface DividerProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({ className, orientation = 'horizontal', decorative = true, ...props }: DividerProps) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  );
}

// Alias for shadcn/ui naming
export const Separator = Divider;

// ─────────────────────────────────────────────────────────────────────────────
// Spacer
// ─────────────────────────────────────────────────────────────────────────────

const spacerVariants = cva('flex-shrink-0', {
  variants: {
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    direction: {
      horizontal: '',
      vertical: '',
    },
  },
  compoundVariants: [
    { size: 'xs', direction: 'vertical', className: 'h-1' },
    { size: 'sm', direction: 'vertical', className: 'h-2' },
    { size: 'md', direction: 'vertical', className: 'h-4' },
    { size: 'lg', direction: 'vertical', className: 'h-6' },
    { size: 'xl', direction: 'vertical', className: 'h-8' },
    { size: 'xs', direction: 'horizontal', className: 'w-1' },
    { size: 'sm', direction: 'horizontal', className: 'w-2' },
    { size: 'md', direction: 'horizontal', className: 'w-4' },
    { size: 'lg', direction: 'horizontal', className: 'w-6' },
    { size: 'xl', direction: 'horizontal', className: 'w-8' },
  ],
  defaultVariants: {
    size: 'md',
    direction: 'vertical',
  },
});

export interface SpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacerVariants> {}

export function Spacer({ className, size, direction, ...props }: SpacerProps) {
  return (
    <div
      className={cn(spacerVariants({ size, direction }), className)}
      aria-hidden="true"
      {...props}
    />
  );
}

