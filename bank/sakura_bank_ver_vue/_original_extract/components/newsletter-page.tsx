'use client'

import { Sparkles, ExternalLink, TrendingDown, Coffee, UtensilsCrossed, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const newsletters = [
  {
    id: 1,
    title: '배달비 아끼는 냉장고 파먹기 꿀팁',
    description: '이번 달 배달 지출이 높아요! 집에 있는 재료로 맛있는 요리를 만들어보세요.',
    category: '식비 절약',
    tags: ['#배달비절약', '#자취생팁', '#간단요리'],
    icon: UtensilsCrossed,
    color: 'bg-pink-100 text-pink-600',
    urgent: true,
  },
  {
    id: 2,
    title: '카페 대신 집에서 즐기는 홈카페 가이드',
    description: '커피 지출이 월 5만원 이상이에요. 홈카페로 90%까지 절약할 수 있어요!',
    category: '커피 절약',
    tags: ['#홈카페', '#커피절약', '#미니멀라이프'],
    icon: Coffee,
    color: 'bg-amber-100 text-amber-600',
    urgent: true,
  },
  {
    id: 3,
    title: '충동구매를 막는 24시간 룰',
    description: '쇼핑 전 24시간 기다리기. 이 간단한 습관으로 불필요한 지출을 줄여보세요.',
    category: '쇼핑 습관',
    tags: ['#충동구매방지', '#쇼핑습관', '#미니멀'],
    icon: ShoppingBag,
    color: 'bg-teal-100 text-teal-600',
    urgent: false,
  },
  {
    id: 4,
    title: '대중교통 마일리지 200% 활용법',
    description: '교통카드 마일리지, 제대로 쓰고 계신가요? 숨겨진 혜택을 알려드려요.',
    category: '교통비 절약',
    tags: ['#대중교통', '#마일리지', '#교통비'],
    icon: TrendingDown,
    color: 'bg-blue-100 text-blue-600',
    urgent: false,
  },
]

const weeklyInsights = [
  { label: '식비', change: -12, trend: 'down' },
  { label: '교통비', change: +5, trend: 'up' },
  { label: '문화생활', change: -8, trend: 'down' },
  { label: '쇼핑', change: +15, trend: 'up' },
]

export function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          AI 맞춤 소식지 📰
        </h1>
        <p className="text-muted-foreground">
          당신의 소비 패턴을 분석한 맞춤형 절약 팁을 확인하세요
        </p>
      </div>

      {/* AI Analysis Summary */}
      <Card className="border-none bg-gradient-to-r from-primary/10 via-amber-50 to-primary/5 shadow-sm backdrop-blur-sm">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/20 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI 분석 리포트</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                이번 주 소비 패턴을 분석한 결과, <span className="font-medium text-pink-600">식비</span>와 
                <span className="font-medium text-amber-600"> 카페 지출</span>이 평소보다 높아요.
                아래 맞춤 팁을 확인해보세요!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Insights */}
      <div className="grid gap-4 md:grid-cols-4">
        {weeklyInsights.map(insight => (
          <Card 
            key={insight.label} 
            className={cn(
              'border-none shadow-sm backdrop-blur-sm',
              insight.trend === 'down' ? 'bg-green-50/80' : 'bg-pink-50/80'
            )}
          >
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">{insight.label}</p>
              <p className={cn(
                'text-xl font-bold',
                insight.trend === 'down' ? 'text-green-600' : 'text-pink-600'
              )}>
                {insight.change > 0 ? '+' : ''}{insight.change}%
              </p>
              <p className="text-xs text-muted-foreground">
                전주 대비
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Newsletter Cards - Newspaper Style */}
      <div className="grid gap-6 md:grid-cols-2">
        {newsletters.map(newsletter => {
          const Icon = newsletter.icon
          return (
            <Card 
              key={newsletter.id}
              className={cn(
                'group relative border-none bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg',
                newsletter.urgent && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {/* Newspaper texture overlay */}
              <div className="absolute inset-0 rounded-xl opacity-[0.02]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              
              {newsletter.urgent && (
                <div className="absolute -right-2 -top-2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  추천
                </div>
              )}
              
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-xl p-2', newsletter.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                    {newsletter.category}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {newsletter.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {newsletter.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {newsletter.tags.map(tag => (
                    <span 
                      key={tag}
                      className="text-xs text-primary/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-2 w-full justify-between">
                  자세히 보기
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Savings Tips */}
      <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">💡</span>
            이번 주 절약 챌린지
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-primary/5 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-2xl">
                🍕
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">배달 없는 일주일</h4>
                <p className="text-sm text-muted-foreground">
                  이번 주 배달 앱 열지 않기. 예상 절약: 5만원
                </p>
              </div>
              <Button size="sm" className="rounded-full">
                도전하기
              </Button>
            </div>
            
            <div className="flex items-center gap-4 rounded-xl bg-amber-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
                ☕
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">카페 3회 제한</h4>
                <p className="text-sm text-muted-foreground">
                  이번 주 카페 방문 3회로 제한하기. 예상 절약: 2만원
                </p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full">
                도전하기
              </Button>
            </div>
            
            <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                🚶
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">도보 출퇴근 데이</h4>
                <p className="text-sm text-muted-foreground">
                  일주일 중 2일은 걸어서 출퇴근. 예상 절약: 5,600원
                </p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full">
                도전하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
