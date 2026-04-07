'use client'

import { Lock, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { charms, expenses, formatAmount, categoryInfo } from '@/lib/expenses-data'
import { cn } from '@/lib/utils'

export function CharmsPage() {
  const unlockedCount = charms.filter(c => c.unlocked).length
  
  // Get recent expenses for scrapbook
  const recentExpenses = expenses.slice(0, 6)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          부적 콜렉션 & 영수증 다꾸 ✨
        </h1>
        <p className="text-muted-foreground">
          절약 목표를 달성하고 예쁜 부적을 모아보세요!
        </p>
      </div>

      {/* Progress */}
      <Card className="border-none bg-gradient-to-r from-primary/10 to-amber-100/50 shadow-sm backdrop-blur-sm">
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <p className="text-sm text-muted-foreground">수집한 부적</p>
            <p className="text-3xl font-bold text-foreground">
              {unlockedCount} / {charms.length}
            </p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-primary/30">
            <Sparkles className="h-10 w-10 text-amber-600" />
          </div>
        </CardContent>
      </Card>

      {/* Charms Gallery */}
      <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">🔮</span>
            부적 갤러리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {charms.map(charm => (
              <div
                key={charm.id}
                className={cn(
                  'group relative cursor-pointer transition-all',
                  charm.unlocked && 'hover:-translate-y-2'
                )}
              >
                {/* Glow effect for unlocked charms */}
                {charm.unlocked && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-300/20 opacity-0 blur-xl transition-all group-hover:opacity-100" />
                )}
                
                <div
                  className={cn(
                    'relative flex h-40 flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all',
                    charm.unlocked
                      ? 'border-amber-300/50 bg-gradient-to-br from-amber-50 to-pink-50 shadow-lg'
                      : 'border-dashed border-gray-300 bg-gray-100/50'
                  )}
                >
                  {/* Hole for hanging */}
                  <div className={cn(
                    'absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2',
                    charm.unlocked
                      ? 'border-amber-300 bg-amber-100'
                      : 'border-gray-300 bg-gray-200'
                  )} />
                  
                  {charm.unlocked ? (
                    <>
                      <span className="mb-2 text-4xl">{charm.icon}</span>
                      <p className="text-center text-sm font-medium text-foreground">
                        {charm.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Lock className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-center text-xs text-muted-foreground">
                        미획득
                      </p>
                    </>
                  )}
                </div>
                
                {/* Tooltip on hover */}
                <div className={cn(
                  'absolute -bottom-12 left-1/2 z-10 w-32 -translate-x-1/2 rounded-lg bg-foreground p-2 text-center text-xs text-background opacity-0 transition-all',
                  'group-hover:opacity-100'
                )}>
                  {charm.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Receipt Scrapbook */}
      <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">🎨</span>
            영수증 다꾸
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Cork board style background */}
          <div className="relative min-h-[400px] rounded-xl bg-amber-100/50 p-6" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {recentExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="group relative"
                  style={{
                    transform: `rotate(${(index % 3 - 1) * 3}deg)`,
                  }}
                >
                  {/* Masking tape effect */}
                  <div className={cn(
                    'absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 rotate-[-2deg] rounded-sm opacity-80',
                    index % 3 === 0 ? 'bg-pink-200' : index % 3 === 1 ? 'bg-blue-200' : 'bg-amber-200'
                  )} />
                  
                  {/* Polaroid style card */}
                  <div className="rounded-lg bg-white p-3 shadow-md transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
                    <div className={cn(
                      'mb-3 flex h-24 items-center justify-center rounded-lg',
                      categoryInfo[expense.category]?.bgColor
                    )}>
                      <span className="text-4xl">{expense.icon}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {expense.store}
                      </p>
                      <p className="text-xs text-muted-foreground">{expense.date}</p>
                      <p className="font-semibold text-pink-600">
                        -{formatAmount(expense.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Decorative stickers */}
            <div className="absolute bottom-4 right-4 text-4xl opacity-50">🌸</div>
            <div className="absolute left-4 top-4 text-2xl opacity-50">✨</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
