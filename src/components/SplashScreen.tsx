import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#001f3f]"
        >
            {/* Abstract Background for Splash */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600 rounded-full blur-[120px] opacity-10 animate-pulse" />
            </div>

            <div className="relative flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 1,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.2
                    }}
                    className="relative mb-8"
                >
                    {/* Logo Glow */}
                    <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse" />
                    <img
                        src="/image.png"
                        alt="AP-ARDA Logo"
                        className="h-32 w-32 md:h-48 md:w-48 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase">
                            AP-ARDA
                        </h1>
                        <p className="text-[10px] md:text-xs font-black text-yellow-500 uppercase tracking-[0.4em] mt-2">
                            Andhra Pradesh APEX REAL ESTATE DEVELOPERS ASSOCIATION
                        </p>
                    </div>

                    {/* Premium Loading Bar */}
                    <div className="w-48 h-[2px] bg-white/10 rounded-full mt-8 overflow-hidden relative">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-full"
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
