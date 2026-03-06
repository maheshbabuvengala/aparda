import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from '../../components/ImageUpload';
import { Trash2, UserPlus, Loader2, Edit2, Save, X, Globe, Phone, Building, Calendar, Mail, MapPin, User, Download, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';
import * as XLSX from 'xlsx';
import FeedbackModal from '../../components/FeedbackModal';
import { generateCertificate } from '../../utils/certificateUtils';

interface Partner {
    id: string;
    name: string;
    companyName: string;
    mobile: string;
    website: string;
    logoUrl: string;
    registrationDate: string;
    gender: string;
    address: string;
    email?: string;
    designation?: string;
    district?: string;
    membershipId?: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    isRegistered?: boolean;
    paymentStatus?: 'pending' | 'success' | 'failed';
    paymentOrderId?: string;
    amount?: number;
    createdAt: any;
    approvedAt?: any;
}

const UserManager: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'registered' | 'approvals' | 'leads'>('registered');
    const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    // Form States
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
        designation: '',
        district: ''
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Partner[];
            setPartners(list);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const resetForm = () => {
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
            designation: '',
            district: ''
        });
        setEditingId(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.logoUrl) {
            setFeedback({
                isOpen: true,
                type: 'warning',
                title: 'Logo Required',
                message: 'Please upload a company logo for the partner.'
            });
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                await updateDoc(doc(db, 'partners', editingId), {
                    ...formData,
                    isRegistered: true,
                    updatedAt: serverTimestamp()
                });
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Partner Updated',
                    message: 'Partner details have been successfully modified.'
                });
            } else {
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

                    const membershipId = `${ddmmyyyy}${sequence.toString().padStart(4, '0')}`;

                    transaction.set(counterRef, { membershipSequence: sequence }, { merge: true });

                    const partnersRef = collection(db, 'partners');
                    const newPartnerRef = doc(partnersRef);

                    transaction.set(newPartnerRef, {
                        ...formData,
                        isRegistered: true,
                        approvalStatus: 'approved',
                        membershipId: membershipId,
                        createdAt: serverTimestamp(),
                        approvedAt: serverTimestamp()
                    });
                });

                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Partner Added',
                    message: 'New partner has been added with a membership ID.'
                });
            }
            resetForm();
        } catch (error) {
            console.error('Error saving partner:', error);
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Save Failed',
                message: 'Could not save partner details. Please check your connection.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleApprove = async (partner: Partner) => {
        if (!window.confirm(`Approve membership for ${partner.companyName}?`)) return;

        setLoading(true);
        try {
            await runTransaction(db, async (transaction) => {
                const partnerRef = doc(db, 'partners', partner.id);
                // We don't need to re-fetch partner as we already have it, but for safety in transaction:
                const partnerSnap = await transaction.get(partnerRef);
                const currentData = partnerSnap.data();

                let finalMembershipId = partner.membershipId;

                // Only generate if missing
                if (!finalMembershipId) {
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

                    finalMembershipId = `${ddmmyyyy}${sequence.toString().padStart(4, '0')}`;
                    transaction.set(counterRef, { membershipSequence: sequence }, { merge: true });
                }

                transaction.update(partnerRef, {
                    approvalStatus: 'approved',
                    isRegistered: true,
                    membershipId: finalMembershipId,
                    approvedAt: serverTimestamp()
                });
            });

            setFeedback({
                isOpen: true,
                type: 'success',
                title: 'Member Approved',
                message: 'Membership has been approved and ID has been generated.'
            });
        } catch (error) {
            console.error('Error approving member:', error);
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Approval Failed',
                message: 'Failed to approve member. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async (partner: Partner) => {
        setFeedback({
            isOpen: true,
            type: 'success',
            title: 'Generating Certificate',
            message: 'Please wait while we prepare your certificate for download...'
        });

        try {
            await generateCertificate({
                name: partner.name,
                companyName: partner.companyName,
                designation: partner.designation || '',
                district: partner.district || '',
                membershipId: partner.membershipId || 'AP-ARDA-MEMBER',
                date: partner.approvedAt?.toDate() ? new Date(partner.approvedAt.toDate()).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            });

            setTimeout(() => {
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Download Successful',
                    message: 'The certificate has been generated and downloaded.'
                });
            }, 1000);
        } catch (error) {
            console.error('Error generating certificate:', error);
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Download Failed',
                message: 'Failed to generate certificate. Please try again.'
            });
        }
    };

    const handleEdit = (partner: Partner) => {
        setEditingId(partner.id);
        setFormData({
            ...partner as any,
            password: ''
        });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this partner record permanently?')) return;
        try {
            await deleteDoc(doc(db, 'partners', id));
            setFeedback({
                isOpen: true,
                type: 'success',
                title: 'Record Deleted',
                message: 'The partner record has been removed from the database.'
            });
        } catch (error) {
            console.error('Error deleting partner:', error);
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to delete partner record.'
            });
        }
    };

    const exportLeadsToExcel = () => {
        const leads = partners.filter(p => !p.isRegistered);
        if (leads.length === 0) {
            setFeedback({
                isOpen: true,
                type: 'warning',
                title: 'No Leads',
                message: 'There are no lead records available to export at this time.'
            });
            return;
        }

        const data = leads.map(lead => ({
            'Name': lead.name,
            'Mobile': lead.mobile,
            'Date Captured': lead.createdAt?.toDate() ? new Date(lead.createdAt.toDate()).toLocaleString() : 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
        XLSX.writeFile(workbook, `APARDA_Leads_${new Date().toISOString().split('T')[0]}.xlsx`);

        setFeedback({
            isOpen: true,
            type: 'success',
            title: 'Export Success',
            message: 'Leads have been successfully exported to an Excel file.'
        });
    };

    const verifyPayment = async (partner: Partner) => {
        if (!partner.paymentOrderId) {
            setFeedback({
                isOpen: true,
                type: 'warning',
                title: 'No Order ID',
                message: 'This user does not have an associated payment order ID.'
            });
            return;
        }

        if (window.confirm(`Mark payment ${partner.paymentOrderId} as SUCCESSFUL manually?`)) {
            try {
                await updateDoc(doc(db, 'partners', partner.id), {
                    paymentStatus: 'success',
                    updatedAt: serverTimestamp()
                });
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Payment Verified',
                    message: 'Member payment status has been manually updated to Success.'
                });
            } catch (error) {
                console.error('Error verifying payment:', error);
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Update Failed',
                    message: 'Could not update payment status. Please try again.'
                });
            }
        }
    };

    const approvedPartners = partners.filter(p => p.approvalStatus === 'approved' || (p.isRegistered && !p.approvalStatus));
    const pendingApprovals = partners.filter(p => p.approvalStatus === 'pending');
    const leads = partners.filter(p => !p.isRegistered && !p.approvalStatus);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Manager</h1>
                    <p className="text-gray-500 font-medium">Manage members, leads and system settings.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={exportLeadsToExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-green-900/10"
                    >
                        <Download size={20} />
                        Export Leads
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-900/5 border border-gray-100 sticky top-8">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                                {editingId ? <Edit2 size={24} /> : <UserPlus size={24} />}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                {editingId ? 'Edit Partner' : 'Add New Partner'}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-blue-900 uppercase tracking-widest block px-1">Identity & Branding</label>
                                <ImageUpload onUploadSuccess={(url) => setFormData({ ...formData, logoUrl: url })} />
                                {formData.logoUrl && (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200">
                                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, logoUrl: '' })}
                                            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                )}
                                <div className="grid gap-4">
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Company Name"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Partner Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Designation"
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="District / Region"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-blue-900 uppercase tracking-widest block px-1">Contact & Official</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            placeholder="Mobile"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none"
                                            required
                                        />
                                    </div>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none appearance-none"
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="url"
                                            placeholder="Website URL"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            value={formData.registrationDate}
                                            onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-gray-400"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <Save size={20} />
                                        {editingId ? 'Update Partner' : 'Save Partner'}
                                    </>
                                )}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full bg-gray-100 text-gray-600 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    <X size={20} />
                                    Cancel Edit
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tabs */}
                    <div className="bg-white p-2 rounded-3xl border border-gray-100 inline-flex shadow-sm">
                        <button
                            onClick={() => setActiveTab('registered')}
                            className={cn(
                                "px-8 py-3 rounded-2xl text-sm font-black transition-all",
                                activeTab === 'registered' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/10" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Registered ({approvedPartners.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('approvals')}
                            className={cn(
                                "px-8 py-3 rounded-2xl text-sm font-black transition-all",
                                activeTab === 'approvals' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/10" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Approvals ({pendingApprovals.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('leads')}
                            className={cn(
                                "px-8 py-3 rounded-2xl text-sm font-black transition-all",
                                activeTab === 'leads' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/10" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Leads ({leads.length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {(activeTab === 'registered' ? approvedPartners : activeTab === 'approvals' ? pendingApprovals : leads).map((partner) => (
                                <div key={partner.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-gray-100 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-6">
                                            <div className="w-20 h-20 rounded-3xl bg-gray-50 p-3 border border-gray-100 group-hover:scale-110 transition-transform flex items-center justify-center">
                                                {partner.logoUrl ? (
                                                    <img src={partner.logoUrl} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <Building className="w-8 h-8 text-gray-300" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">
                                                    {partner.companyName || partner.name}
                                                </h3>
                                                {partner.companyName && <p className="text-gray-500 font-bold text-sm mb-3">{partner.name}</p>}
                                                <div className="flex flex-wrap gap-3">
                                                    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                        <Phone size={10} /> {partner.mobile}
                                                    </span>
                                                    {partner.website ? (
                                                        <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                            <Globe size={10} /> {(() => {
                                                                try {
                                                                    return new URL(partner.website).hostname;
                                                                } catch {
                                                                    return partner.website;
                                                                }
                                                            })()}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-300 italic">
                                                            <Globe size={10} /> No Website
                                                        </span>
                                                    )}
                                                    {partner.membershipId && (
                                                        <span className="flex items-center gap-1.5 bg-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600">
                                                            ID: {partner.membershipId}
                                                        </span>
                                                    )}
                                                    {partner.approvalStatus === 'pending' && (
                                                        <span className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-yellow-600">
                                                            Pending Approval
                                                        </span>
                                                    )}
                                                    {partner.paymentStatus && (
                                                        <span className={cn(
                                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                            partner.paymentStatus === 'success' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                                        )}>
                                                            <ShieldCheck size={10} /> {partner.paymentStatus}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {activeTab === 'approvals' && (
                                                <button
                                                    onClick={() => handleApprove(partner)}
                                                    className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center gap-2"
                                                    title="Approve Member"
                                                >
                                                    <ShieldCheck size={18} />
                                                    <span className="text-xs font-black">Approve</span>
                                                </button>
                                            )}
                                            {partner.paymentStatus === 'pending' && (
                                                <button
                                                    onClick={() => verifyPayment(partner)}
                                                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center gap-2"
                                                    title="Verify Payment"
                                                >
                                                    <ShieldCheck size={18} />
                                                    <span className="text-xs font-black">Verify</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(partner)}
                                                className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(partner.id)}
                                                className="p-3 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    {partner.membershipId && (
                                        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={() => handleDownloadCertificate(partner)}
                                                className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-2 rounded-xl text-sm font-black transition-all shadow-sm"
                                            >
                                                <Download size={16} />
                                                Download Certificate
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(activeTab === 'registered' ? approvedPartners : activeTab === 'approvals' ? pendingApprovals : leads).length === 0 && (
                                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                                    <p className="text-gray-400 font-black tracking-tight uppercase text-sm">No records found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <FeedbackModal
                isOpen={feedback.isOpen}
                onClose={() => setFeedback({ ...feedback, isOpen: false })}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
            />
        </div >
    );
};

export default UserManager;
