
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User as UserIcon, Loader2 } from "lucide-react";

export default function UserNav() {
  const { username, logout, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (!isAuthenticated) {
    return null; // Or a login button if preferred in this context
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || "U";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {/* Placeholder for user avatar image if available */}
            {/* <AvatarImage src="https://placehold.co/40x40.png" alt={username || "User"} /> */}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{username || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              MÁV Account
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Future items can be added here e.g. settings */}
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

