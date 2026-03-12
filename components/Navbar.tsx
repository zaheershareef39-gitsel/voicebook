'use client';
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SignInButton, SignUpButton, UserButton, Show, useUser } from '@clerk/nextjs'
import { useUserPlan } from '@/hooks/useSubscription';

const navItems = [
    { label: "Library", href: "/" },
    { label: "Add New", href: "/books/new" },
]


const PlanBadge: React.FC = () => {
    const plan = useUserPlan();
    if (!plan) return null;
    return (
        <span className="ml-2 text-sm text-gray-600">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
    );
};

const Navbar = () => {
    const pathName = usePathname();
    const { user } = useUser();
    return (
        <header className="w-full fixed z-50 bg-[var(--bg-primary)]">
            <div className='wrapper navbar-height py-4 flex justify-between items-center'>
                <Link href="/" className="flex gap-0.5 items-center">
                    <Image src="/assets/logo.png" alt="Bookified" width={42} height={26} />
                    <span className='logo-text'>Bookified</span></Link>
                <div className='flex items-center gap-7.5'>
                    <nav className='w-fit flex gap-7.5 items-center'>
                        {navItems.map(({ label, href }) => {
                            const isActive = pathName == href ||
                                (href != '/' && pathName.startsWith(href));
                            return (
                                <Link href={href} key={label} className={cn('nav-link-base', isActive ? 'nav-link-active' : 'text-black hover:opacity-70')}>
                                    {label}
                                </Link>
                            )
                        })}
                        <div className='flex gap-7.5 items-center'>
                            <Show when="signed-out">
                                <SignInButton />
                                <SignUpButton />
                            </Show>
                            <Show when="signed-in">
                                <div className='nav-user-link'>
                                    <UserButton />
                                    {user?.firstName && (
                                        <Link href="/subscriptions" className='nav-user-name'>
                                            {user.firstName}
                                        </Link>
                                    )}
                                    {/* show plan badge */}
                                    <PlanBadge />
                                </div>

                            </Show>
                        </div>
                    </nav>
                </div>

            </div>
        </header>
    )
}

export default Navbar 