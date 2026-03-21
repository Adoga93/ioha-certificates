"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ClaimPage() {
    const params = useParams();
    const webinarId = params.id as string;

    const [webinarName, setWebinarName] = useState<string | null>(null);
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [generating, setGenerating] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!webinarId) return;

        fetch(`/api/webinars/${webinarId}`)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then(data => {
                setWebinarName(data.webinarName);
                if (data.webinarBannerImage) {
                    setBannerImage(data.webinarBannerImage);
                }
                setLoading(false);
            })
            .catch(err => {
                setError("Webinar not found or link is invalid.");
                setLoading(false);
            });
    }, [webinarId]);

    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch('/api/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    webinarId,
                    firstName,
                    lastName
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to generate certificate");
            }

            // Download the PDF directly
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate_${firstName}_${lastName}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setSuccess(true);
            setFirstName("");
            setLastName("");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ioha-slate text-ioha-navy">
                <p className="opacity-70 font-medium">Loading webinar details...</p>
            </div>
        );
    }

    if (error && !webinarName) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-ioha-slate text-ioha-navy p-6">
                <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
                    <p className="opacity-70">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-ioha-slate text-ioha-navy py-12 px-6 sm:px-12">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Banner Image Area */}
                    {bannerImage ? (
                        <div className="w-full h-48 sm:h-64 relative bg-gray-100 border-b border-gray-100">
                            <img src={bannerImage} alt={webinarName || "Webinar Banner"} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-full h-32 bg-ioha-navy border-b-4 border-ioha-gold flex items-center justify-center flex-col text-white">
                            <h2 className="text-xl font-bold tracking-widest uppercase opacity-80">IOHA Certificate Portal</h2>
                        </div>
                    )}
                    
                    <div className="p-8 sm:p-12">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight leading-tight">{webinarName}</h1>
                            <p className="text-lg opacity-70">Enter your name below exactly as you want it to appear on your official certificate.</p>
                        </div>

                        {error && !loading && webinarName && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-800 p-6 rounded-xl mb-8 text-center border border-green-200">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h3 className="font-bold text-lg mb-1">Certificate Downloaded!</h3>
                                <p className="opacity-80 text-sm">Your certificate has been generated and should automatically download to your device.</p>
                            </div>
                        )}

                        <form onSubmit={handleClaim} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wide opacity-80 pl-1">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full border-2 border-gray-200 rounded-xl p-4 outline-none focus:border-ioha-navy focus:ring-4 focus:ring-ioha-navy/10 transition-all text-lg"
                                        placeholder="Jane"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wide opacity-80 pl-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full border-2 border-gray-200 rounded-xl p-4 outline-none focus:border-ioha-navy focus:ring-4 focus:ring-ioha-navy/10 transition-all text-lg"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={generating || !firstName || !lastName}
                                className="w-full bg-ioha-gold text-white px-8 py-5 rounded-xl text-lg font-black tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg mt-4"
                            >
                                {generating ? "Generating Your Certificate..." : "Claim Certificate"}
                            </button>
                        </form>
                    </div>
                </div>
                
                <p className="text-center mt-8 text-sm font-medium opacity-50">
                    &copy; {new Date().getFullYear()} International Occupational Hygiene Association. All rights reserved.
                </p>
            </div>
        </main>
    );
}
