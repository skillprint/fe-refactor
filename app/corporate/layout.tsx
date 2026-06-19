import React from 'react';
import CorporateSidebar from './components/CorporateSidebar';
import CorporateHeader from './components/CorporateHeader';
import CorporateLayoutClient from './components/CorporateLayoutClient';

export const metadata = {
    title: 'Skillprint Enterprise Dashboard',
    description: 'Corporate analytics console for user telemetry data.'
};

export default function CorporateLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <CorporateLayoutClient>
            <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
                {/* Sidebar Navigation */}
                <CorporateSidebar />

                {/* Main Workspace Frame */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Top Header bar */}
                    <CorporateHeader />

                    {/* Content Area */}
                    <main className="flex-1 overflow-y-auto bg-slate-900/40 relative">
                        {/* Background tech grids */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                        
                        <div className="relative z-10 w-full min-h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </CorporateLayoutClient>
    );
}
