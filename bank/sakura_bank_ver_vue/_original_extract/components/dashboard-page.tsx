'use client'

import { TrendingDown, TrendingUp, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { expenses, formatAmount, categoryInfo, charms, getMonthlyExpenses, getCategoryTotals } from '@/lib/expenses-data'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export function DashboardPage() {
  const currentMonth = '04'
  const lastMonth = '03'
  
  const currentMonthExpenses = getMonthlyExpenses(currentMonth)
  const lastMonthExpenses = getMonthlyExpenses(lastMonth)
  
  const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
  const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
  const percentChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal * 100).toFixed(1) : 0
  
  const categoryTotals = getCategoryTotals(currentMonthExpenses)
  const pieData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: categoryInfo[key]?.name || key,
    value,
    category: key,
  }))

  const COLORS = ['#F472B6', '#60A5FA', '#FBBF24', '#2DD4BF', '#4ADE80', '#9CA3AF']
  
  const recentExpenses = expenses.slice(0, 5)
  const todayCharm = charms.find(c => c.unlocked) || charms[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          환영합니다, 오늘도 좋은 하루예요 🌸
        </h1>
        <p className="text-muted-foreground">2026년 4월 3일 목요일</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              이번 달 지출
            </CardTitle>
            <div className="rounded-full bg-pink-100 p-2">
              <TrendingDown className="h-4 w-4 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatAmount(currentTotal)}</p>
            <div className="mt-1 flex items-center gap-1 text-sm">
              {Number(percentChange) < 0 ? (
                <>
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{Math.abs(Number(percentChange))}% 감소</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-4 w-4 text-pink-600" />
                  <span className="text-pink-600">{percentChange}% 증가</span>
                </>
              )}
              <span className="text-muted-foreground">전월 대비</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              이번 달 수입
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatAmount(3200000)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              급여 + 부수입
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              저축 목표 달성률
            </CardTitle>
            <div className="rounded-full bg-amber-100 p-2">
              <Target className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">72%</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100">
              <div 
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: '72%' }}
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              목표 50만원 중 36만원 달성
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Expenses - Receipt Style */}
        <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-xl">🧾</span>
              최근 영수증
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-xl border-2 border-dashed border-primary/30 bg-secondary/50 p-4">
              <div className="absolute -top-3 left-4 bg-card px-2 text-xs text-muted-foreground">
                최근 거래 내역
              </div>
              <div className="space-y-3">
                {recentExpenses.map(expense => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between border-b border-dashed border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${categoryInfo[expense.category]?.bgColor}`}>
                        {expense.icon}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{expense.store}</p>
                        <p className="text-xs text-muted-foreground">{expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-pink-600">
                        -{formatAmount(expense.amount)}
                      </p>
                      <span className={`text-xs ${categoryInfo[expense.category]?.color}`}>
                        {categoryInfo[expense.category]?.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Charm */}
        <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-xl">🔮</span>
              오늘의 부적
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="group relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-300/20 blur-xl transition-all group-hover:blur-2xl" />
              <div className="relative flex h-40 w-32 flex-col items-center justify-center rounded-2xl border-2 border-amber-300/50 bg-gradient-to-br from-amber-50 to-pink-50 shadow-lg transition-transform hover:-translate-y-1">
                <span className="mb-2 text-4xl">{todayCharm.icon}</span>
                <p className="text-center text-sm font-medium text-foreground">
                  {todayCharm.name}
                </p>
                <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-amber-300 bg-amber-100" />
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {todayCharm.description}
            </p>
            <p className="mt-2 text-xs text-primary">
              부적을 지켜 절약 달성!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Chart */}
      <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">📊</span>
            카테고리별 지출
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="transition-all hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatAmount(value)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {formatAmount(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
