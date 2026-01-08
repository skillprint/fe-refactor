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

    const getLinks = () => {
        // Filter out the current page
        return allLinks.filter(link => link.href !== pathname);
    };

    const links = getLinks();

    const getCurrentPageName = () => {
        if (pathname === '/') return 'Home';
        if (pathname.startsWith('/games')) return 'Games';
        if (pathname.startsWith('/profile')) return 'Profile';
        return '';
    };

    const currentPageName = getCurrentPageName();

    return (
        <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Link */}
                    <div className="flex-1 flex justify-start">
                        {links[0] && (
                            <Link
                                href={links[0].href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                            >
                                {links[0].icon}
                                {links[0].name}
                            </Link>
                        )}
                    </div>

                    {/* Center Branding */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo192.png" alt="Skillprint Logo" width={24} height={24} className="w-6 h-6 rounded-full" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none">
                                Skillprint
                            </span>
                        </Link>
                        {currentPageName && (
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">
                                {currentPageName}
                            </span>
                        )}
                    </div>

                    {/* Right Link */}
                    <div className="flex-1 flex justify-end">
                        {links[1] && (
                            <Link
                                href={links[1].href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                            >
                                {links[1].name}
                                {links[1].icon}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
