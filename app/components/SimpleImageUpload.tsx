'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleImageUploadProps {
    label: string;
    currentImage?: string;
    onUploadComplete: (url: string) => void;
    token: string;
    required?: boolean;
    helpText?: string;
}

export default function SimpleImageUpload({
    label,
    currentImage,
    onUploadComplete,
    token,
    required = false,
    helpText
}: SimpleImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(currentImage || '');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            console.log(`📤 Uploading ${label}...`);

            const response = await fetch('/api/upload/single', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            if (!response.ok) {
                console.error(`❌ ${label} upload failed:`, data);
                throw new Error(data.message || `Upload failed with status: ${response.status}`);
            }

            if (data.success && data.data?.url) {
                console.log(`✅ ${label} uploaded:`, data.data.url);
                setImageUrl(data.data.url);
                onUploadComplete(data.data.url);
                toast.success(`${label} uploaded successfully!`);
            } else {
                throw new Error(data.message || `Failed to upload ${label}`);
            }
        } catch (error: any) {
            console.error(`❌ ${label} upload error:`, error);
            toast.error(error.message || `Failed to upload ${label}`);
        } finally {
            setUploading(false);
            // Reset input to allow re-uploading the same file
            e.target.value = '';
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-2" />
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {imageUrl && (
                <div className="mb-3">
                    <img
                        src={imageUrl}
                        alt={`${label} preview`}
                        className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-green-500"
                    />
                </div>
            )}

            <label className="block">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                />
                <div className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${imageUrl ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg cursor-pointer hover:border-[#FF6B35] hover:bg-[#FFF5F0] transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {uploading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF6B35]"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-5 h-5 text-[#FF6B35]" />
                            <span className="text-sm font-medium text-gray-700">
                                {imageUrl ? 'Change Image' : 'Upload Image'}
                            </span>
                        </>
                    )}
                </div>
            </label>

            {helpText && (
                <p className="text-xs text-gray-500 mt-2">{helpText}</p>
            )}

            {!imageUrl && required && (
                <p className="text-xs text-red-500 mt-2">⚠️ {label} is required</p>
            )}
        </div>
    );
}
