import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Building, User, Phone, Globe, MapPin, Mail, Calendar, Trash2, ShieldCheck, CreditCard, Smartphone, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { collection, serverTimestamp, query, where, getDocs, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ImageUpload from './ImageUpload';
import { load } from '@cashfreepayments/cashfree-js';
import FeedbackModal from './FeedbackModal';
import { cn } from '../utils/cn';
import { generateCertificate } from '../utils/certificateUtils';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [step, setStep] = useState<'form' | 'payment' | 'processing'>('form');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | null>(null);
    const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });
    const [cashfree, setCashfree] = useState<any>(null);
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
    const [registrationFee, setRegistrationFee] = useState(10999);

    useEffect(() => {
        const initCashfree = async () => {
            try {
                // Fetch fee and config
                const configSnap = await getDoc(doc(db, 'settings', 'config'));
                let currentConfig = null;
                if (configSnap.exists()) {
                    currentConfig = configSnap.data();
                    setConfig(currentConfig);
                    setRegistrationFee(currentConfig.registrationFee || 10999);
                } else {
                    console.warn("Config not found in Firestore, using defaults");
                    currentConfig = {
                        cashfreeApiUrl: 'https://sandbox.cashfree.com/pg',
                        registrationFee: 10999
                    };
                    setConfig(currentConfig);
                }

                // Determine mode
                const isSandbox = currentConfig?.cashfreeApiUrl?.includes('sandbox');
                const cf = await load({ mode: isSandbox ? "sandbox" : "production" });
                setCashfree(cf);
            } catch (error) {
                console.error("Cashfree init error:", error);
            }
        };

        if (isOpen) {
            initCashfree();
            document.body.classList.remove('custom-cursor-active');
        } else {
            document.body.classList.add('custom-cursor-active');
        }

        return () => {
            document.body.classList.add('custom-cursor-active');
        };
    }, [isOpen]);

    const handleNextToPayment = (e: React.FormEvent) => {
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
        setStep('payment');
    };

    const handlePayment = async () => {
        if (!paymentMethod) {
            setFeedback({
                isOpen: true,
                type: 'warning',
                title: 'Select Method',
                message: 'Please select a payment method to proceed.'
            });
            return;
        }

        const isSandbox = config?.cashfreeApiUrl?.includes('sandbox');

        if (!cashfree || !config) {
            if (isSandbox) {
                console.warn("Cashfree/Config missing but in Sandbox. Attempting simulation flow.");
                // Fall through to try-catch which will trigger the simulator
            } else {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Configuration Error',
                    message: 'Payment gateway is not initialized. Please try refreshing.'
                });
                return;
            }
        }

        setIsSaving(true);

        try {
            const customerId = `cust_${formData.mobile}`;
            const orderId = `order_${Date.now()}`;

            // Create Order on Cashfree (Direct API call from frontend - requires Secret Key in config)
            const response = await fetch(`${config.cashfreeApiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-client-id': config.cashfreeAppId,
                    'x-client-secret': config.cashfreeSecretKey,
                    'x-api-version': config.cashfreeApiVersion
                },
                body: JSON.stringify({
                    order_id: orderId,
                    order_amount: registrationFee,
                    order_currency: "INR",
                    customer_details: {
                        customer_id: customerId,
                        customer_name: formData.name,
                        customer_email: formData.email || "partner@aparda.com",
                        customer_phone: formData.mobile
                    },
                    order_meta: {
                        return_url: `${window.location.origin}/?order_id={order_id}`
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to create order' }));
                throw new Error(error.message || 'Failed to create order');
            }

            const orderData = await response.json();

            // Trigger Cashfree Checkout
            const result = await cashfree.checkout({
                paymentSessionId: orderData.payment_session_id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            // If we reach here, the modal was closed or payment attempted
            // In a real implementation, you'd poll the status or use a webhook.
            // For this frontend flow, we'll verify the status immediately.

            const verifyResponse = await fetch(`${config.cashfreeApiUrl}/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-client-id': config.cashfreeAppId,
                    'x-client-secret': config.cashfreeSecretKey,
                    'x-api-version': config.cashfreeApiVersion
                }
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.order_status === 'PAID') {
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
                        paymentOrderId: orderId,
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

                setIsSuccess(true);

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
                    orderId: orderId,
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
                    setIsSuccess(false);
                    setStep('form');
                    setPaymentMethod(null);
                    setFormData({
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
                }, 5000);
            } else {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Payment Pending',
                    message: `Payment status is ${verifyData.order_status}. Please contact support if amount was deducted.`
                });
            }
        } catch (error: any) {
            console.error('Registration/Payment error:', error);
            const isSandbox = config?.cashfreeApiUrl?.includes('sandbox');

            // Simulator Fallback for Test Environment (CORS, 403, or Initialization issues)
            const isSimulationTrigger = isSandbox && (
                !cashfree ||
                !config ||
                error.message?.includes('403') ||
                error.message?.includes('Failed to fetch') ||
                error.message?.includes('Access-Control-Allow-Headers')
            );

            if (isSimulationTrigger) {
                const simulateSuccess = window.confirm("Test Environment Notification: Payment gateway connection issue (CORS/403/Init). Would you like to complete registration using the test simulator anyway?");
                if (simulateSuccess) {
                    const orderId = `test_order_${Date.now()}`;
                    let membershipId = '';

                    await runTransaction(db, async (transaction) => {
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
                        transaction.set(counterRef, { membershipSequence: sequence }, { merge: true });

                        const partnerData = {
                            ...formData,
                            amount: registrationFee,
                            paymentStatus: 'success',
                            paymentOrderId: orderId,
                            createdAt: serverTimestamp(),
                            isRegistered: false,
                            approvalStatus: 'pending',
                            membershipId: membershipId
                        };

                        const q = query(collection(db, 'partners'), where('mobile', '==', formData.mobile));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            transaction.update(doc(db, 'partners', querySnapshot.docs[0].id), partnerData);
                        } else {
                            const newRef = doc(collection(db, 'partners'));
                            transaction.set(newRef, partnerData);
                        }
                    });

                    setIsSuccess(true);

                    // Download Certificate in fallback too
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

                    localStorage.setItem('ap_arda_member_data', JSON.stringify({
                        name: formData.name,
                        companyName: formData.companyName,
                        orderId: orderId,
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
                        setIsSuccess(false);
                        setStep('form');
                        setPaymentMethod(null);
                        setFormData({
                            name: '', companyName: '', mobile: '', website: '', logoUrl: '',
                            registrationDate: '', gender: 'Male', address: '', email: '',
                            password: '', isRegistered: false
                        });
                    }, 5000);
                    return;
                }
            }

            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Process Failed',
                message: error.message || 'Something went wrong while processing your registration.'
            });
            setStep('payment');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
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
                            {isSuccess ? (
                                <motion.div
                                    key="success-message"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-20"
                                >
                                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                        <ShieldCheck size={48} />
                                    </div>
                                    <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Registration Received!</h3>
                                    <p className="text-gray-500 font-medium text-lg max-w-md">
                                        Thank you for joining AP-ARDA. Your payment was successful. Our administrators will review your membership and generate your certificate shortly.
                                    </p>
                                </motion.div>
                            ) : (
                                <form key="registration-form" onSubmit={handleNextToPayment} className="grid md:grid-cols-2 gap-8">
                                    <AnimatePresence mode="wait">
                                        {step === 'form' ? (
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
                                                                    placeholder="Website URL"
                                                                    value={formData.website}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                                                    className="w-full border-none bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm outline-none"
                                                                    required
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
                                                        className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98]"
                                                    >
                                                        Proceed to Payment
                                                        <ArrowRight size={24} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="payment-step"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="md:col-span-2 max-w-lg mx-auto w-full py-10"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setStep('form')}
                                                    className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 mb-8 transition-colors"
                                                >
                                                    <ArrowLeft size={16} /> Back to Details
                                                </button>

                                                <div className="mb-8">
                                                    <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Select Payment</h3>
                                                    <p className="text-gray-500 font-medium tracking-tight">Secure payments powered by Cashfree Gateway.</p>
                                                </div>

                                                <div className="space-y-4 mb-10">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentMethod('card')}
                                                        className={cn(
                                                            "w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all",
                                                            paymentMethod === 'card' ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/5" : "border-gray-100 hover:border-blue-100 bg-white"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn("p-4 rounded-2xl", paymentMethod === 'card' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>
                                                                <CreditCard size={24} />
                                                            </div>
                                                            <div className="text-left font-black tracking-tight">
                                                                <p className="text-gray-900">Credit / Debit Card</p>
                                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Visa, Mastercard, RuPay</p>
                                                            </div>
                                                        </div>
                                                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", paymentMethod === 'card' ? "border-blue-600" : "border-gray-200")}>
                                                            {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentMethod('upi')}
                                                        className={cn(
                                                            "w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all",
                                                            paymentMethod === 'upi' ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/5" : "border-gray-100 hover:border-blue-100 bg-white"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn("p-4 rounded-2xl", paymentMethod === 'upi' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>
                                                                <Smartphone size={24} />
                                                            </div>
                                                            <div className="text-left font-black tracking-tight">
                                                                <p className="text-gray-900">UPI Payment</p>
                                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">GPay, PhonePe, Paytm</p>
                                                            </div>
                                                        </div>
                                                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", paymentMethod === 'upi' ? "border-blue-600" : "border-gray-200")}>
                                                            {paymentMethod === 'upi' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                                        </div>
                                                    </button>
                                                </div>

                                                <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-gray-900/20">
                                                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/30 rounded-full blur-[80px]" />
                                                    <div className="flex justify-between items-center mb-8">
                                                        <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest opacity-60">Order Summary</span>
                                                        <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/5">
                                                            <Lock size={12} className="text-blue-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Encrypted</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-end gap-8">
                                                        <div className="tracking-tight">
                                                            <p className="text-sm text-gray-400 font-bold mb-1">Registration Fee</p>
                                                            <p className="text-4xl font-black">₹{registrationFee.toLocaleString()}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={handlePayment}
                                                            disabled={isSaving}
                                                            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-sm tracking-tight transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-blue-900/40"
                                                        >
                                                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : (
                                                                <>
                                                                    Complete Payment
                                                                    <ShieldCheck size={20} />
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
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

            <FeedbackModal
                isOpen={feedback.isOpen}
                onClose={() => setFeedback({ ...feedback, isOpen: false })}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
            />
        </AnimatePresence>
    );
};

export default RegistrationModal;
