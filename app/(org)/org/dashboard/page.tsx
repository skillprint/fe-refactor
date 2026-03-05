const Users = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const Gamepad2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="15" x2="15.01" y1="13" y2="13" /><line x1="18" x2="18.01" y1="11" y2="11" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></svg>;
const Activity = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const PlaySquare = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="m9 8 6 4-6 4Z" /></svg>;

function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    trend?: string;
}) {
    return (
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/60 transition-all duration-300 backdrop-blur-sm group">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-neutral-800 text-orange-500 group-hover:scale-110 group-hover:bg-neutral-800 transition-all duration-300 shadow-md">
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-1.5">{value}</h3>
                <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider">{title}</p>
                <p className="text-xs text-neutral-500 mt-2">{subtitle}</p>
            </div>
        </div>
    );
}

export default async function OrgDashboardPage() {
    // In a real implementation, you would fetch overview data from an external system
    // or a summarized query here. Using static placeholder data for the MVP layout.

    return (
        <div className="min-h-full p-8 lg:p-12 space-y-8 animate-in fade-in duration-700 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
            <header className="space-y-1">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-sm">
                    Overview
                </h1>
                <p className="text-base font-medium text-neutral-400">
                    A high-level view of your organization's performance.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Members"
                    value="42"
                    subtitle="Managed users in the organization"
                    icon={Users}
                    trend="+3 this week"
                />
                <MetricCard
                    title="Active Games"
                    value="12"
                    subtitle="Currently active catalog games"
                    icon={Gamepad2}
                />
                <MetricCard
                    title="Total Playtime"
                    value="1.2k hrs"
                    subtitle="Cumulated by all members"
                    icon={Activity}
                    trend="+15%"
                />
                <MetricCard
                    title="Game Sessions"
                    value="3,492"
                    subtitle="Total sessions across catalog"
                    icon={PlaySquare}
                />
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                <div className="lg:col-span-2 p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 px-4 rounded-xl transition-all duration-200">
                                <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-500">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Member played Memory Game</p>
                                    <p className="text-xs text-neutral-500">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-neutral-800 bg-gradient-to-br from-orange-950/40 to-neutral-900/30 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:shadow-[0_0_20px_rgba(234,88,12,0.5)] transform hover:-translate-y-0.5">
                            Invite Member
                        </button>
                        <button className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5">
                            Toggle Games
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
