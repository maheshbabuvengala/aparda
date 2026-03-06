import { buildUrl } from 'cloudinary-build-url';

const CLOUD_NAME = 'dqpe66o3e';
const API_KEY = '498543593223193';

// NOTE: api_secret is NOT included here for client-side security.
// For signed uploads, you should use a server-side function.
// For unsigned uploads from the frontend, you must create an "Upload Preset" 
// in your Cloudinary Dashboard Settings under "Upload".

export const uploadImage = async (file: File, uploadPreset: string = 'ml_default') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('api_key', API_KEY);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

export const getOptimizedUrl = (publicId: string, options: any = {}) => {
    return buildUrl(publicId, {
        cloud: {
            cloudName: CLOUD_NAME,
        },
        transformations: {
            quality: 'auto',
            fetchFormat: 'auto',
            ...options,
        },
    });
};
