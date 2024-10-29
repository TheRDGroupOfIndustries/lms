'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const userFormSchema = z.object({
  role: z.enum(['USER', 'INSTRUCTOR']),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  preferredLanguage: z.enum(['ENGLISH', 'HINDI']),
})

const instructorFormSchema = userFormSchema.extend({
  bio: z.string().min(10, {
    message: "Bio must be at least 10 characters.",
  }),
  expertise: z.string().min(2, {
    message: "Please provide at least one area of expertise.",
  }),
})

export default function UserRoleSelectionForm() {
  const [role, setRole] = useState<'USER' | 'INSTRUCTOR'>('USER')
  const router = useRouter()

  const form = useForm<z.infer<typeof instructorFormSchema>>({
    resolver: zodResolver(role === 'USER' ? userFormSchema : instructorFormSchema),
    defaultValues: {
      role: 'USER',
      name: '',
      preferredLanguage: 'ENGLISH',
      bio: '',
      expertise: '',
    },
  })

  async function onSubmit(values: z.infer<typeof instructorFormSchema>) {
    try {
      const response = await fetch('/api/form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        router.push('/')
      } else {
        console.error('Failed to update user role')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Reverent</CardTitle>
          <CardDescription>Choose your role and complete your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                          setRole(value as 'USER' | 'INSTRUCTOR')
                        }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="USER" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            User
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="INSTRUCTOR" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Instructor
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ENGLISH" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            English
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="HINDI" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Hindi
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {role === 'INSTRUCTOR' && (
                <>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Areas of Expertise</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Organic Farming, Crop Rotation" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate multiple areas with commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Complete Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}