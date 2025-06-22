"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, Bell, Mail, Bookmark, User, LogOut, X } from "lucide-react"

interface SidebarProps {
  profile: any
  onSignOut: () => void
}

export function Sidebar({ profile, onSignOut }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: "হোম", href: "/dashboard" },
    { icon: Search, label: "অন্বেষণ", href: "/explore" },
    { icon: Bell, label: "বিজ্ঞপ্তি", href: "/notifications" },
    { icon: Mail, label: "বার্তা", href: "/messages" },
    { icon: Bookmark, label: "বুকমার্ক", href: "/bookmarks" },
    { icon: User, label: "প্রোফাইল", href: `/profile/${profile?.username}` },
  ]

  return (
    <div className="h-full flex flex-col p-3 bengali-font">
      {/* Close button for mobile */}
      <div className="lg:hidden flex justify-between items-center mb-4 pb-2 border-b">
        <h1 className="text-xl font-bold logo-font">desiiseb</h1>
        <Button variant="ghost" size="icon" onClick={() => window.dispatchEvent(new Event("closeSidebar"))}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Logo for desktop */}
      <div className="hidden lg:block mb-6">
        <h1 className="text-2xl font-bold logo-font">desiiseb</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button variant="ghost" className="w-full justify-start text-base lg:text-lg py-3 lg:py-6 px-3">
              <item.icon className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
              <span className="truncate">{item.label}</span>
            </Button>
          </Link>
        ))}
      </nav>

      <div className="border-t pt-3 mt-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{profile?.display_name?.charAt(0)?.toUpperCase() || "ব"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">{profile?.display_name}</p>
            <p className="text-xs text-gray-500 truncate">@{profile?.username}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
          onClick={onSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          সাইন আউট
        </Button>
      </div>
    </div>
  )
}
