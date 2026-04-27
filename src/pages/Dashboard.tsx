import React from 'react';
import {
    Users,
    Building2,
    Clock,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Megaphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Dashboard: React.FC = () => {
    const [memberCount, setMemberCount] = React.useState(0);
    const [adCount, setAdCount] = React.useState(0);
    const [recentActs, setRecentActs] = React.useState<any[]>([]);

    React.useEffect(() => {
        // Members count & recent
        const unsubMembers = onSnapshot(query(collection(db, 'members'), orderBy('createdAt', 'desc')), (snap) => {
            setMemberCount(snap.size);
            const recentMembers = snap.docs.slice(0, 2).map(doc => ({
                id: `mem-${doc.id}`,
                type: 'New Member',
                name: doc.data().companyName || doc.data().name || 'Unknown',
                status: 'Joined',
                time: new Date(doc.data().createdAt?.toDate()).toLocaleDateString() || 'Recently',
                amount: '-'
            }));

            setRecentActs(prev => {
                const filtered = prev.filter(p => p.type !== 'New Member');
                return [...recentMembers, ...filtered].slice(0, 4);
            });
        });

        // Ads count & recent
        const unsubAds = onSnapshot(query(collection(db, 'advertisements'), orderBy('createdAt', 'desc')), (snap) => {
            setAdCount(snap.size);
            const recentAds = snap.docs.slice(0, 2).map(doc => ({
                id: `ad-${doc.id}`,
                type: 'Advertisement',
                name: doc.data().contactNumber || 'New Ad',
                status: 'Active',
                time: new Date(doc.data().createdAt?.toDate()).toLocaleDateString() || 'Recently',
                amount: '-'
            }));

            setRecentActs(prev => {
                const filtered = prev.filter(p => p.type !== 'Advertisement');
                return [...recentAds, ...filtered].slice(0, 4);
            });
        });

        return () => {
            unsubMembers();
            unsubAds();
        };
    }, []);

    const stats = [
        { label: 'Total Members', value: memberCount.toString(), change: 'Live', icon: Users, color: 'blue' },
        { label: 'Active Ads', value: adCount.toString(), change: 'Live', icon: Megaphone, color: 'yellow' },
        { label: 'Pending Approvals', value: '0', change: 'Live', icon: Clock, color: 'orange' },
        { label: 'System Health', value: '100%', change: 'Live', icon: TrendingUp, color: 'green' },
    ];


    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, Administrator. Here's what's happening today.</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <button className="px-6 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20">Real-time</button>
                    <button className="px-6 py-2 text-gray-500 hover:text-gray-900 rounded-xl text-sm font-bold transition-colors">Historical</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-50 overflow-hidden relative"
                    >
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 -tr-y-8 translate-x-8 rounded-full opacity-[0.03] group-hover:opacity-[0.07] transition-opacity",
                            stat.color === 'blue' ? 'bg-blue-600' :
                                stat.color === 'yellow' ? 'bg-yellow-600' :
                                    stat.color === 'orange' ? 'bg-orange-600' : 'bg-green-600'
                        )} />

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className={cn(
                                "p-4 rounded-2xl",
                                stat.color === 'blue' && 'bg-blue-50 text-blue-600',
                                stat.color === 'yellow' && 'bg-yellow-50 text-yellow-600',
                                stat.color === 'orange' && 'bg-orange-50 text-orange-600',
                                stat.color === 'green' && 'bg-green-50 text-green-600'
                            )}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                            )}>
                                {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.change}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Table Section */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</h2>
                        <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            View All <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left">
                                    <th className="pb-6 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Entity</th>
                                    <th className="pb-6 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Type</th>
                                    <th className="pb-6 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentActs.map((act) => (
                                    <tr key={act.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-6 px-4">
                                            <div className="font-bold text-gray-900">{act.project || act.name}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{act.time}</div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className="text-sm font-medium text-gray-500">{act.type}</span>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-full text-xs font-bold tracking-tight inline-block",
                                                act.status === 'Active' ? 'bg-green-50 text-green-600' :
                                                    act.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                                                        act.status === 'Joined' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                            )}>
                                                {act.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Building2 className="text-yellow-400/20 w-32 h-32 -rotate-12" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 relative z-10">AP-ARDA<br />Master Plan 2024</h3>
                        <p className="text-blue-100/70 text-sm leading-relaxed mb-6 relative z-10">
                            The Apex development roadmap is currently in Phase 3. Regulatory filings have increased by 14% this quarter.
                        </p>
                        <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 rounded-2xl transition-all relative z-10 flex items-center justify-center gap-2">
                            Review Roadmap <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
                        <h3 className="font-black text-gray-900 mb-6">System Health</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Cloud Sync', status: 'Optimal', color: 'bg-green-500' },
                                { label: 'Security Firewall', status: 'Secured', color: 'bg-green-500' },
                                { label: 'Data Processing', status: 'Running', color: 'bg-blue-500' }
                            ].map(sys => (
                                <div key={sys.label} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">{sys.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">{sys.status}</span>
                                        <div className={cn("h-1.5 w-1.5 rounded-full", sys.color)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
