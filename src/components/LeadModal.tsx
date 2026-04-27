import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, ArrowRight, Loader2, CheckCircle2, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LeadModalProps {
    isRegistrationOpen: boolean;
}

const LeadModal: React.FC<LeadModalProps> = ({ isRegistrationOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const checkAndShow = () => {
            const isMember = localStorage.getItem('ap_arda_member_data');
            const isSubmitted = localStorage.getItem('ap_arda_lead_submitted');
            if (!isMember && !isSubmitted && !isRegistrationOpen) {
                setIsOpen(true);
            }
        };

        // Initial check after 3 seconds
        const initialTimer = setTimeout(checkAndShow, 3000);

        // Periodic check every 30 seconds
        const interval = setInterval(checkAndShow, 30000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [isRegistrationOpen]);

    const handleClose = () => {
        setIsOpen(false);
        // Reset success state so it shows the form if it opens again (e.g. after clearing storage)
        setTimeout(() => setIsSuccess(false), 500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !mobile) return;

        setIsSaving(true);
        try {
            // Check if user already exists as a paid member
            const q = query(collection(db, 'partners'), where('mobile', '==', mobile));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const partnerData = querySnapshot.docs[0].data();
                if (partnerData.paymentStatus === 'success') {
                    // Store member data locally
                    localStorage.setItem('ap_arda_member_data', JSON.stringify({
                        name: partnerData.name,
                        companyName: partnerData.companyName,
                        orderId: partnerData.paymentOrderId,
                        amount: partnerData.amount,
                        email: partnerData.email
                    }));
                    setIsSuccess(true);
                    setTimeout(() => {
                        handleClose();
                    }, 2000);
                    return;
                }
            }

            await addDoc(collection(db, 'partners'), {
                name,
                mobile,
                isRegistered: false,
                createdAt: serverTimestamp()
            });
            localStorage.setItem('ap_arda_lead_submitted', 'true');
            setIsSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            console.error('Error saving lead:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div key="lead-modal-container" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-blue-900/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
                    >
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

                        <div className="p-8 md:p-12 relative">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 bg-gray-100/50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all shadow-sm z-10"
                            >
                                <X size={20} />
                            </button>

                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="text-green-600" size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-2">Thank You!</h2>
                                    <p className="text-gray-500">We'll get back to you shortly.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                            Welcome to AP-ARDA
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                            Connect with <span className="text-blue-600">Professional</span> Developers
                                        </h2>
                                        <p className="text-gray-500 mt-4 font-medium">
                                            Join our network and stay updated with the latest in Apex real estate.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                placeholder="Mobile Number"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    Get Started
                                                    <ArrowRight size={20} />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <p className="text-center text-[10px] text-gray-400 mt-6 font-medium">
                                        By clicking "Get Started", you agree to our Terms of Service.
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LeadModal;
