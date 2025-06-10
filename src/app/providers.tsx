// app/providers.tsx
'use client'

import {HeroUIProvider} from '@heroui/react'

// this file is used to provide the HeroUI context to the application
export function Providers({children}: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  )
}