/**
 * ============================================================================
 * A2UI Navigation Components (shadcn/ui + Radix UI)
 * ============================================================================
 * 
 * 导航组件: Tabs, Accordion, DropdownMenu, Breadcrumb
 * 
 * ============================================================================
 */

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../lib/utils';
import { useA2uiAction } from '../A2uiRenderer';

// ─────────────────────────────────────────────────────────────────────────────
// Tabs (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items?: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Tabs({
  items = [],
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  className,
}: TabsProps) {
  const actionCtx = useA2uiAction();

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    actionCtx?.dispatchAction('change', { value: newValue });
  };

  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue || items[0]?.value}
      value={value}
      onValueChange={handleValueChange}
      orientation={orientation}
      className={cn(orientation === 'vertical' && 'flex gap-4', className)}
    >
      <TabsPrimitive.List
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
          orientation === 'vertical' && 'flex-col h-fit'
        )}
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5',
              'text-sm font-medium ring-offset-background transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
            )}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content
          key={item.value}
          value={item.value}
          className={cn(
            'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            orientation === 'vertical' && 'mt-0 flex-1'
          )}
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accordion (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface AccordionItem {
  value: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items?: AccordionItem[];
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  className?: string;
}

export function Accordion({
  items = [],
  type = 'single',
  collapsible = true,
  defaultValue,
  className,
}: AccordionProps) {
  const actionCtx = useA2uiAction();

  const handleValueChange = (value: string | string[]) => {
    actionCtx?.dispatchAction('change', { value });
  };

  // Type narrowing for Radix accordion
  if (type === 'single') {
    return (
      <AccordionPrimitive.Root
        type="single"
        collapsible={collapsible}
        defaultValue={typeof defaultValue === 'string' ? defaultValue : defaultValue?.[0]}
        onValueChange={handleValueChange}
        className={cn('w-full', className)}
      >
        {items.map((item) => (
          <AccordionPrimitive.Item key={item.value} value={item.value} disabled={item.disabled} className="border-b">
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger
                className={cn(
                  'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline',
                  '[&[data-state=open]>svg]:rotate-180'
                )}
              >
                {item.title}
                <svg
                  className="h-4 w-4 shrink-0 transition-transform duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
              className={cn(
                'overflow-hidden text-sm transition-all',
                'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
              )}
            >
              <div className="pb-4 pt-0">{item.content}</div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    );
  }

  return (
    <AccordionPrimitive.Root
      type="multiple"
      defaultValue={Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : undefined}
      onValueChange={handleValueChange}
      className={cn('w-full', className)}
    >
      {items.map((item) => (
        <AccordionPrimitive.Item key={item.value} value={item.value} disabled={item.disabled} className="border-b">
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
              className={cn(
                'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline',
                '[&[data-state=open]>svg]:rotate-180'
              )}
            >
              {item.title}
              <svg
                className="h-4 w-4 shrink-0 transition-transform duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content
            className={cn(
              'overflow-hidden text-sm transition-all',
              'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
            )}
          >
            <div className="pb-4 pt-0">{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DropdownMenu (Radix UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface DropdownMenuItem {
  type?: 'item' | 'separator' | 'label';
  label?: string;
  value?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items?: DropdownMenuItem[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function DropdownMenu({ trigger, items = [], align = 'end', side = 'bottom', className }: DropdownMenuProps) {
  const actionCtx = useA2uiAction();

  const handleSelect = (item: DropdownMenuItem) => {
    item.onSelect?.();
    actionCtx?.dispatchAction('select', { value: item.value, label: item.label });
  };

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          side={side}
          sideOffset={4}
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className
          )}
        >
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return (
                <DropdownMenuPrimitive.Separator
                  key={index}
                  className="-mx-1 my-1 h-px bg-muted"
                />
              );
            }

            if (item.type === 'label') {
              return (
                <DropdownMenuPrimitive.Label
                  key={index}
                  className="px-2 py-1.5 text-sm font-semibold"
                >
                  {item.label}
                </DropdownMenuPrimitive.Label>
              );
            }

            return (
              <DropdownMenuPrimitive.Item
                key={item.value || index}
                disabled={item.disabled}
                onSelect={() => handleSelect(item)}
                className={cn(
                  'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5',
                  'text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  item.destructive && 'text-destructive focus:text-destructive'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs tracking-widest opacity-60">{item.shortcut}</span>
                )}
              </DropdownMenuPrimitive.Item>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export function Breadcrumb({ items = [], separator, className, ...props }: BreadcrumbProps) {
  const actionCtx = useA2uiAction();

  const handleClick = (item: BreadcrumbItem) => {
    actionCtx?.dispatchAction('navigate', { href: item.href, label: item.label });
  };

  const defaultSeparator = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <nav aria-label="breadcrumb" className={cn('', className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center gap-1.5">
            {index > 0 && (
              <span role="presentation" aria-hidden="true" className="[&>svg]:h-3.5 [&>svg]:w-3.5">
                {separator || defaultSeparator}
              </span>
            )}
            {item.current ? (
              <span
                role="link"
                aria-disabled="true"
                aria-current="page"
                className="font-normal text-foreground"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                onClick={(e) => {
                  if (!item.href || item.href === '#') {
                    e.preventDefault();
                    handleClick(item);
                  }
                }}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}


