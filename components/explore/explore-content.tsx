"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus, UserCheck } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { LogOut, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  followers_count: number
  is_following: boolean
}

export function ExploreContent() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          display_name,
          bio,
          avatar_url,
          followers:follows!following_id(count)
        `)
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(20)

      if (error) {
        console.error("Error searching users:", error)
      } else {
        // Check if current user is following each user
        const userIds = data?.map((u) => u.id) || []
        const { data: followData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user?.id)
          .in("following_id", userIds)

        const followingIds = new Set(followData?.map((f) => f.following_id) || [])

        const usersWithFollowStatus =
          data?.map((u) => ({
            ...u,
            followers_count: u.followers?.[0]?.count || 0,
            is_following: followingIds.has(u.id),
          })) || []

        setUsers(usersWithFollowStatus)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user?.id).eq("following_id", userId)
    } else {
      await supabase.from("follows").insert({ follower_id: user?.id, following_id: userId })
    }

    // Update local state
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, is_following: !isFollowing, followers_count: u.followers_count + (isFollowing ? -1 : 1) }
          : u,
      ),
    )
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 bengali-font">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold logo-font">desiiseb</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "block" : "hidden"} lg:block fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r lg:border-r-0`}
        >
          <Sidebar profile={profile} onSignOut={handleSignOut} />
        </div>

        {/* Main content */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="border-x bg-white min-h-screen">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b px-4 py-3">
              <h2 className="text-xl font-bold">অন্বেষণ করুন</h2>
            </div>

            <div className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle>ব্যবহারকারী খুঁজুন</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="নাম বা ইউজারনেম দিয়ে খুঁজুন"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                      />
                    </div>
                    <Button onClick={searchUsers} disabled={isLoading}>
                      {isLoading ? "খুঁজছি..." : "খুঁজুন"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {users.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>অনুসন্ধানের ফলাফল</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {users.map((searchUser) => (
                      <div key={searchUser.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={searchUser.avatar_url || undefined} />
                            <AvatarFallback>{searchUser.display_name?.charAt(0)?.toUpperCase() || "ব"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{searchUser.display_name}</p>
                            <p className="text-sm text-gray-500">@{searchUser.username}</p>
                            {searchUser.bio && <p className="text-sm text-gray-600 mt-1">{searchUser.bio}</p>}
                            <p className="text-xs text-gray-500">{searchUser.followers_count} অনুসরণকারী</p>
                          </div>
                        </div>
                        {searchUser.id !== user.id && (
                          <Button
                            variant={searchUser.is_following ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleFollow(searchUser.id, searchUser.is_following)}
                          >
                            {searchUser.is_following ? (
                              <>
                                <UserCheck className="h-4 w-4 mr-1" />
                                অনুসরণ করছেন
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                অনুসরণ করুন
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
