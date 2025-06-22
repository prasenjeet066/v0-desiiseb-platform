"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { PostCard } from "./post-card"

interface TimelineProps {
  userId: string
  refreshTrigger?: number
}

interface Post {
  id: string
  content: string
  created_at: string
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  likes_count: number
  is_liked: boolean
  reposts_count: number
  is_reposted: boolean
  reply_to: string | null
  media_urls: string[] | null
  media_type: string | null
  is_repost: boolean
  repost_user_id: string | null
  repost_username: string | null
  repost_display_name: string | null
  repost_created_at: string | null
}

export function Timeline({ userId, refreshTrigger }: TimelineProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      setIsLoading(true)

      // First try the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_timeline_posts", {
        user_id: userId,
        limit_count: 20,
        offset_count: 0,
      })

      if (rpcError) {
        console.error("RPC Error:", rpcError)

        // Fallback to direct query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("posts")
          .select(`
          id,
          content,
          created_at,
          user_id,
          reply_to,
          media_urls,
          media_type,
          //profiles!inner(username, display_name, avatar_url)
        `)
          .order("created_at", { ascending: false })
          .limit(20)

        if (fallbackError) {
          console.error("Fallback Error:", fallbackError)
          return
        }

        // Get likes and reposts for fallback posts
        const postIds = fallbackData?.map((p) => p.id) || []
        const [likesData, repostsData] = await Promise.all([
          supabase.from("likes").select("post_id, user_id").in("post_id", postIds),
          supabase.from("reposts").select("post_id, user_id").in("post_id", postIds),
        ])

        const likesMap = new Map()
        const userLikesSet = new Set()
        const repostsMap = new Map()
        const userRepostsSet = new Set()

        likesData.data?.forEach((like) => {
          likesMap.set(like.post_id, (likesMap.get(like.post_id) || 0) + 1)
          if (like.user_id === userId) {
            userLikesSet.add(like.post_id)
          }
        })

        repostsData.data?.forEach((repost) => {
          repostsMap.set(repost.post_id, (repostsMap.get(repost.post_id) || 0) + 1)
          if (repost.user_id === userId) {
            userRepostsSet.add(repost.post_id)
          }
        })

        const formattedPosts: Post[] =
          fallbackData?.map((post) => ({
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            user_id: post.user_id,
            username: post.profiles.username,
            display_name: post.profiles.display_name,
            avatar_url: post.profiles.avatar_url,
            likes_count: likesMap.get(post.id) || 0,
            is_liked: userLikesSet.has(post.id),
            reposts_count: repostsMap.get(post.id) || 0,
            is_reposted: userRepostsSet.has(post.id),
            reply_to: post.reply_to,
            media_urls: post.media_urls,
            media_type: post.media_type,
            is_repost: false,
            repost_user_id: null,
            repost_username: null,
            repost_display_name: null,
            repost_created_at: null,
          })) || []

        setPosts(formattedPosts)
      } else {
        setPosts(rpcData || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [userId, refreshTrigger])

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (isLiked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId)
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: userId })
    }

    // Update local state
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, is_liked: !isLiked, likes_count: post.likes_count + (isLiked ? -1 : 1) } : post,
      ),
    )
  }

  const handleRepost = async (postId: string, isReposted: boolean) => {
    if (isReposted) {
      await supabase.from("reposts").delete().eq("post_id", postId).eq("user_id", userId)
    } else {
      await supabase.from("reposts").insert({ post_id: postId, user_id: userId })
    }

    // Update local state
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, is_reposted: !isReposted, reposts_count: post.reposts_count + (isReposted ? -1 : 1) }
          : post,
      ),
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bengali-font">
        <p>এখনো কোনো পোস্ট নেই। কিছু ব্যবহারকারীকে ফলো করুন বা আপনার প্রথম পোস্ট তৈরি করুন!</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={`${post.id}_${post.is_repost ? post.repost_created_at : post.created_at}`}
          post={post}
          currentUserId={userId}
          onLike={handleLike}
          onRepost={handleRepost}
        />
      ))}
    </div>
  )
}
