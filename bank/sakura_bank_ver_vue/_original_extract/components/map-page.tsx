'use client'

import { MapPin, Flower2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { expenses, formatAmount, categoryInfo } from '@/lib/expenses-data'
import { cn } from '@/lib/utils'

// Mock location data for demonstration
const locationData = [
  { id: 1, name: '강남역', x: 55, y: 45, type: 'warning', amount: 125000, visits: 8 },
  { id: 2, name: '홍대입구', x: 35, y: 35, type: 'success', amount: 32000, visits: 3 },
  { id: 3, name: '신촌', x: 38, y: 30, type: 'success', amount: 28000, visits: 4 },
  { id: 4, name: '이태원', x: 52, y: 40, type: 'warning', amount: 89000, visits: 5 },
  { id: 5, name: '잠실', x: 70, y: 48, type: 'success', amount: 45000, visits: 6 },
  { id: 6, name: '여의도', x: 42, y: 50, type: 'success', amount: 35000, visits: 2 },
  { id: 7, name: '명동', x: 50, y: 38, type: 'warning', amount: 156000, visits: 10 },
  { id: 8, name: '압구정', x: 58, y: 42, type: 'warning', amount: 203000, visits: 7 },
]

export function MapPage() {
  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0)
  const successLocations = locationData.filter(l => l.type === 'success')
  const warningLocations = locationData.filter(l => l.type === 'warning')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          나의 소비 지도 🗺️
        </h1>
        <p className="text-muted-foreground">
          내가 어디서 돈을 많이 썼는지 한눈에 확인하세요
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2">
          <Flower2 className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">절약 성공 지역</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2">
          <AlertTriangle className="h-4 w-4 text-pink-600" />
          <span className="text-sm text-pink-700">과소비 주의 지역</span>
        </div>
      </div>

      {/* Map Area */}
      <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="relative h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-blue-50">
            {/* Decorative map background pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, #86efac 0%, transparent 20%),
                radial-gradient(circle at 70% 60%, #93c5fd 0%, transparent 25%),
                radial-gradient(circle at 40% 70%, #fde68a 0%, transparent 15%),
                radial-gradient(circle at 80% 20%, #f9a8d4 0%, transparent 18%)
              `,
            }} />
            
            {/* Grid lines */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }} />

            {/* Location markers */}
            {locationData.map(location => (
              <div
                key={location.id}
                className="group absolute cursor-pointer transition-transform hover:z-10 hover:scale-110"
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Marker */}
                <div className={cn(
                  'relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg',
                  location.type === 'success'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-pink-100 text-pink-600'
                )}>
                  {location.type === 'success' ? (
                    <Flower2 className="h-6 w-6" />
                  ) : (
                    <AlertTriangle className="h-6 w-6" />
                  )}
                  
                  {/* Pulse animation for warning locations */}
                  {location.type === 'warning' && (
                    <div className="absolute inset-0 animate-ping rounded-full bg-pink-400 opacity-30" />
                  )}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 mb-2 w-40 -translate-x-1/2 rounded-xl bg-card p-3 opacity-0 shadow-xl transition-all group-hover:opacity-100">
                  <p className="font-semibold text-foreground">{location.name}</p>
                  <p className={cn(
                    'text-sm font-medium',
                    location.type === 'success' ? 'text-green-600' : 'text-pink-600'
                  )}>
                    {formatAmount(location.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    방문 {location.visits}회
                  </p>
                  <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-card" />
                </div>
              </div>
            ))}
            
            {/* Decorative cherry blossoms */}
            <div className="absolute left-4 top-4 text-3xl opacity-40">🌸</div>
            <div className="absolute bottom-8 right-8 text-4xl opacity-40">🌸</div>
            <div className="absolute right-20 top-20 text-2xl opacity-30">🌸</div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 방문 장소
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {locationData.length}곳
            </p>
            <p className="text-sm text-muted-foreground">
              이번 달 소비 지역
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-green-50/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600">
              <Flower2 className="h-4 w-4" />
              절약 성공
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              {successLocations.length}곳
            </p>
            <p className="text-sm text-green-600">
              벚꽃이 피었어요!
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-pink-50/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-pink-600">
              <AlertTriangle className="h-4 w-4" />
              과소비 주의
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-pink-700">
              {warningLocations.length}곳
            </p>
            <p className="text-sm text-pink-600">
              조심해요!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Locations */}
      <Card className="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">TOP 소비 지역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...locationData]
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((location, index) => (
                <div
                  key={location.id}
                  className="flex items-center gap-4 rounded-xl bg-secondary/50 p-3"
                >
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-gray-200 text-gray-600' :
                    index === 2 ? 'bg-amber-700/20 text-amber-800' :
                    'bg-gray-100 text-gray-500'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{location.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      방문 {location.visits}회
                    </p>
                  </div>
                  <p className={cn(
                    'font-semibold',
                    location.type === 'success' ? 'text-green-600' : 'text-pink-600'
                  )}>
                    {formatAmount(location.amount)}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
