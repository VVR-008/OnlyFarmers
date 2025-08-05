"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import toast from "react-hot-toast"

interface User {
  id: string
  email: string
  name: string
  role: "farmer" | "buyer" | "admin"
  phone?: string
  avatar?: string
  isVerified: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: "farmer" | "buyer"
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get("token")
      console.log("Auth check - Token:", token ? "exists" : "missing")
      
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Auth check - User data:", response.data.user)
      setUser(response.data.user)
    } catch (error) {
      console.error("Auth check failed:", error)
      Cookies.remove("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      })

      const { token, user } = response.data

      Cookies.set("token", token, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: "strict" })
      setUser(user)

      toast.success("Login successful!")
      router.push("/dashboard")
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post("/api/auth/register", userData)

      const { token, user } = response.data

      Cookies.set("token", token, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: "strict" })
      setUser(user)

      toast.success("Registration successful!")
      router.push("/dashboard")
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    Cookies.remove("token")
    setUser(null)
    toast.success("Logged out successfully")
    router.push("/")
  }

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
