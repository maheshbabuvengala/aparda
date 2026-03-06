import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    BarChart3,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    ImageIcon,
    Images,
    Megaphone
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Members', path: '/admin/members' },
        { icon: ImageIcon, label: 'Carousel', path: '/admin/carousel' },
        { icon: Images, label: 'Gallery', path: '/admin/gallery' },
        { icon: Users, label: 'User Directory', path: '/admin/users' },
        { icon: Megaphone, label: 'Ads', path: '/admin/ads' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-blue-900 text-white flex flex-col shadow-2xl z-50 relative"
            >
                <div className="p-6 flex items-center gap-4 h-24 border-b border-blue-800/50">
                    <img src="/image.png" alt="Logo" className="h-12 w-12 object-contain flex-shrink-0" />
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col truncate"
                        >
                            <span className="font-bold text-lg tracking-tight">AP-ARDA</span>
                            <span className="text-[10px] text-yellow-400 font-medium uppercase tracking-[0.2em]">Admin Portal</span>
                        </motion.div>
                    )}
                </div>

                <nav className="flex-1 mt-6 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-yellow-500 text-blue-900 shadow-lg shadow-yellow-500/20"
                                        : "hover:bg-blue-800/50 text-blue-100 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-900" : "text-blue-300 group-hover:text-yellow-400")} />
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-medium"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-6 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-blue-800/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-red-400 transition-colors group"
                    >
                        <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        {isSidebarOpen && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 border-b border-gray-100 relative z-40">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">Super Administrator</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-900 to-blue-700 p-0.5 shadow-lg ring-2 ring-gray-50">
                            <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-sm">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -tr-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 tr-y-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
