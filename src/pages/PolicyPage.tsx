import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const PolicyPage: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const docRef = doc(db, 'settings', 'config');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    switch (type) {
                        case 'privacy':
                            setContent(data.privacyPolicyContent || null);
                            setTitle('Privacy Policy');
                            break;
                        case 'terms':
                            setContent(data.termsAndConditionsContent || null);
                            setTitle('Terms & Conditions');
                            break;
                        case 'cancellation':
                            setContent(data.cancellationRefundContent || null);
                            setTitle('Cancellation & Refund Policy');
                            break;
                        case 'shipping':
                            setContent(data.shippingDeliveryContent || null);
                            setTitle('Shipping & Delivery Policy');
                            break;
                        default:
                            setContent(null);
                            setTitle('Policy Not Found');
                    }
                }
            } catch (error) {
                console.error('Error fetching policy:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
        window.scrollTo(0, 0);
    }, [type]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-gray-500 font-medium tracking-tight">Loading document...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-inter selection:bg-blue-600 selection:text-white">
            {/* Premium Header */}
            <header className="bg-blue-950 text-white py-12 md:py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px]" />

                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold tracking-widest uppercase text-xs">Back</span>
                    </button>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black tracking-tight"
                    >
                        {title}
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.2 }}
                        className="h-1.5 w-24 bg-yellow-500 mt-6 md:mt-8 rounded-full origin-left"
                    />
                </div>
            </header>

            {/* Document Content */}
            <main className="container mx-auto px-6 py-12 md:py-20 max-w-4xl">
                {content ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 prose prose-lg prose-blue max-w-none text-gray-700 font-medium"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] p-12 text-center shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center justify-center min-h-[40vh]"
                    >
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
                            <ShieldAlert size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Document Not Available</h2>
                        <p className="text-gray-500 max-w-sm">This policy document has not been published yet or could not be found. Please check back later.</p>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default PolicyPage;
