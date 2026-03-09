import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Profile = () => {
    const [profile, setProfile] = useState({ name: '', email: '', profile_image: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile');
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await api.put('/profile', { name: profile.name, email: profile.email });
            setProfile(res.data);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile');
        }
    };

    const handleDeleteImage = async () => {
        try {
            await api.delete('/profile/image');
            setProfile({ ...profile, profile_image: null });
            setMessage('Profile image deleted');
        } catch (err) {
            setError('Failed to delete image');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUploadImage = async () => {
        if (!selectedFile) return;
        
        setUploading(true);
        setMessage('');
        setError('');
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        try {
            await api.post('/profile/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Refresh profile to get updated image
            const res = await api.get('/profile');
            setProfile(res.data);
            setSelectedFile(null);
            setMessage('Profile image uploaded successfully!');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>
            <div className="bg-white p-8 rounded-lg shadow">
                {message && <p className="text-green-600 mb-4 font-medium">{message}</p>}
                {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
                
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 border-b pb-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {profile.profile_image ? (
                            <img src={`${API_URL}/uploads/${profile.profile_image}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-500 text-sm">No Image</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {selectedFile && (
                            <button
                                onClick={handleUploadImage}
                                disabled={uploading}
                                className="bg-gradient-to-r from-blue-600 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-slate-700 transition-all duration-200 font-medium disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </button>
                        )}
                        {profile.profile_image && (
                            <button 
                                onClick={handleDeleteImage}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium"
                            >
                                Delete Image
                            </button>
                        )}
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Name</label>
                        <input 
                            type="text" 
                            name="name"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={profile.name || ''} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={profile.email || ''} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition mt-2 w-full sm:w-auto self-start px-6">
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
