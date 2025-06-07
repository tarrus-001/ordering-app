"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define user type
export interface User {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  createdAt: Date
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<boolean>
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt),
        })
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const userData = await response.json()

      // Store user in state and localStorage
      setUser(userData.user)
      localStorage.setItem("user", JSON.stringify(userData.user))
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      })

      if (!response.ok) {
        throw new Error("Registration failed")
      }

      const userData = await response.json()

      // Store user in state and localStorage
      setUser(userData.user)
      localStorage.setItem("user", JSON.stringify(userData.user))
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...userData }),
      })

      if (!response.ok) {
        throw new Error("Profile update failed")
      }

      const updatedUserData = await response.json()

      // Update user in state and localStorage
      const updatedUser = { ...user, ...updatedUserData.user }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      return true
    } catch (error) {
      console.error("Profile update error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
