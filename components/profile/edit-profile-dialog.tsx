"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase/client"
import { updateProfileSchema, type UpdateProfileData } from "@/lib/validations/post"
import { Loader2 } from "lucide-react"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: any
  onProfileUpdate: (profile: any) => void
}

export function EditProfileDialog({ open, onOpenChange, profile, onProfileUpdate }: EditProfileDialogProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    displayName: profile?.display_name || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    location: profile?.location || "",
  })
  const [errors, setErrors] = useState<Partial<UpdateProfileData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = updateProfileSchema.parse(formData)

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: validatedData.displayName,
          bio: validatedData.bio || null,
          website: validatedData.website || null,
          location: validatedData.location || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) {
        console.error("Error updating profile:", error)
      } else {
        onProfileUpdate({
          display_name: validatedData.displayName,
          bio: validatedData.bio,
          website: validatedData.website,
          location: validatedData.location,
        })
        onOpenChange(false)
      }
    } catch (error) {
      if (error instanceof Error) {
        const zodError = JSON.parse(error.message)
        const fieldErrors: Partial<UpdateProfileData> = {}
        zodError.forEach((err: any) => {
          fieldErrors[err.path[0] as keyof UpdateProfileData] = err.message
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange =
    (field: keyof UpdateProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bengali-font">
        <DialogHeader>
          <DialogTitle>প্রোফাইল সম্পাদনা করুন</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">প্রদর্শনী নাম</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={handleChange("displayName")}
              placeholder="আপনার প্রদর্শনী নাম"
              disabled={isLoading}
            />
            {errors.displayName && <p className="text-sm text-red-600">{errors.displayName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">বায়ো</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleChange("bio")}
              placeholder="নিজের সম্পর্কে লিখুন"
              disabled={isLoading}
              rows={3}
            />
            {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">অবস্থান</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange("location")}
              placeholder="আপনার অবস্থান"
              disabled={isLoading}
            />
            {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">ওয়েবসাইট</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={handleChange("website")}
              placeholder="https://example.com"
              disabled={isLoading}
            />
            {errors.website && <p className="text-sm text-red-600">{errors.website}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              বাতিল
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
