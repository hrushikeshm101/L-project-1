'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/providers/AuthProvider';
import { User } from "firebase/auth";

interface AuthButtonsProps {
    initialUser: User | null;
}

export default function AuthButtons({ initialUser }: AuthButtonsProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Use initialUser for server-rendered fallback, then hydrate with client auth
    const displayUser = user || initialUser;

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);
        router.push('/');
        router.refresh();
    };

    if (!displayUser) {
        return (
            <div className="flex gap-2">
                <Button variant="outline" size="sm">
                    <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm">
                    <Link href="/signup">Sign up</Link>
                </Button>
            </div>
        );
    }

    const initials = displayUser.email?.charAt(0).toUpperCase() || 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger >
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">Account</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {displayUser.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleLogout}
                        disabled={loading}
                        className="text-red-600 focus:text-red-600 cursor-pointer flex justify-center"
                    >
                        {/* <LogOut className="mr-2 h-4 w-4" /> */}
                        {loading ? 'Signing out...' : 'Log out'}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}