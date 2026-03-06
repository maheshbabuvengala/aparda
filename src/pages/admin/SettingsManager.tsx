import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Loader2, ShieldCheck, DollarSign, AlertCircle, Radio } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Config {
    registrationFee: number;
    cashfreeAppId: string;
    cashfreeSecretKey: string;
    cashfreeApiUrl: string;
    cashfreeApiVersion: string;
    adTickerText: string;
    adTickerContact: string;
    privacyPolicyContent: string;
    termsAndConditionsContent: string;
    cancellationRefundContent: string;
    shippingDeliveryContent: string;
}

const SettingsManager: React.FC = () => {
    const [config, setConfig] = useState<Config>({
        registrationFee: 10999,
        cashfreeAppId: 'TEST109743997a4de753f275e5e6efc799347901',
        cashfreeSecretKey: 'cfsk_ma_test_da6eda7e5ae58a0366bdc688dd99fc57_33e2863f',
        cashfreeApiUrl: 'https://sandbox.cashfree.com/pg',
        cashfreeApiVersion: '2022-09-01',
        adTickerText: 'For Advertisements Contact AP-ARDA | Premium Real Estate Listings Available',
        adTickerContact: '9381574024',
        privacyPolicyContent: '',
        termsAndConditionsContent: '',
        cancellationRefundContent: '',
        shippingDeliveryContent: ''
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, 'settings', 'config');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(docSnap.data() as Config);
                }
            } catch (error) {
                console.error('Error fetching config:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await setDoc(doc(db, 'settings', 'config'), {
                ...config,
                updatedAt: serverTimestamp()
            });
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
        } catch (error) {
            console.error('Error saving config:', error);
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                <p className="text-gray-400 font-medium">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Portal Settings</h1>
                <p className="text-gray-500 mt-1">Manage registration fees and payment gateway configurations.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Registration Fee Section */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-yellow-100 p-2.5 rounded-2xl">
                            <DollarSign className="text-yellow-700" size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Registration Fee</h2>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Amount (INR)</label>
                        <div className="relative max-w-xs">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                value={config.registrationFee}
                                onChange={(e) => setConfig({ ...config, registrationFee: Number(e.target.value) })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-8 pr-4 py-4 font-black text-lg text-blue-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Ad Ticker Settings */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-yellow-100 p-2.5 rounded-2xl">
                            <Radio className="text-yellow-700" size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Advertisement Ticker</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Ticker Message</label>
                            <input
                                type="text"
                                value={config.adTickerText}
                                onChange={(e) => setConfig({ ...config, adTickerText: e.target.value })}
                                placeholder="For Advertisements Contact AP-ARDA..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 ml-1">This text scrolls across the advertisement ticker banner on the landing page.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Ticker Contact Number</label>
                            <input
                                type="tel"
                                value={config.adTickerContact}
                                onChange={(e) => setConfig({ ...config, adTickerContact: e.target.value })}
                                placeholder="9381574024"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none max-w-xs"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 ml-1">This number shows as a tappable call button in the ticker.</p>
                        </div>
                    </div>
                </div>

                {/* Policy Links Settings */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-100 p-2.5 rounded-2xl">
                            <Radio className="text-purple-700" size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Policy & Legal Content</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Privacy Policy</label>
                            <textarea
                                value={config.privacyPolicyContent}
                                onChange={(e) => setConfig({ ...config, privacyPolicyContent: e.target.value })}
                                placeholder="Enter Privacy Policy content here... (HTML allowed)"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none h-40 resize-y"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Terms & Conditions</label>
                            <textarea
                                value={config.termsAndConditionsContent}
                                onChange={(e) => setConfig({ ...config, termsAndConditionsContent: e.target.value })}
                                placeholder="Enter Terms & Conditions content here... (HTML allowed)"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none h-40 resize-y"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Cancellation & Refund Policy</label>
                            <textarea
                                value={config.cancellationRefundContent}
                                onChange={(e) => setConfig({ ...config, cancellationRefundContent: e.target.value })}
                                placeholder="Enter Cancellation & Refund Policy content here... (HTML allowed)"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none h-40 resize-y"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Shipping & Delivery Policy</label>
                            <textarea
                                value={config.shippingDeliveryContent}
                                onChange={(e) => setConfig({ ...config, shippingDeliveryContent: e.target.value })}
                                placeholder="Enter Shipping & Delivery Policy content here... (HTML allowed)"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none h-40 resize-y"
                            />
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] text-gray-400 mt-1 ml-1">Leave a policy blank if you do not want it to appear in the website footer.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-2.5 rounded-2xl">
                            <ShieldCheck className="text-blue-700" size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Cashfree Gateway Configuration</h2>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            config.cashfreeApiUrl.includes('sandbox') ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                        )}>
                            {config.cashfreeApiUrl.includes('sandbox') ? 'Sandbox Mode' : 'Production Mode'}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">App ID</label>
                            <input
                                type="text"
                                value={config.cashfreeAppId}
                                onChange={(e) => setConfig({ ...config, cashfreeAppId: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none"
                                required
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Secret Key</label>
                            <input
                                type="password"
                                value={config.cashfreeSecretKey}
                                onChange={(e) => setConfig({ ...config, cashfreeSecretKey: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">API Endpoint URL</label>
                            <input
                                type="url"
                                value={config.cashfreeApiUrl}
                                onChange={(e) => setConfig({ ...config, cashfreeApiUrl: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none"
                                required
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">API Version</label>
                            <input
                                type="text"
                                value={config.cashfreeApiVersion}
                                onChange={(e) => setConfig({ ...config, cashfreeApiVersion: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-blue-800 leading-relaxed font-medium">
                            CAUTION: These credentials are critical for payment processing. Ensure you are using Sandbox URLs for testing and Production URLs for live transactions.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    {message.text && (
                        <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'} animate-in fade-in slide-in-from-left-4`}>
                            {message.text}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="ml-auto bg-blue-600 text-white font-black px-10 py-5 rounded-[2rem] shadow-2xl shadow-blue-500/30 flex items-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save All Settings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsManager;
