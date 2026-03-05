import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
const LayoutDashboard = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>;
const Settings = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
const LineChart = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>;
const Gamepad2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="15" x2="15.01" y1="13" y2="13" /><line x1="18" x2="18.01" y1="11" y2="11" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></svg>;
const LogOut = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>;

export default async function OrgLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const orgToken = cookieStore.get("org_token");

    if (!orgToken) {
        redirect("/login");
    }

    const navItems = [
        { name: "Dashboard", href: "/org/dashboard", icon: LayoutDashboard },
        { name: "Settings", href: "/org/settings", icon: Settings },
        { name: "Analytics", href: "/org/analytics", icon: LineChart },
        { name: "Games", href: "/org/games", icon: Gamepad2 },
    ];

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col justify-between border-r border-neutral-800 bg-neutral-900/50 p-4">
                <div>
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-lg">
                            S
                        </div>
                        <span className="text-xl font-semibold tracking-tight">Organization</span>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-all duration-200"
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200">
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium text-sm">Sign out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    );
}
