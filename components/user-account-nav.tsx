"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogIn, UserPlus, LogOut, Settings, ShoppingBag } from "lucide-react"

export function UserAccountNav() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="text-white">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" size="sm" className="bg-white text-red-600 hover:bg-gray-100">
            <UserPlus className="h-4 w-4 mr-2" />
            Register
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white text-red-600 hover:bg-gray-100">
          <User className="h-4 w-4 mr-2" />
          {user.name.split(" ")[0]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name}</p>
            <p className="w-[200px] truncate text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile?tab=orders" className="cursor-pointer">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Order History
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => logout()}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
