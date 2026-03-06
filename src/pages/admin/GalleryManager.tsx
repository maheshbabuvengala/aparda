import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from '../../components/ImageUpload';
import { Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
    id: string;
    url: string;
    createdAt: any;
}

const GalleryManager: React.FC = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const imageList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as GalleryImage[];
            setImages(imageList);
            setLoading(false);
        }, (error) => {
            console.error('Gallery onSnapshot error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUploadSuccess = async (url: string) => {
        try {
            await addDoc(collection(db, 'gallery'), {
                url,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error saving image to Firestore:', error);
            alert('Failed to save to gallery.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove from gallery?')) return;
        try {
            await deleteDoc(doc(db, 'gallery', id));
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gallery Management</h1>
                <p className="text-gray-500 mt-1">Manage images displayed in the landing page gallery.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 sticky top-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <ImageIcon className="text-blue-600" size={20} />
                            Add Photo
                        </h2>
                        <ImageUpload onUploadSuccess={handleUploadSuccess} />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 min-h-[400px]">
                        <h2 className="text-xl font-bold mb-8 text-gray-900">Gallery Photos (Latest First)</h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                                <p className="text-gray-400 font-medium">Loading gallery...</p>
                            </div>
                        ) : images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-3xl">
                                <ImageIcon size={48} className="text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium text-center">No images in gallery.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {images.map((img) => (
                                        <motion.div
                                            key={img.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group relative rounded-2xl overflow-hidden aspect-square border border-gray-100 bg-gray-50"
                                        >
                                            <img
                                                src={img.url}
                                                alt="Gallery"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => handleDelete(img.id)}
                                                    className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all transform scale-90 group-hover:scale-100"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryManager;
