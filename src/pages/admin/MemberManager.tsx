import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from '../../components/ImageUpload';
import { Trash2, UserPlus, Loader2, Edit2, Save, X } from 'lucide-react';

interface Member {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    order: number;
}

const MemberManager: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [order, setOrder] = useState(0);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'members'), orderBy('order', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const memberList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Member[];
            setMembers(memberList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const resetForm = () => {
        setName('');
        setRole('');
        setImageUrl('');
        setOrder(members.length + 1);
        setEditingMember(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) {
            alert('Please upload a member photo first.');
            return;
        }

        try {
            if (editingMember) {
                await updateDoc(doc(db, 'members', editingMember.id), {
                    name,
                    role,
                    imageUrl,
                    order: Number(order)
                });
            } else {
                await addDoc(collection(db, 'members'), {
                    name,
                    role,
                    imageUrl,
                    order: Number(order) || members.length + 1,
                    createdAt: serverTimestamp()
                });
            }
            resetForm();
        } catch (error) {
            console.error('Error saving member:', error);
            alert('Failed to save member.');
        }
    };

    const handleEdit = (member: Member) => {
        setEditingMember(member);
        setName(member.name);
        setRole(member.role);
        setImageUrl(member.imageUrl);
        setOrder(member.order);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this member?')) return;
        try {
            await deleteDoc(doc(db, 'members', id));
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Member Management</h1>
                <p className="text-gray-500 mt-1">Manage team members and their display order.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <form onSubmit={handleSave} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 sticky top-8 space-y-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            {editingMember ? <Edit2 className="text-blue-600" size={20} /> : <UserPlus className="text-blue-600" size={20} />}
                            {editingMember ? 'Edit Member' : 'Add New Member'}
                        </h2>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Photo</label>
                            {imageUrl ? (
                                <div className="relative rounded-2xl overflow-hidden aspect-square mb-2 group">
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl('')}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            ) : (
                                <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Position / Role</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Display Order (Sequence)</label>
                            <input
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {editingMember ? 'Update' : 'Add Member'}
                            </button>
                            {editingMember && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 min-h-[400px]">
                        <h2 className="text-xl font-bold mb-8">Executive Members (Ordered)</h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                                <p className="text-gray-400 font-medium">Loading members...</p>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                No members added yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-100">
                                            <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{member.name}</h4>
                                            <p className="text-xs text-gray-500">{member.role}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                                Order: {member.order}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(member)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberManager;
