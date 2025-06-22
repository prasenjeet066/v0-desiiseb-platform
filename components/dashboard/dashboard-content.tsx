"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Sidebar } from "./sidebar"
import { Timeline } from "./timeline"
import { CreatePost } from "./create-post"
import { SearchDialog } from "./search-dialog"
import { NotificationDialog } from "./notification-dialog"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X, Search, Bell } from "lucide-react"
import { useState as useToggle } from "react"
import { MobileBottomNav } from "./mobile-bottom-nav"

export function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useToggle(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        setProfile(profile)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 bengali-font pb-16 lg:pb-0">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b px-3 py-2 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-bold logo-font">desiiseb</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 ease-in-out`}
        >
          <Sidebar profile={profile} onSignOut={handleSignOut} />
        </div>

        {/* Main content */}
        <div className="flex-1 lg:max-w-2xl">
          <div className="lg:border-x bg-white min-h-screen">
            {/* Desktop header */}
            <div className="hidden lg:flex sticky top-0 bg-white/95 backdrop-blur-sm border-b px-4 py-3 items-center justify-between z-30">
              <h2 className="text-xl font-bold">হোম</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setNotificationOpen(true)}>
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <CreatePost userId={user.id} onPostCreated={handlePostCreated} />
            <Timeline userId={user.id} refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Right sidebar - hidden on mobile */}
        <div className="hidden xl:block w-80 p-4">
          <div className="space-y-4">{/* Trending will be shown here */}</div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        profile={profile}
        onSearchOpen={() => setSearchOpen(true)}
        onNotificationOpen={() => setNotificationOpen(true)}
      />

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Notification Dialog */}
      <NotificationDialog open={notificationOpen} onOpenChange={setNotificationOpen} />
    </div>
  )
}
