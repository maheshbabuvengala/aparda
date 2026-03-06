import React, { useState } from 'react';
import { uploadImage } from '../lib/cloudinary';
import { ImagePlus, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface ImageUploadProps {
    onUploadSuccess: (url: string) => void;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, className }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setStatus('idle');

        try {
            // NOTE: You MUST create an "Unsigned" upload preset in Cloudinary:
            // Settings -> Upload -> Upload presets -> Add upload preset -> Signing Mode: Unsigned
            // Then copy that name here. I'm using 'aparda_carousel' as a suggested name.
            const result = await uploadImage(file, 'aparda_carousel');
            onUploadSuccess(result.secure_url);
            setStatus('success');
        } catch (error: any) {
            console.error('Upload failed:', error);
            setStatus('error');
            if (error.message?.includes('Upload preset not found')) {
                alert('Cloudinary Error: Upload preset "aparda_carousel" not found. \n\nPlease create an "Unsigned" upload preset named "aparda_carousel" in your Cloudinary Dashboard (Settings > Upload).');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("relative", className)}>
            <label className={cn(
                "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300",
                status === 'idle' && "border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300",
                status === 'success' && "border-green-200 bg-green-50/50",
                status === 'error' && "border-red-200 bg-red-50/50"
            )}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {loading ? (
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    ) : status === 'success' ? (
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    ) : status === 'error' ? (
                        <XCircle className="w-10 h-10 text-red-500" />
                    ) : (
                        <ImagePlus className="w-10 h-10 text-blue-400 group-hover:text-blue-500 transition-colors" />
                    )}

                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        {loading ? 'Uploading...' : status === 'success' ? 'Upload Complete!' : status === 'error' ? 'Preset Missing or Error' : 'Click to upload image'}
                    </p>
                    {status === 'error' && (
                        <p className="text-[10px] text-red-500 mt-1 leading-tight text-center">
                            Ensure "aparda_carousel" unsigned preset exists.
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 italic">PNG, JPG or WebP</p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                />
            </label>
        </div>
    );
};

export default ImageUpload;
