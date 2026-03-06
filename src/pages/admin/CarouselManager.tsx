import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from '../../components/ImageUpload';
import { Trash2, Image as ImageIcon, Loader2, Edit2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselImage {
    id: string;
    url: string;
    title?: string;
    description?: string;
    createdAt: any;
}

const CarouselManager: React.FC = () => {
    const [images, setImages] = useState<CarouselImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'carousel'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const imageList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CarouselImage[];
            setImages(imageList);
            setLoading(false);
        }, (error) => {
            console.error('Firestore onSnapshot error in CarouselManager:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUploadSuccess = async (url: string) => {
        try {
            await addDoc(collection(db, 'carousel'), {
                url,
                title: title.trim(),
                description: description.trim(),
                createdAt: serverTimestamp(),
            });
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error saving image to Firestore:', error);
            alert('Failed to save image metadata to database. Check console for details.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this image from the carousel?')) return;
        try {
            await deleteDoc(doc(db, 'carousel', id));
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const startEdit = (img: CarouselImage) => {
        setEditingId(img.id);
        setEditTitle(img.title || '');
        setEditDescription(img.description || '');
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        setIsUpdating(true);
        try {
            const imageRef = doc(db, 'carousel', editingId);
            await updateDoc(imageRef, {
                title: editTitle.trim(),
                description: editDescription.trim()
            });
            setEditingId(null);
        } catch (error) {
            console.error('Error updating image:', error);
            alert('Failed to update image details.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Carousel Management</h1>
                <p className="text-gray-500 mt-1">Upload and manage images displayed on the landing page carousel.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <ImageIcon className="text-blue-600" size={20} />
                            Add New Image
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Carousel Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Shaping the Future"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. World-class real estate development..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all h-24 resize-none"
                                />
                            </div>
                        </div>

                        <ImageUpload onUploadSuccess={handleUploadSuccess} />
                        <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                Tip: Use high-resolution landscape images (e.g., 1920x1080) for the best visual experience on the landing page.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 min-h-[400px]">
                        <h2 className="text-xl font-bold mb-8">Active Carousel Images</h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                                <p className="text-gray-400 font-medium">Loading images...</p>
                            </div>
                        ) : images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-3xl">
                                <ImageIcon size={48} className="text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium text-center">No images in carousel.<br />Upload your first image to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AnimatePresence>
                                    {images.map((img) => (
                                        <motion.div
                                            key={img.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group relative rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-sm flex flex-col"
                                        >
                                            <div className="aspect-video relative overflow-hidden bg-gray-100">
                                                <img
                                                    src={img.url}
                                                    alt="Carousel"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <button
                                                        onClick={() => startEdit(img)}
                                                        className="p-3 bg-blue-500/90 backdrop-blur-md text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl opacity-0 group-hover:opacity-100"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(img.id)}
                                                        className="p-3 bg-red-500/90 backdrop-blur-md text-white rounded-2xl hover:bg-red-600 transition-all shadow-xl opacity-0 group-hover:opacity-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <h3 className="font-bold text-gray-900 truncate text-sm">
                                                        {img.title || <span className="text-gray-400 italic">No Title</span>}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                    {img.description || <span className="text-gray-400 italic font-normal">No description provided for this slide.</span>}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Edit Modal */}
            <AnimatePresence>
                {editingId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Edit Slide Info</h3>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Title</label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="Slide title"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Description</label>
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all h-32 resize-none"
                                            placeholder="Slide description"
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            disabled={isUpdating}
                                            className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                                        >
                                            {isUpdating ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <Save size={20} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CarouselManager;
