'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function TopNav() {
    const pathname = usePathname();

    const allLinks = [
        {
            name: 'Home',
            href: '/',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Games',
            href: '/games',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            )
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <nav className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border">
            <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between min-h-[4rem] py-2">
                    {/* Left Branding */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo192.png" alt="Skillprint Logo" width={24} height={24} className="w-6 h-6 rounded-full" />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold bg-clip-text leading-none text-shadow-sm animate-subtle-fade">
                                    Skillprint
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Right Navigation Icons */}
                    <div className="flex items-center gap-4">
                        {allLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`transition-colors p-2 rounded-md ${active
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }`}
                                    title={link.name}
                                >
                                    {link.icon}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
