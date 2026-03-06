import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from '../../components/ImageUpload';
import { Trash2, Megaphone, Loader2, Phone, Globe } from 'lucide-react';
import FeedbackModal from '../../components/FeedbackModal';

interface Advertisement {
    id: string;
    imageUrl: string;
    contactNumber: string;
    websiteUrl?: string;
    createdAt: any;
}

const AdManager: React.FC = () => {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);
    const [contactNumber, setContactNumber] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
        isOpen: false, type: 'success', title: '', message: ''
    });

    useEffect(() => {
        const q = query(collection(db, 'advertisements'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Advertisement[];
            setAds(list);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleUploadSuccess = async (url: string) => {
        if (!contactNumber) {
            setFeedback({ isOpen: true, type: 'warning', title: 'Contact Required', message: 'Please enter a contact number before uploading an advertisement.' });
            return;
        }

        setIsSaving(true);
        try {
            await addDoc(collection(db, 'advertisements'), {
                imageUrl: url,
                contactNumber: contactNumber.trim(),
                websiteUrl: websiteUrl.trim() || null,
                createdAt: serverTimestamp(),
            });
            setContactNumber('');
            setWebsiteUrl('');
            setFeedback({ isOpen: true, type: 'success', title: 'Ad Published', message: 'Your advertisement is now live on the landing page.' });
        } catch (error) {
            console.error('Error saving ad:', error);
            setFeedback({ isOpen: true, type: 'error', title: 'Save Failed', message: 'Could not save advertisement. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this advertisement permanently?')) return;
        try {
            await deleteDoc(doc(db, 'advertisements', id));
            setFeedback({ isOpen: true, type: 'success', title: 'Ad Removed', message: 'Advertisement has been deleted successfully.' });
        } catch (error) {
            console.error('Error deleting ad:', error);
            setFeedback({ isOpen: true, type: 'error', title: 'Delete Failed', message: 'Could not delete advertisement.' });
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Advertisement Manager</h1>
                <p className="text-gray-500 font-medium mt-1">Publish banners, set contact numbers, and link to websites.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 sticky top-8 space-y-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-gray-900">
                            <Megaphone className="text-blue-600" size={20} />
                            New Advertisement
                        </h2>

                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Contact Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    placeholder="+91 XXX XXX XXXX"
                                    className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Website URL (optional)</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="url"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 ml-1">If provided, clicking the ad will open this URL.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Banner Image *</label>
                            <ImageUpload onUploadSuccess={handleUploadSuccess} />
                        </div>

                        {isSaving && (
                            <div className="flex items-center justify-center gap-2 py-2 text-blue-600 font-bold text-sm">
                                <Loader2 className="animate-spin" size={16} />
                                Publishing advertisement...
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 min-h-[400px]">
                        <h2 className="text-xl font-black mb-8 text-gray-900">Active Advertisements</h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                                <p className="text-gray-400 font-medium">Loading...</p>
                            </div>
                        ) : ads.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                                <Megaphone size={48} className="text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">No advertisements found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {ads.map((ad) => (
                                    <div key={ad.id} className="relative group rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                        <div className="aspect-[21/9] overflow-hidden">
                                            <img src={ad.imageUrl} alt="Ad Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex items-center justify-between">
                                            <div className="flex gap-6 text-white">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-blue-400" />
                                                    <p className="font-bold text-sm">{ad.contactNumber}</p>
                                                </div>
                                                {ad.websiteUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <Globe size={14} className="text-green-400" />
                                                        <p className="font-bold text-sm truncate max-w-48">{ad.websiteUrl}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(ad.id)}
                                                className="p-3 bg-red-500/90 backdrop-blur-md text-white rounded-xl hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FeedbackModal
                isOpen={feedback.isOpen}
                onClose={() => setFeedback({ ...feedback, isOpen: false })}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
            />
        </div>
    );
};

export default AdManager;
