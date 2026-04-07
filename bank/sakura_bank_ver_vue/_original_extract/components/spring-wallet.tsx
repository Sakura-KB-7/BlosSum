'use client'

import { useState } from 'react'
import { CherryBlossomBackground } from './cherry-blossom-background'
import { AppSidebar } from './app-sidebar'
import { DashboardPage } from './dashboard-page'
import { CalendarPage } from './calendar-page'
import { CharmsPage } from './charms-page'
import { MapPage } from './map-page'
import { NewsletterPage } from './newsletter-page'
import { cn } from '@/lib/utils'

export function SpringWallet() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isIntroComplete, setIsIntroComplete] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'calendar':
        return <CalendarPage />
      case 'charms':
        return <CharmsPage />
      case 'map':
        return <MapPage />
      case 'newsletter':
        return <NewsletterPage />
      default:
        return <DashboardPage />
    }
  }

  // Intro screen
  if (!isIntroComplete) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-amber-50 to-pink-100">
        <CherryBlossomBackground />
        
        <div className="z-10 flex flex-col items-center">
          {/* 3D Wallet */}
          <div 
            className="group relative cursor-pointer transition-all duration-500 hover:scale-105"
            onClick={() => setIsIntroComplete(true)}
          >
            {/* Wallet shadow */}
            <div className="absolute -bottom-4 left-1/2 h-8 w-48 -translate-x-1/2 rounded-full bg-black/10 blur-xl transition-all group-hover:w-52" />
            
            {/* Wallet body */}
            <div className="relative">
              {/* Back part */}
              <div className="h-44 w-64 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 shadow-2xl">
                {/* Leather texture */}
                <div className="absolute inset-0 rounded-2xl opacity-30" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5h18V22H22v18h-2V22H2v18H0V22h20v-1.5zM0 38v2h20v-2H0zm22 2h18v-2H22v2zM0 30v2h20v-2H0zm22 2h18v-2H22v2zM0 34v2h20v-2H0zm22 2h18v-2H22v2z' fill='%23000' fill-opacity='.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }} />
                
                {/* Gold clasp */}
                <div className="absolute left-1/2 top-2 h-6 w-16 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-md" />
              </div>
              
              {/* Front flap - animates on hover */}
              <div className={cn(
                "absolute left-0 top-0 h-32 w-64 origin-top rounded-t-2xl bg-gradient-to-br from-amber-700 to-amber-900 shadow-lg transition-all duration-500",
                "group-hover:[transform:rotateX(-60deg)]"
              )} style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
                {/* Leather texture */}
                <div className="absolute inset-0 rounded-t-2xl opacity-30" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5h18V22H22v18h-2V22H2v18H0V22h20v-1.5zM0 38v2h20v-2H0zm22 2h18v-2H22v2zM0 30v2h20v-2H0zm22 2h18v-2H22v2zM0 34v2h20v-2H0zm22 2h18v-2H22v2z' fill='%23000' fill-opacity='.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }} />
                
                {/* Center logo */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner">
                    <span className="text-3xl">🌸</span>
                  </div>
                </div>
              </div>
              
              {/* Inside content - visible on hover */}
              <div className="absolute left-4 right-4 top-8 flex flex-col items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex gap-2">
                  {['💳', '💴', '🧧'].map((emoji, i) => (
                    <span key={i} className="text-2xl">{emoji}</span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-amber-100">지갑을 열어보세요!</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mt-12 text-center">
            <h1 className="text-4xl font-bold text-foreground">🌸 봄지갑</h1>
            <p className="mt-2 text-lg text-muted-foreground">Spring Wallet</p>
            <p className="mt-4 text-sm text-muted-foreground">
              지갑을 클릭하여 시작하세요
            </p>
          </div>

          {/* Floating petals */}
          <div className="absolute left-10 top-20 animate-bounce text-4xl opacity-60" style={{ animationDelay: '0.5s' }}>🌸</div>
          <div className="absolute right-20 top-32 animate-bounce text-3xl opacity-50" style={{ animationDelay: '1s' }}>🌸</div>
          <div className="absolute bottom-32 left-20 animate-bounce text-2xl opacity-40" style={{ animationDelay: '1.5s' }}>🌸</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      <CherryBlossomBackground />
      <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="relative z-10 flex-1 overflow-auto p-6">
        {renderPage()}
      </main>
    </div>
  )
}
