'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
    onUploadComplete?: (imageUrl: string, publicId: string) => void;
    multiple?: boolean;
    maxFiles?: number;
    token?: string; // Add token prop
}

export default function ImageUpload({
    onUploadComplete,
    multiple = false,
    maxFiles = 5,
    token // Accept token prop
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; publicId: string }>>([]);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Validate file count
        if (multiple && files.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        setError('');
        setUploading(true);

        try {
            const formData = new FormData();

            if (multiple) {
                // Multiple files
                for (let i = 0; i < files.length; i++) {
                    formData.append('images', files[i]);
                }
            } else {
                // Single file
                formData.append('image', files[0]);
            }

            // Prioritize token from props, fallback to localStorage
            const authToken = token || localStorage.getItem('authToken');
            const endpoint = multiple ? '/api/upload/multiple' : '/api/upload/single';

            console.log('=== IMAGE UPLOAD DEBUG ===');
            console.log('Token from prop:', token ? 'exists' : 'missing');
            console.log('Token from localStorage:', localStorage.getItem('authToken') ? 'exists' : 'missing');
            console.log('Using token:', authToken ? 'yes (length: ' + authToken?.length + ')' : 'no');
            console.log('Endpoint:', endpoint);

            if (!authToken) {
                throw new Error('No authentication token available. Please log in again.');
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });

            // Check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error('=== UPLOAD FAILED ===');
                console.error('Status:', response.status);
                console.error('Status Text:', response.statusText);
                console.error('Error response:', errorText);
                console.error('===================');
                throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorText}`);
            }

            const data = await response.json();

            if (data.success) {
                if (multiple) {
                    setUploadedImages(data.data);
                    // Show success toast
                    toast.success('Images Uploaded!', {
                        description: `${data.data.length} image(s) uploaded successfully.`,
                        duration: 3000,
                    });
                    // Call callback for each image
                    data.data.forEach((img: any) => {
                        onUploadComplete?.(img.url, img.publicId);
                    });
                } else {
                    setUploadedImages([data.data]);
                    // Show success toast
                    toast.success('Image Uploaded!', {
                        description: 'Your image has been uploaded successfully.',
                        duration: 3000,
                    });
                    onUploadComplete?.(data.data.url, data.data.publicId);
                }
            } else {
                console.error('Upload failed:', data);
                setError(data.message || 'Upload failed');
                toast.error('Upload Failed', {
                    description: data.message || 'Failed to upload image. Please try again.',
                    duration: 4000,
                });
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload image');
            toast.error('Upload Error', {
                description: err.message || 'Failed to upload image. Please try again.',
                duration: 4000,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (publicId: string) => {
        try {
            const authToken = token || localStorage.getItem('authToken');

            // Use query parameter instead of path parameter to avoid routing issues
            const response = await fetch(`/api/upload/delete?publicId=${encodeURIComponent(publicId)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            // Check if response is ok before parsing
            if (!response.ok) {
                console.error('Delete failed with status:', response.status);
                const text = await response.text();
                console.error('Error response:', text);
                throw new Error(`Delete failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setUploadedImages(prev => prev.filter(img => img.publicId !== publicId));
            } else {
                console.error('Delete failed:', data.message);
            }
        } catch (err: any) {
            console.error('Delete error:', err);
            setError(err.message || 'Failed to delete image');
        }
    };

    return (
        <div className="w-full">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#26cf71] transition-colors">
                <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    multiple={multiple}
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                >
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26cf71]"></div>
                            <p className="mt-4 text-gray-600">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2">
                                Click to upload {multiple ? 'images' : 'an image'}
                            </p>
                            <p className="text-sm text-gray-500">
                                PNG, JPG, GIF, WebP {multiple && `(max ${maxFiles} files)`}
                            </p>
                        </>
                    )}
                </label>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {uploadedImages.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={image.url}
                                alt={`Uploaded ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                                onClick={() => handleRemoveImage(image.publicId)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="truncate">{image.publicId}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
