"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/dashboard/sidebar"
import { LogOut, Menu, X, Heart, UserPlus, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { bn } from "date-fns/locale"

interface Notification {
  id: string
  type: "like" | "follow" | "mention"
  created_at: string
  from_user: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
  post?: {
    id: string
    content: string
  }
}

export function NotificationsContent() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          setUser(userData.user)
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()
          setProfile(profileData)

          // Fetch notifications (likes and follows)
          const [likesData, followsData, mentionsData] = await Promise.all([
            // Likes on user's posts
            supabase
              .from("likes")
              .select(`
                id,
                created_at,
                user_id,
                post_id,
                profiles!inner(id, username, display_name, avatar_url),
                posts!inner(id, content, user_id)
              `)
              .eq("posts.user_id", userData.user.id)
              .neq("user_id", userData.user.id)
              .order("created_at", { ascending: false })
              .limit(20),

            // New followers
            supabase
              .from("follows")
              .select(`
                id,
                created_at,
                follower_id,
                profiles!inner(id, username, display_name, avatar_url)
              `)
              .eq("following_id", userData.user.id)
              .order("created_at", { ascending: false })
              .limit(20),

            // Mentions
            supabase
              .from("mentions")
              .select(`
                id,
                created_at,
                post_id,
                posts!inner(id, content, user_id, profiles!inner(id, username, display_name, avatar_url))
              `)
              .eq("mentioned_user_id", userData.user.id)
              .order("created_at", { ascending: false })
              .limit(20),
          ])

          const allNotifications: Notification[] = []

          // Process likes
          likesData.data?.forEach((like) => {
            allNotifications.push({
              id: `like_${like.id}`,
              type: "like",
              created_at: like.created_at,
              from_user: {
                id: like.profiles.id,
                username: like.profiles.username,
                display_name: like.profiles.display_name,
                avatar_url: like.profiles.avatar_url,
              },
              post: {
                id: like.posts.id,
                content: like.posts.content,
              },
            })
          })

          // Process follows
          followsData.data?.forEach((follow) => {
            allNotifications.push({
              id: `follow_${follow.id}`,
              type: "follow",
              created_at: follow.created_at,
              from_user: {
                id: follow.profiles.id,
                username: follow.profiles.username,
                display_name: follow.profiles.display_name,
                avatar_url: follow.profiles.avatar_url,
              },
            })
          })

          // Process mentions
          mentionsData.data?.forEach((mention) => {
            allNotifications.push({
              id: `mention_${mention.id}`,
              type: "mention",
              created_at: mention.created_at,
              from_user: {
                id: mention.posts.profiles.id,
                username: mention.posts.profiles.username,
                display_name: mention.posts.profiles.display_name,
                avatar_url: mention.posts.profiles.avatar_url,
              },
              post: {
                id: mention.posts.id,
                content: mention.posts.content,
              },
            })
          })

          // Sort by date
          allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          setNotifications(allNotifications)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "follow":
        return <UserPlus className="h-5 w-5 text-blue-500" />
      case "mention":
        return <MessageCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return `${notification.from_user.display_name} আপনার পোস্ট পছন্দ করেছেন`
      case "follow":
        return `${notification.from_user.display_name} আপনাকে অনুসরণ করতে শুরু করেছেন`
      case "mention":
        return `${notification.from_user.display_name} আপনাকে একটি পোস্টে উল্লেখ করেছেন`
      default:
        return ""
    }
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
              <h2 className="text-xl font-bold">বিজ্ঞপ্তি</h2>
            </div>

            <div className="divide-y">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>কোনো বিজ্ঞপ্তি নেই</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={notification.from_user.avatar_url || undefined} />
                            <AvatarFallback>
                              {notification.from_user.display_name?.charAt(0)?.toUpperCase() || "ব"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-semibold">{notification.from_user.display_name}</span>
                              <span className="text-gray-500"> @{notification.from_user.username}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: bn })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{getNotificationText(notification)}</p>
                        {notification.post && (
                          <Card className="bg-gray-50">
                            <CardContent className="p-3">
                              <p className="text-sm text-gray-600 line-clamp-2">{notification.post.content}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                ))
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
