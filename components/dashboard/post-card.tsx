"use client"

import { formatDistanceToNow } from "date-fns"
import { bn } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react"
import Link from "next/link"

interface PostCardProps {
  post: {
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
  currentUserId: string
  onLike: (postId: string, isLiked: boolean) => void
  onRepost: (postId: string, isReposted: boolean) => void
}

export function PostCard({ post, currentUserId, onLike, onRepost }: PostCardProps) {
  const formatContent = (content: string) => {
    return content
      .replace(
        /#([a-zA-Z0-9_\u0980-\u09FF]+)/g,
        '<span class="text-blue-600 hover:underline cursor-pointer">#$1</span>',
      )
      .replace(/@([a-zA-Z0-9_]+)/g, '<span class="text-blue-600 hover:underline cursor-pointer">@$1</span>')
  }

  const displayTime =
    post.is_repost && post.repost_created_at ? new Date(post.repost_created_at) : new Date(post.created_at)

  return (
    <div className="border-b hover:bg-gray-50 transition-colors bengali-font">
      {/* Repost indicator */}
      {post.is_repost && (
        <div className="px-3 lg:px-4 pt-2 lg:pt-3 pb-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Repeat2 className="h-4 w-4" />
            <Link href={`/profile/${post.repost_username}`} className="hover:underline">
              <span className="font-semibold">{post.repost_display_name}</span> রিপোস্ট করেছেন
            </Link>
          </div>
        </div>
      )}

      <div className="p-3 lg:p-4">
        <div className="flex gap-2 lg:gap-3">
          <Link href={`/profile/${post.username}`} className="flex-shrink-0">
            <Avatar className="cursor-pointer h-10 w-10 lg:h-12 lg:w-12">
              <AvatarImage src={post.avatar_url || undefined} />
              <AvatarFallback>{post.display_name?.charAt(0)?.toUpperCase() || "ব"}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 lg:gap-2 mb-1 flex-wrap">
              <Link href={`/profile/${post.username}`} className="hover:underline">
                <span className="font-semibold text-sm lg:text-base truncate">{post.display_name}</span>
              </Link>
              <Link href={`/profile/${post.username}`} className="hover:underline">
                <span className="text-gray-500 text-sm truncate">@{post.username}</span>
              </Link>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-xs lg:text-sm">
                {formatDistanceToNow(displayTime, { addSuffix: true, locale: bn })}
              </span>
            </div>

            <div
              className="text-gray-900 mb-3 whitespace-pre-wrap text-sm lg:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
            />

            {/* Media display */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mb-3 rounded-lg overflow-hidden border">
                {post.media_type === "image" && (
                  <div className="grid grid-cols-2 gap-1">
                    {post.media_urls.slice(0, 4).map((url, index) => (
                      <img
                        key={index}
                        src={url || "/placeholder.svg"}
                        alt="Post media"
                        className="w-full h-32 lg:h-48 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between max-w-sm lg:max-w-md">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 p-1 lg:p-2">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs lg:text-sm">উত্তর</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`${post.is_reposted ? "text-green-600" : "text-gray-500"} hover:text-green-600 p-1 lg:p-2`}
                onClick={() => onRepost(post.id, post.is_reposted)}
              >
                <Repeat2 className="h-4 w-4 mr-1" />
                <span className="text-xs lg:text-sm">{post.reposts_count}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`${post.is_liked ? "text-red-600" : "text-gray-500"} hover:text-red-600 p-1 lg:p-2`}
                onClick={() => onLike(post.id, post.is_liked)}
              >
                <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? "fill-current" : ""}`} />
                <span className="text-xs lg:text-sm">{post.likes_count}</span>
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 p-1 lg:p-2">
                <Share className="h-4 w-4 mr-1" />
                <span className="text-xs lg:text-sm">শেয়ার</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
