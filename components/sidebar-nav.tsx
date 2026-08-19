'use client'

import { useState } from 'react'
import {
  Recycle,
  ShoppingCart,
  PackageOpen,
  KeyRound,
  Megaphone,
  ClipboardCheck,
  ChevronDown,
  Leaf,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavChild = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavChild[]
}

type NavGroup = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  children: NavChild[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'revitalize',
    label: '资源盘活',
    icon: Recycle,
    children: [
      { key: 'disposal', label: '资源处置', icon: PackageOpen },
      {
        key: 'rental',
        label: '资源出租',
        icon: KeyRound,
        children: [{ key: 'publish', label: '发布公告', icon: FileText }],
      },
    ],
  },
  {
    key: 'procurement',
    label: '资源采购',
    icon: ShoppingCart,
    children: [
      { key: 'announcement', label: '发布采购公告', icon: Megaphone },
      { key: 'fulfillment', label: '订单履约', icon: ClipboardCheck },
    ],
  },
]

function ChildNode({
  child,
  depth,
  activeKey,
  groupLabel,
  openKeys,
  onToggle,
  onSelect,
}: {
  child: NavChild
  depth: number
  activeKey: string
  groupLabel: string
  openKeys: string[]
  onToggle: (key: string) => void
  onSelect: (key: string, label: string, groupLabel: string) => void
}) {
  const ChildIcon = child.icon
  const hasChildren = !!child.children?.length
  const isActive = activeKey === child.key
  const isOpen = openKeys.includes(child.key)

  if (hasChildren) {
    return (
      <li>
        <button
          type="button"
          onClick={() => onToggle(child.key)}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-3 rounded-md py-2 pl-5 pr-3 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ChildIcon className="size-4 shrink-0" />
          <span className="flex-1 text-left">{child.label}</span>
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 transition-transform duration-200',
              isOpen ? 'rotate-0' : '-rotate-90',
            )}
          />
        </button>
        {isOpen && (
          <ul className="mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border/60 pl-3">
            {child.children!.map((grandchild) => (
              <ChildNode
                key={grandchild.key}
                child={grandchild}
                depth={depth + 1}
                activeKey={activeKey}
                groupLabel={groupLabel}
                openKeys={openKeys}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(child.key, child.label, groupLabel)}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'relative flex w-full items-center gap-3 rounded-md py-2 pl-5 pr-3 text-sm transition-colors',
          isActive
            ? 'bg-sidebar-primary font-medium text-sidebar-primary-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        )}
      >
        <ChildIcon className="size-4 shrink-0" />
        <span>{child.label}</span>
      </button>
    </li>
  )
}

export function SidebarNav({
  activeKey,
  onSelect,
}: {
  activeKey: string
  onSelect: (key: string, label: string, groupLabel: string) => void
}) {
  const [openGroups, setOpenGroups] = useState<string[]>(
    NAV_GROUPS.map((g) => g.key),
  )
  const [openChildren, setOpenChildren] = useState<string[]>(['rental'])

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  const toggleChild = (key: string) => {
    setOpenChildren((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Leaf className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">盘古资源平台</p>
          <p className="text-xs text-sidebar-foreground/60">碳核算后台</p>
        </div>
      </div>

      <div className="mx-5 h-px bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="主导航">
        <ul className="flex flex-col gap-1">
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups.includes(group.key)
            const GroupIcon = group.icon
            return (
              <li key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <GroupIcon className="size-[18px] shrink-0" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    className={cn(
                      'size-4 shrink-0 transition-transform duration-200',
                      isOpen ? 'rotate-0' : '-rotate-90',
                    )}
                  />
                </button>

                {isOpen && (
                  <ul className="mt-1 flex flex-col gap-0.5 pl-4">
                    {group.children.map((child) => (
                      <ChildNode
                        key={child.key}
                        child={child}
                        depth={0}
                        activeKey={activeKey}
                        groupLabel={group.label}
                        openKeys={openChildren}
                        onToggle={toggleChild}
                        onSelect={onSelect}
                      />
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-5 py-4 text-xs text-sidebar-foreground/50">
        v1.0 · 碳中和管理系统
      </div>
    </aside>
  )
}
