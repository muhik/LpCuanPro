'use client';

import React, { useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        fbq: any;
    }
}

export default function CheckoutForm() {
    const router = useRouter();
    const [amount, setAmount] = useState('89000');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e?: React.FormEvent, isBypass = false) => {
        if (e) e.preventDefault();
        setLoading(true);

        const payload = new FormData();
        payload.append('amount', amount);
        payload.append('name', name);
        payload.append('email', email);
        payload.append('phone', phone);

        try {
            // Track AddToCart / InitiateCheckout event for Facebook Pixel
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'InitiateCheckout', {
                    currency: 'IDR',
                    value: Number(amount)
                });
            }

            const response = await fetch('/api/checkout', {
                method: 'POST',
                body: payload,
                redirect: 'follow'
            });

            if (response.redirected) {
                router.push(response.url);
            } else if (response.ok) {
                const data = await response.json();
                console.log("Checkout success, redirecting to:", data.url);
                if (data.url) {
                    router.push(data.url);
                }
            } else {
                let errorMessage = "Terjadi kesalahan saat checkout.";
                try {
                    const data = await response.json();
                    if (data.error) errorMessage = data.error;
                } catch (e) {
                    errorMessage = await response.text();
                }
                console.error("Failed to checkout:", errorMessage);
                alert(`Gagal diproses: ${errorMessage}\n\nSilakan coba lagi dengan nominal yang berbeda.`);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Koneksi bermasalah.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Trust / Value Proposition Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 shadow-sm">
                <p className="flex items-start gap-2">
                    <span className="text-xl">💡</span>
                    <span>
                        <strong>Keputusan Tepat!</strong> Hanya dengan investasi <strong>Rp89.000</strong>, Anda sudah mendapatkan akses <strong>Template CuanPro HPP Calculator & Business Analytics</strong> untuk mengelola keuangan bisnis secara lebih profesional.
                    </span>
                </p>
            </div>
            {/* Price Input */}
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Berapa Nominal Terbaikmu?</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-neutral-500">Rp</span>
                    <input
                        type="number"
                        name="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-premium-500 focus:border-premium-500 text-lg outline-none transition-shadow font-normal text-neutral-700"
                        required
                        min="89000"
                    />
                </div>
            </div>

            {/* Buyer Info */}
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-premium-500 focus:border-premium-500 outline-none transition-shadow"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Email <span className="font-normal">(Untuk akses Google Drive)</span> <span className="text-red-500">*</span></label>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-premium-500 focus:border-premium-500 outline-none transition-shadow"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">No. WhatsApp <span className="text-red-500">*</span></label>
                <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-premium-500 focus:border-premium-500 outline-none transition-shadow"
                    required
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-premium-600 hover:bg-premium-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Download className="w-5 h-5" />
                    {loading ? "Memproses..." : "Pesan Sekarang & Dapatkan Akses"}
                </button>
            </div>

            <div className="flex items-center justify-center text-sm text-neutral-500 my-2">
                <span className="w-16 h-px bg-neutral-200"></span>
                <span className="px-3 font-medium">Atau</span>
                <span className="w-16 h-px bg-neutral-200"></span>
            </div>

            <div className="flex flex-col w-full">
                <a
                    href="https://wa.me/6289666639360?text=Halo%20Kak%20Ikbal,%20saya%20agak%20bingung%20isi%20formnya.%20Boleh%20Pesan%20Template%20CuanPro-nya%20secara%20manual%20aja%20(Transfer%20Langsung)?"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                        if (typeof window !== 'undefined' && window.fbq) {
                            window.fbq('track', 'InitiateCheckout', { currency: 'IDR', value: 89000 });
                        }
                    }}
                    className="w-full border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                    Pesan Manual via WhatsApp Admin
                </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 mt-4">
                <ShieldCheck className="w-4 h-4 text-premium-600" />
                <span>Pembayaran Aman &amp; Terverifikasi</span>
            </div>
        </form>
    );
}
