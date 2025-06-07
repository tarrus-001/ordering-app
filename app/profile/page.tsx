"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Save, LogOut, ShoppingBag, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading, updateProfile, logout } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [user, authLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    setIsUpdating(true)

    try {
      const success = await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
      })

      if (success) {
        setMessage({ type: "success", text: "Profile updated successfully" })
      } else {
        setMessage({ type: "error", text: "Failed to update profile" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (authLoading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={profileData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" value={profileData.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Default Delivery Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter your delivery address"
                  />
                </div>

                {message.text && (
                  <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {message.text}
                  </p>
                )}

                <div className="flex justify-between">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No orders yet</h3>
                <p className="text-gray-500 mt-2">When you place orders, they will appear here</p>
                <Button className="mt-4" onClick={() => router.push("/")}>
                  Start Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>Manage your delivery addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No addresses saved</h3>
                <p className="text-gray-500 mt-2">Add addresses for faster checkout</p>
                <Button className="mt-4" variant="outline">
                  Add New Address
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
