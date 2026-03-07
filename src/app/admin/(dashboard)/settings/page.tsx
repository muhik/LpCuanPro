'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [pixelId, setPixelId] = useState('');
    const [teraboxLink, setTeraboxLink] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch initial settings
        fetch('/api/admin/settings')
            .then((res) => res.json())
            .then((data) => {
                if (data.pixel_id) setPixelId(data.pixel_id);
                if (data.terabox_link) setTeraboxLink(data.terabox_link);
            })
            .catch((err) => console.error("Failed to load settings", err));
    }, []);

    const handleSavePixel = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pixel_id: pixelId }),
            });

            if (res.ok) {
                setMessage({ text: 'Pixel ID updated successfully.', type: 'success' });
            } else {
                setMessage({ text: 'Failed to update Pixel ID.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'An error occurred.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTerabox = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ terabox_link: teraboxLink }),
            });

            if (res.ok) {
                setMessage({ text: 'Terabox Link updated successfully.', type: 'success' });
            } else {
                setMessage({ text: 'Failed to update Terabox Link.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'An error occurred.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 5) {
            setMessage({ text: 'Password must be at least 5 characters.', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_password: newPassword }),
            });

            if (res.ok) {
                setMessage({ text: 'Password updated successfully.', type: 'success' });
                setNewPassword('');
            } else {
                setMessage({ text: 'Failed to update password.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'An error occurred.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg font-medium text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Pixel Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-premium-600">Facebook Pixel Configuration</h2>
                <form onSubmit={handleSavePixel}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Pixel ID</label>
                        <input
                            type="text"
                            value={pixelId}
                            onChange={(e) => setPixelId(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-premium-500 focus:border-premium-500 outline-none"
                            placeholder="e.g. 1234567890"
                        />
                        <p className="text-xs text-neutral-500 mt-2">Enter your Facebook Pixel ID to track page views and purchases on the landing page.</p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-neutral-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50"
                    >
                        Save Pixel ID
                    </button>
                </form>
            </div>

            {/* Terabox Link Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-emerald-600">Product Download Link (Terabox)</h2>
                <form onSubmit={handleSaveTerabox}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Terabox / Drive URL</label>
                        <input
                            type="url"
                            value={teraboxLink}
                            onChange={(e) => setTeraboxLink(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            placeholder="https://terabox.com/..."
                        />
                        <p className="text-xs text-neutral-500 mt-2">Enter the URL where buyers can download the CuanPro template. This will be shown on the Success page after purchase.</p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-neutral-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50"
                    >
                        Save Download Link
                    </button>
                </form>
            </div>

            {/* Password Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                <h2 className="text-lg font-semibold mb-4 text-red-600">Change Admin Password</h2>
                <form onSubmit={handleSavePassword}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            placeholder="Enter new password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-neutral-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50"
                    >
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
}
