'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { expenses, formatAmount, categoryInfo, type Expense } from '@/lib/expenses-data'
import { cn } from '@/lib/utils'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 3)) // April 2026
  const [selectedDate, setSelectedDate] = useState<string | null>('04.03')
  const [showPanel, setShowPanel] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const monthStr = String(month + 1).padStart(2, '0')
  
  // Get expenses for this month
  const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr))
  
  // Group expenses by day
  const expensesByDay: Record<string, Expense[]> = {}
  monthExpenses.forEach(e => {
    const day = e.date.split(' ')[0] // "04.03"
    if (!expensesByDay[day]) expensesByDay[day] = []
    expensesByDay[day].push(e)
  })

  const getDayTotal = (dayStr: string): number => {
    return (expensesByDay[dayStr] || []).reduce((sum, e) => sum + e.amount, 0)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDayClick = (day: number) => {
    const dayStr = `${monthStr}.${String(day).padStart(2, '0')}`
    setSelectedDate(dayStr)
    setShowPanel(true)
  }

  const selectedExpenses = selectedDate ? (expensesByDay[selectedDate] || []) : []

  const calendarDays = []
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-20 md:h-24" />)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${monthStr}.${String(day).padStart(2, '0')}`
    const dayTotal = getDayTotal(dayStr)
    const isSelected = selectedDate === dayStr
    const isToday = day === 3 && month === 3 // April 3rd

    calendarDays.push(
      <button
        key={day}
        onClick={() => handleDayClick(day)}
        className={cn(
          'flex h-20 flex-col items-start rounded-xl border p-2 text-left transition-all hover:border-primary/50 md:h-24',
          isSelected ? 'border-primary bg-primary/5' : 'border-transparent bg-card/50',
          isToday && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <span className={cn(
          'text-sm font-medium',
          isToday && 'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground'
        )}>
          {day}
        </span>
        {dayTotal > 0 && (
          <span className="mt-auto text-xs font-medium text-pink-600">
            -{(dayTotal / 10000).toFixed(1)}만
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Calendar Main */}
      <div className={cn('flex-1 space-y-4', showPanel && 'lg:mr-80')}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">캘린더 가계부 📅</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
              <Plus className="mr-1 h-4 w-4" />
              수입 추가
            </Button>
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-1 h-4 w-4" />
              지출 추가
            </Button>
          </div>
        </div>

        <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg">
              {year}년 {MONTHS[month]}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {DAYS.map(day => (
                <div
                  key={day}
                  className={cn(
                    'py-2 text-center text-sm font-medium',
                    day === '일' && 'text-red-500',
                    day === '토' && 'text-blue-500'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">{MONTHS[month]} 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(categoryInfo).map(([key, info]) => {
                const total = monthExpenses
                  .filter(e => e.category === key)
                  .reduce((sum, e) => sum + e.amount, 0)
                if (total === 0) return null
                return (
                  <div
                    key={key}
                    className={cn('rounded-xl px-4 py-3 text-center', info.bgColor)}
                  >
                    <p className={cn('text-sm font-medium', info.color)}>{info.name}</p>
                    <p className="text-lg font-bold text-foreground">
                      {(total / 10000).toFixed(1)}만원
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Detail Panel */}
      {showPanel && (
        <div className="fixed right-0 top-0 z-50 h-full w-80 border-l border-border bg-card/95 shadow-xl backdrop-blur-sm lg:relative lg:z-auto">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold text-foreground">
                {selectedDate?.replace('.', '월 ')}일 내역
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {selectedExpenses.length > 0 ? (
                <div className="space-y-3">
                  {selectedExpenses.map(expense => (
                    <div
                      key={expense.id}
                      className="rounded-xl border border-border bg-background p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-lg', categoryInfo[expense.category]?.bgColor)}>
                          {expense.icon}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{expense.store}</p>
                          <p className="text-xs text-muted-foreground">
                            {expense.date.split(' ')[1]}
                          </p>
                        </div>
                        <p className="font-semibold text-pink-600">
                          -{formatAmount(expense.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 rounded-xl bg-primary/10 p-3 text-center">
                    <p className="text-sm text-muted-foreground">총 지출</p>
                    <p className="text-xl font-bold text-primary">
                      {formatAmount(selectedExpenses.reduce((sum, e) => sum + e.amount, 0))}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                  <span className="text-4xl">🌸</span>
                  <p className="mt-2">지출 내역이 없습니다</p>
                  <p className="text-sm">무지출 데이! 축하해요!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
