"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { signUpSchema, type SignUpData } from "@/lib/validations/auth"
import { Loader2 } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState<SignUpData>({
    email: "",
    password: "",
    username: "",
    displayName: "",
  })
  const [errors, setErrors] = useState<Partial<SignUpData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setMessage("")

    try {
      const validatedData = signUpSchema.parse(formData)

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            username: validatedData.username,
            display_name: validatedData.displayName,
          },
        },
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage("আপনার ইমেইল চেক করুন কনফার্মেশন লিঙ্কের জন্য!")
      }
    } catch (error) {
      if (error instanceof Error) {
        const zodError = JSON.parse(error.message)
        const fieldErrors: Partial<SignUpData> = {}
        zodError.forEach((err: any) => {
          fieldErrors[err.path[0] as keyof SignUpData] = err.message
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof SignUpData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 bengali-font">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold logo-font">desiiseb</CardTitle>
          <CardDescription>আজই কথোপকথনে যোগ দিন</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="আপনার ইমেইল লিখুন"
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">ইউজারনেম</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange("username")}
                placeholder="একটি ইউজারনেম বেছে নিন"
                disabled={isLoading}
              />
              {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">প্রদর্শনী নাম</Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange("displayName")}
                placeholder="আপনার প্রদর্শনী নাম"
                disabled={isLoading}
              />
              {errors.displayName && <p className="text-sm text-red-600">{errors.displayName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange("password")}
                placeholder="একটি পাসওয়ার্ড তৈরি করুন"
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              অ্যাকাউন্ট তৈরি করুন
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
              <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
                সাইন ইন করুন
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
