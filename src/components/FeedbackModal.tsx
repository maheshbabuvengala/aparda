import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, type, title, message }) => {
    const icons = {
        success: <CheckCircle2 className="text-green-500" size={48} />,
        error: <XCircle className="text-red-500" size={48} />,
        warning: <AlertCircle className="text-yellow-500" size={48} />
    };

    const bgColors = {
        success: 'bg-green-50',
        error: 'bg-red-50',
        warning: 'bg-yellow-50'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6", bgColors[type])}>
                            {icons[type]}
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{title}</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">{message}</p>

                        <button
                            onClick={onClose}
                            className={cn(
                                "w-full mt-8 py-4 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg",
                                type === 'success' ? "bg-green-600 shadow-green-200" :
                                    type === 'error' ? "bg-red-600 shadow-red-200" :
                                        "bg-yellow-600 shadow-yellow-200"
                            )}
                        >
                            Continue
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;
