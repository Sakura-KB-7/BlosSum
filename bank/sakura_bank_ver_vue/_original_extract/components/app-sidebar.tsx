'use client'

import { Home, Calendar, Sparkles, Map, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { id: 'dashboard', label: '내 지갑', icon: Home },
  { id: 'calendar', label: '캘린더 가계부', icon: Calendar },
  { id: 'charms', label: '부적 콜렉션', icon: Sparkles },
  { id: 'map', label: '소비 지도', icon: Map },
  { id: 'newsletter', label: 'AI 소식지', icon: Newspaper },
]

interface AppSidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg">
          🌸
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">봄지갑</span>
            <span className="text-xs text-muted-foreground">Spring Wallet</span>
          </div>
        )}
      </div>

      {/* Profile */}
      {!collapsed && (
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-lg">
              🧑‍💻
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">사용자님</p>
              <p className="text-xs text-muted-foreground">절약 레벨 Lv.3</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-sm hover:bg-sidebar-accent"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-xl bg-primary/10 p-3 text-center">
            <p className="text-xs text-muted-foreground">이번 달 절약 목표</p>
            <p className="text-lg font-bold text-primary">72%</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/20">
              <div className="h-full w-[72%] rounded-full bg-primary transition-all" />
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
