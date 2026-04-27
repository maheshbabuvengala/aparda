import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Building, User, Phone, Globe, MapPin, Mail, Calendar, Trash2, ShieldCheck, CreditCard, Smartphone, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { collection, serverTimestamp, query, where, getDocs, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ImageUpload from './ImageUpload';
import FeedbackModal from './FeedbackModal';
import { cn } from '../utils/cn';
import { generateCertificate } from '../utils/certificateUtils';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<'form' | 'success' | 'failure'>('form');
    const [errorMessage, setErrorMessage] = useState('');
    const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });
    const [config, setConfig] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        mobile: '',
        website: '',
        logoUrl: '',
        registrationDate: '',
        gender: 'Male',
        address: '',
        email: '',
        password: '',
        isRegistered: false
    });
    const [registrationFee, setRegistrationFee] = useState(10000);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configSnap = await getDoc(doc(db, 'settings', 'config'));
                if (configSnap.exists()) {
                    const currentConfig = configSnap.data();
                    setConfig(currentConfig);
                    // Forcing 10000 rupee fee as requested, overriding database value if present
                    setRegistrationFee(10000);
                } else {
                    console.warn("Config not found in Firestore, using defaults");
                    setConfig({
                        registrationFee: 10000,
                        razorpayKeyId: 'rzp_live_SiSULbxrI7nSnp'
                    });
                }
            } catch (error) {
                console.error("Config fetch error:", error);
                // Fallback on error
                setConfig({
                    registrationFee: 10000,
                    razorpayKeyId: 'rzp_live_SiSULbxrI7nSnp'
                });
            }
        };

        if (isOpen) {
            fetchConfig();
            document.body.classList.remove('custom-cursor-active');
        } else {
            document.body.classList.add('custom-cursor-active');
        }

        return () => {
            document.body.classList.add('custom-cursor-active');
        };
    }, [isOpen]);

    const handleNextToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.logoUrl) {
            setFeedback({
                isOpen: true,
                type: 'warning',
                title: 'Logo Required',
                message: 'Please upload your company logo to continue.'
            });
            return;
        }
        await handlePayment();
    };

    const handleSuccessfulRegistration = async (paymentId: string) => {
        let membershipId = '';
        await runTransaction(db, async (transaction) => {
            // Check for existing partner
            const q = query(collection(db, 'partners'), where('mobile', '==', formData.mobile));
            const querySnapshot = await getDocs(q);
            const partnerDoc = querySnapshot.empty ? null : querySnapshot.docs[0];

            // Get/Increment counter
            const counterRef = doc(db, 'settings', 'counters');
            const counterSnap = await transaction.get(counterRef);
            let sequence = 1;
            if (counterSnap.exists()) {
                sequence = (counterSnap.data().membershipSequence || 0) + 1;
            }

            const today = new Date();
            const ddmmyyyy = today.getDate().toString().padStart(2, '0') +
                (today.getMonth() + 1).toString().padStart(2, '0') +
                today.getFullYear();

            membershipId = `${ddmmyyyy}${sequence.toString().padStart(4, '0')}`;

            // Update counter
            transaction.set(counterRef, { membershipSequence: sequence }, { merge: true });

            const partnerData = {
                ...formData,
                amount: registrationFee,
                paymentStatus: 'success',
                paymentOrderId: paymentId,
                createdAt: serverTimestamp(),
                isRegistered: false,
                approvalStatus: 'pending',
                membershipId: membershipId
            };

            if (partnerDoc) {
                transaction.update(doc(db, 'partners', partnerDoc.id), partnerData);
            } else {
                const newPartnerRef = doc(collection(db, 'partners'));
                transaction.set(newPartnerRef, partnerData);
            }
        });

        setStatus('success');

        // Download Certificate
        try {
            await generateCertificate({
                name: formData.name,
                companyName: formData.companyName,
                designation: '',
                district: '',
                membershipId: membershipId,
                date: new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
            });
        } catch (certError) {
            console.error('Error generating certificate:', certError);
        }

        // Persist member data locally
        localStorage.setItem('ap_arda_member_data', JSON.stringify({
            name: formData.name,
            companyName: formData.companyName,
            orderId: paymentId,
            amount: registrationFee,
            email: formData.email,
            mobile: formData.mobile,
            designation: '',
            district: '',
            membershipId: membershipId
        }));
        window.dispatchEvent(new Event('ap_arda_member_update'));

        setTimeout(() => {
            onClose();
            setStatus('form');
            setErrorMessage('');
            setFormData({
                name: '', companyName: '', mobile: '', website: '', logoUrl: '',
                registrationDate: '', gender: 'Male', address: '', email: '',
                password: '', isRegistered: false
            });
        }, 5000);
    };

    const handlePayment = async () => {

        let currentKey = config?.razorpayKeyId;
        if (!currentKey) {
            currentKey = 'rzp_live_SiSULbxrI7nSnp';
        }

        setIsSaving(true);

        try {
            const options = {
                key: currentKey,
                amount: registrationFee * 100, // Amount in paise
                currency: "INR",
                name: "AP-ARDA",
                description: "Partner Registration Fee",
                image: formData.logoUrl || "https://aparda.com/logo.png",
                handler: async function (response: any) {
                    setIsSaving(true);
                    try {
                        await handleSuccessfulRegistration(response.razorpay_payment_id);
                    } catch (error: any) {
                        setErrorMessage(error.message || 'Payment successful, but registration failed.');
                        setStatus('failure');
                    } finally {
                        setIsSaving(false);
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email || "partner@aparda.com",
                    contact: formData.mobile
                },
                theme: {
                    color: "#2563eb"
                },
                modal: {
                    ondismiss: function () {
                        setIsSaving(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                console.error('Payment Failed:', response.error);
                setErrorMessage(response.error.description || 'Payment was declined or failed.');
                setStatus('failure');
                setIsSaving(false);
            });
            rzp.open();
        } catch (error: any) {
            console.error('Razorpay Error:', error);
            setErrorMessage(error.message || 'Could not initiate Razorpay checkout.');
            setStatus('failure');
            setIsSaving(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div key="registration-modal-container" className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"
                            onClick={onClose}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl bg-white rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]"
                            style={{ cursor: 'default' }}
                        >
                            {/* Header */}
                            <div className="px-6 md:px-8 py-4 md:py-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight">Partner Registration</h2>
                                    <p className="text-gray-500 font-medium text-[10px] md:text-sm">Join the AP Arda network today.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 md:p-3 bg-white hover:bg-red-50 hover:text-red-500 rounded-full transition-all shadow-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success-message"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center py-20"
                                    >
                                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                            <ShieldCheck size={48} />
                                        </div>
                                        <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Registration Successful!</h3>
                                        <p className="text-gray-500 font-medium text-lg max-w-md">
                                            Thank you for joining AP-ARDA. Your payment was successful. Our administrators will review your membership and generate your certificate shortly.
                                        </p>
                                    </motion.div>
                                ) : status === 'failure' ? (
                                    <motion.div
                                        key="failure-message"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center py-20"
                                    >
                                        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                                            <X size={48} />
                                        </div>
                                        <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Payment Failed</h3>
                                        <p className="text-gray-500 font-medium text-lg max-w-md mb-8">
                                            {errorMessage || 'Something went wrong with your transaction. Please try again or contact support.'}
                                        </p>
                                        <button
                                            onClick={() => {
                                                setStatus('form');
                                                setErrorMessage('');
                                            }}
                                            className="bg-blue-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                                        >
                                            Try Again
                                        </button>
                                    </motion.div>
                                ) : (
                                    <form key="registration-form" onSubmit={handleNextToPayment} className="grid md:grid-cols-2 gap-8">
                                        <AnimatePresence mode="wait">
                                            {status === 'form' && (
                                            <motion.div
                                                key="form-step"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="md:col-span-2 grid md:grid-cols-2 gap-8"
                                            >
                                                <div className="space-y-6">
                                                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                                        <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 block">Company Identity</label>
                                                        <div className="space-y-4">
                                                            {formData.logoUrl ? (
                                                                <div className="relative rounded-2xl overflow-hidden aspect-video bg-white border border-gray-200 p-4 group">
                                                                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                                    >
                                                                        <Trash2 size={24} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <ImageUpload onUploadSuccess={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))} />
                                                            )}
                                                            <div className="relative">
                                                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Company Name"
                                                                    value={formData.companyName}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                                                                    className="w-full border-none bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm outline-none"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                                        <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 block">Personal Information</label>
                                                        <div className="space-y-4">
                                                            <div className="relative">
                                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Full Name"
                                                                    value={formData.name}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                                    className="w-full border-none bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm outline-none"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="relative">
                                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                    <input
                                                                        type="tel"
                                                                        placeholder="Mobile"
                                                                        value={formData.mobile}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                                                                        className="w-full border-none bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm outline-none"
                                                                        required
                                                                    />
                                                                </div>
                                                                <select
                                                                    value={formData.gender}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                                                    className="w-full border-none bg-white rounded-xl px-4 py-4 text-sm font-medium shadow-sm outline-none appearance-none"
                                                                >
                                                                    <option>Male</option>
                                                                    <option>Female</option>
                                                                    <option>Other</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                                        <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 block">Official Details</label>
                                                        <div className="space-y-4">
                                                            <div className="relative">
                                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                <input
                                                                    type="url"
                                                                    placeholder="Website URL (Optional)"
                                                                    value={formData.website}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                                                    className="w-full border-none bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm outline-none"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Registered Date</label>
                                                                <div className="relative">
                                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                    <input
                                                                        type="date"
                                                                        placeholder="Company Registered Date"
                                                                        value={formData.registrationDate}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
                                                                        className="w-full border-none bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm outline-none"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="relative">
                                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                <input
                                                                    type="email"
                                                                    placeholder="Email (Optional)"
                                                                    value={formData.email}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                                    className="w-full border-none bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm outline-none"
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <Save className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                <input
                                                                    type="password"
                                                                    placeholder="Create Password"
                                                                    value={formData.password}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                                    className="w-full border-none bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm outline-none"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                                        <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 block">Location</label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                                                            <textarea
                                                                placeholder="Company Address"
                                                                value={formData.address}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                                                className="w-full border-none bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm outline-none h-32 resize-none"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2 pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={isSaving}
                                                        className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                                                    >
                                                        {isSaving ? <Loader2 className="animate-spin" size={24} /> : (
                                                            <>
                                                                Pay ₹{registrationFee.toLocaleString()} & Register
                                                                <ArrowRight size={24} />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <FeedbackModal
                isOpen={feedback.isOpen}
                onClose={() => setFeedback({ ...feedback, isOpen: false })}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
            />
        </>
    );
};

export default RegistrationModal;
