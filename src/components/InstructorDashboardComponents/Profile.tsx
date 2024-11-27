"use client"

import { useState, useEffect, useCallback } from "react"
import Image from 'next/image'
import { Facebook, Youtube, Twitter, Loader2, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface InstructorProfile {
    id: string
    userId: string
    bio: string | null
    country: string | null
    state: string | null
    socialLinks: {
        facebook?: string
        youtube?: string
        twitter?: string
        whatsapp?: string
    } | null
    user: {
        name: string
        email: string
    }
    profilePicture: string | null
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<InstructorProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const { toast } = useToast()

    const getNameParts = (fullName: string = '') => {
        const parts = fullName.split(' ')
        return {
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ') || ''
        }
    }

    const fetchProfile = useCallback(async () => {
        try {
            const response = await fetch('/api/instructor')
            if (!response.ok) {
                throw new Error('Failed to fetch profile')
            }
            const data = await response.json()
            setProfile(data)
            setProfileImage(data.profilePicture)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast({
                title: "Error",
                variant: "destructive",
            })
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setUpdating(true)
        const formData = new FormData(event.currentTarget)

        try {
            const response = await fetch('/api/instructor', {
                method: 'PATCH',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            const updatedProfile = await response.json()
            setProfile(updatedProfile)
            setProfileImage(updatedProfile.profilePicture)
            toast({
                title: "Profile updated successfully",
            })
        } catch (error) {
            console.error('Error updating profile:', error)
            toast({
                title: "Error updating profile",
                variant: "destructive",
            })
        } finally {
            setUpdating(false)
        }
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveProfilePicture = async () => {
        try {
            const response = await fetch('/api/instructor', {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to remove profile picture')
            }

            setProfileImage(null)
            toast({
                title: "Profile picture removed successfully",
            })
        } catch (error) {
            console.error('Error removing profile picture:', error)
            toast({
                title: "Error removing profile picture",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!profile) {
        return <div>No profile found.</div>
    }

    const { firstName, lastName } = getNameParts(profile.user?.name)

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Image
                        src={profileImage || "/placeholder.svg?height=204&width=204"}
                        alt="Profile"
                        width={204}
                        height={204}
                        className="rounded-full object-cover"
                        unoptimized
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                        Profile picture
                        <br />
                        PNG, JPEG under 1MB
                    </p>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" className="relative">
                            Upload new picture
                            <input
                                type="file"
                                name="profilePicture"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </Button>
                        {profileImage && (
                            <Button type="button" variant="outline" size="sm" onClick={handleRemoveProfilePicture}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#858585]">First name</Label>
                    <Input id="firstName" name="firstName" defaultValue={firstName} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#858585]">Last name</Label>
                    <Input id="lastName" name="lastName" defaultValue={lastName} required />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-[#858585]">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={profile.user?.email} required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role" className="text-[#858585]">Role</Label>
                <Input id="role" value="Instructor" disabled />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="country" className="text-[#858585]">Country</Label>
                    <Select name="country" defaultValue={profile.country || undefined}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="usa">USA</SelectItem>
                            <SelectItem value="uk">UK</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state" className="text-[#858585]">State</Label>
                    <Select name="state" defaultValue={profile.state || undefined}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio" className="text-[#858585]">Bio</Label>
                <Textarea id="bio" name="bio" placeholder="Tell us about yourself" defaultValue={profile.bio || ''} />
            </div>

            <div className="space-y-4">
                <Label className="text-[#858585]">Social Profiles</Label>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Facebook className="h-5 w-5 text-muted-foreground" />
                        <Input name="facebook" placeholder="Facebook profile URL" defaultValue={profile.socialLinks?.facebook || ''} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Youtube className="h-5 w-5 text-muted-foreground" />
                        <Input name="youtube" placeholder="YouTube channel URL" defaultValue={profile.socialLinks?.youtube || ''} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Twitter className="h-5 w-5 text-muted-foreground" />
                        <Input name="twitter" placeholder="Twitter profile URL" defaultValue={profile.socialLinks?.twitter || ''} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Youtube className="h-5 w-5 text-muted-foreground" />
                        <Input name="whatsapp" placeholder="WhatsApp number" defaultValue={profile.socialLinks?.whatsapp || ''} />
                    </div>
                </div>
            </div>

            <div className="flex justify-center ">
                <Button type="submit" disabled={updating} className="bg-[#17A34A] text-white px-20 rounded-3xl">
                    {updating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </div>
        </form>
    )
}