"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import Link from "next/link"

export default function MobileHeader() {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  return (
    <header className="border-b">
      <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          BirthdayApp
        </Link>

        {isDesktop ? (
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/templates" className="text-sm font-medium">
              Templates
            </Link>
            <Link href="/saved" className="text-sm font-medium">
              Saved
            </Link>
            <Button size="sm">Sign In</Button>
          </nav>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                <Link href="/" className="text-sm font-medium">
                  Home
                </Link>
                <Link href="/templates" className="text-sm font-medium">
                  Templates
                </Link>
                <Link href="/saved" className="text-sm font-medium">
                  Saved
                </Link>
                <Button className="mt-2">Sign In</Button>
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  )
}
