"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase/client"
import { createPostSchema } from "@/lib/validations/post"
import { Loader2, ImageIcon, Smile, Hash, AtSign } from "lucide-react"

interface CreatePostProps {
  userId: string
  replyTo?: string
  onPostCreated?: () => void
}

export function CreatePost({ userId, replyTo, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const validatedData = createPostSchema.parse({ content, replyTo })

      // Extract hashtags from content
      const hashtags = content.match(/#[a-zA-Z0-9_\u0980-\u09FF]+/g) || []

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          content: validatedData.content,
          reply_to: validatedData.replyTo || null,
        })
        .select()
        .single()

      if (postError) {
        setError(postError.message)
      } else {
        // Process hashtags
        for (const hashtag of hashtags) {
          const tagName = hashtag.slice(1) // Remove # symbol

          // Insert or get hashtag
          const { data: hashtagData, error: hashtagError } = await supabase
            .from("hashtags")
            .upsert({ name: tagName })
            .select()
            .single()

          if (!hashtagError && hashtagData) {
            // Link post to hashtag
            await supabase.from("post_hashtags").insert({ post_id: postData.id, hashtag_id: hashtagData.id })
          }
        }

        setContent("")
        onPostCreated?.()
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const insertText = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const newContent = content.substring(0, start) + text + content.substring(end)
      setContent(newContent)

      // Set cursor position after inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + text.length
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  const remainingChars = 280 - content.length

  return (
    <div className="border-b p-3 lg:p-4 bengali-font bg-white">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 lg:gap-3">
          <Avatar className="h-10 w-10 lg:h-12 lg:w-12 flex-shrink-0">
            <AvatarFallback>ব</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              placeholder="কী ঘটছে?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-none resize-none text-lg lg:text-xl placeholder:text-lg lg:placeholder:text-xl focus-visible:ring-0 p-0"
              rows={3}
              disabled={isLoading}
            />

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            <div className="flex items-center justify-between mt-3 lg:mt-4">
              <div className="flex items-center gap-1 lg:gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("#")}
                  className="text-blue-600 hover:bg-blue-50 p-2"
                >
                  <Hash className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("@")}
                  className="text-blue-600 hover:bg-blue-50 p-2"
                >
                  <AtSign className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-gray-500 p-2" disabled>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-gray-500 p-2" disabled>
                  <Smile className="h-4 w-4" />
                </Button>
                <span className={`text-sm ml-2 ${remainingChars < 20 ? "text-red-500" : "text-gray-500"}`}>
                  {remainingChars}
                </span>
              </div>

              <Button
                type="submit"
                disabled={!content.trim() || remainingChars < 0 || isLoading}
                className="rounded-full px-4 lg:px-6 text-sm lg:text-base"
                size="sm"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                পোস্ট করুন
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
