"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, Bell, Mail, User } from "lucide-react"

interface MobileBottomNavProps {
  profile: any
  onSearchOpen: () => void
  onNotificationOpen: () => void
}

export function MobileBottomNav({ profile, onSearchOpen, onNotificationOpen }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "হোম", href: "/dashboard", action: null },
    { icon: Search, label: "খুঁজুন", href: "#", action: onSearchOpen },
    { icon: Bell, label: "বিজ্ঞপ্তি", href: "#", action: onNotificationOpen },
    { icon: Mail, label: "বার্তা", href: "/messages", action: null },
    { icon: User, label: "প্রোফাইল", href: `/profile/${profile?.username}`, action: null },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          if (item.action) {
            return (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                onClick={item.action}
                className={`flex flex-col items-center gap-1 p-2 ${isActive ? "text-blue-600" : "text-gray-600"}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            )
          }

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 p-2 ${isActive ? "text-blue-600" : "text-gray-600"}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
