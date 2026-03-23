"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function AdminSettings() {
    const [webinars, setWebinars] = useState<any[]>([]);
    
    // Webinar Form State
    const [webinarName, setWebinarName] = useState("");
    const [webinarBanner, setWebinarBanner] = useState<string | null>(null);
    const [name, setName] = useState("M. Olota");
    const [title, setTitle] = useState("IOHA President");
    const [type, setType] = useState("Of Attendance At");
    const [signature, setSignature] = useState<string | null>(null);
    const [name2, setName2] = useState("Chairman");
    const [title2, setTitle2] = useState("Chairman Education Affairs IOHA");
    const [signature2, setSignature2] = useState<string | null>(null);
    const [presentedBy, setPresentedBy] = useState("IOHA Training Committee");
    const [presentationDate, setPresentationDate] = useState("");
    const [templateId, setTemplateId] = useState("template1");
    const [contactHours, setContactHours] = useState("60 Minutes");

    const [loading, setLoading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [saved, setSaved] = useState(false);
    
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInput2Ref = useRef<HTMLInputElement>(null);

    const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});

    const fetchWebinars = () => {
        fetch('/api/webinars')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setWebinars(data);
                    // generate QRs
                    data.forEach(w => {
                        const claimUrl = `${window.location.origin}/claim/${w.webinarId}`;
                        QRCode.toDataURL(claimUrl, { width: 200 })
                            .then(url => setQrCodeUrls(prev => ({ ...prev, [w.webinarId]: url })))
                            .catch(console.error);
                    });
                }
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchWebinars();
        
        // Also fetch default settings just to pre-fill if they want
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setName(data.signatoryName || "M. Olota");
                    setTitle(data.signatoryTitle || "IOHA President");
                    setType(data.certificateType || "Of Attendance At");
                    setSignature(data.signatureImage || null);
                    setName2(data.signatory2Name || "Chairman");
                    setTitle2(data.signatory2Title || "Chairman Education Affairs IOHA");
                    setSignature2(data.signature2Image || null);
                    setPresentedBy(data.presentedBy || "IOHA Training Committee");
                    setPresentationDate(data.presentationDate || "");
                    setTemplateId(data.templateId || "template1");
                    setContactHours(data.contactHours || "60 Minutes");
                }
            })
            .catch(console.error);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);
        try {
            const res = await fetch('/api/webinars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    webinarName,
                    webinarBannerImage: webinarBanner,
                    signatoryName: name,
                    signatoryTitle: title,
                    certificateType: type,
                    signatureImage: signature,
                    signatory2Name: name2,
                    signatory2Title: title2,
                    signature2Image: signature2,
                    presentedBy,
                    presentationDate,
                    templateId,
                    contactHours,
                })
            });
            if (!res.ok) throw new Error("Failed to create webinar");
            setSaved(true);
            setWebinarName("");
            setWebinarBanner(null);
            fetchWebinars();
            setTimeout(() => setSaved(false), 3000);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            alert("Error creating webinar");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will permanently delete this webinar and ALL verification data associated with it!")) return;
        try {
            const res = await fetch(`/api/webinars/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            fetchWebinars();
        } catch (err) {
            console.error(err);
            alert("Error deleting webinar");
        }
    };

    const handlePreview = async () => {
        setPreviewing(true);
        try {
            const res = await fetch('/api/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    webinarName: webinarName || "Sample Webinar",
                    signatoryName: name,
                    signatoryTitle: title,
                    certificateType: type,
                    signatureImage: signature,
                    signatory2Name: name2,
                    signatory2Title: title2,
                    signature2Image: signature2,
                    presentedBy,
                    presentationDate,
                    templateId,
                    contactHours,
                })
            });
            if (!res.ok) throw new Error("Failed to generate preview");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error(err);
            alert("Error generating preview");
        } finally {
            setPreviewing(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'banner' | 'sig1' | 'sig2') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (field === 'banner') setWebinarBanner(result);
            if (field === 'sig1') setSignature(result);
            if (field === 'sig2') setSignature2(result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <main className="min-h-screen p-12 bg-ioha-slate text-ioha-navy">
            <div className="max-w-5xl mx-auto space-y-12">
                
                {/* Active Webinars Section */}
                <section>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Self-Serve Webinars</h1>
                        <p className="opacity-70 mb-6">Manage your generated webinar links. Share the link or QR code with attendees.</p>
                    </div>
                    
                    {webinars.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="opacity-70">No webinars created yet. Create one below!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {webinars.map(w => (
                                <div key={w.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">{w.webinarName}</h3>
                                        <p className="text-sm opacity-70 mb-4">Created: {new Date(w.createdAt).toLocaleDateString()}</p>
                                        <div className="bg-ioha-slate/50 p-3 rounded-lg break-all text-sm font-mono border border-gray-200 mb-4">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/claim/${w.webinarId}` : `/claim/${w.webinarId}`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {qrCodeUrls[w.webinarId] && (
                                            <div className="flex flex-col gap-1 items-center">
                                                <img src={qrCodeUrls[w.webinarId]} alt="QR Code" className="w-24 h-24 rounded shadow-sm border border-gray-100" />
                                                <a href={qrCodeUrls[w.webinarId]} download={`QR-${w.webinarId}.png`} className="text-[10px] text-blue-500 hover:text-blue-700 underline uppercase tracking-wider font-bold text-center leading-tight">
                                                    Download<br/>QR Code
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2 w-full">
                                            <button 
                                                onClick={() => {
                                                    const url = `${window.location.origin}/claim/${w.webinarId}`;
                                                    if (navigator.clipboard && window.isSecureContext) {
                                                        navigator.clipboard.writeText(url).then(() => alert('Copied!'));
                                                    } else {
                                                        // Fallback for non-HTTPS dev environments
                                                        prompt('Copy this link:', url);
                                                    }
                                                }}
                                                className="bg-gray-100 hover:bg-gray-200 text-ioha-navy px-4 py-2 rounded font-medium text-sm transition-colors text-center"
                                            >
                                                Copy Link
                                            </button>
                                            <a 
                                                href={`/admin/report/${w.webinarId}`}
                                                className="bg-ioha-gold text-white hover:bg-yellow-600 px-4 py-2 rounded font-bold text-sm transition-colors text-center shadow-sm mt-1"
                                            >
                                                View Report
                                            </a>
                                            <button 
                                                onClick={() => handleDelete(w.webinarId)}
                                                className="text-xs text-red-500 hover:text-red-700 underline font-medium text-center mt-1 transition-colors"
                                            >
                                                Delete Test Webinar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Create New Webinar Section */}
                <section>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Create a New Webinar</h2>
                        <p className="opacity-70 mb-6">Configure a new certificate template and generate a unique claim link.</p>
                    </div>

                    <form onSubmit={handleCreate} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                        
                        {/* Webinar Details */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold border-b pb-2">1. Webinar Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold opacity-80 uppercase tracking-wide">Webinar Name (Course Name)</label>
                                    <input
                                        type="text"
                                        value={webinarName}
                                        onChange={(e) => setWebinarName(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-ioha-navy/20"
                                        placeholder="e.g. Masterclass 2026: Advanced Hygiene"
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold opacity-80 uppercase tracking-wide">Banner Image (Shown on Claim Page)</label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => bannerInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={bannerInputRef}
                                            className="hidden"
                                            accept=".png,.jpg,.jpeg"
                                            onChange={(e) => handleFileUpload(e, 'banner')}
                                        />
                                        {webinarBanner ? (
                                            <img src={webinarBanner} alt="Banner Preview" className="max-h-32 mx-auto object-cover rounded shadow-sm" />
                                        ) : (
                                            <p className="font-medium text-ioha-navy/70">Click to upload a banner image for the participant claim page...</p>
                                        )}
                                    </div>
                                    {webinarBanner && (
                                        <div className="text-right">
                                            <button type="button" onClick={() => setWebinarBanner(null)} className="text-sm text-red-500 hover:text-red-700">Remove Banner</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Certificate Template Details */}
                        <div className="space-y-6 pt-4">
                            <h3 className="text-xl font-bold border-b pb-2">2. Certificate Template Overrides</h3>
                            <p className="text-sm opacity-70">These default to your global settings but can be customized for this specific webinar.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold opacity-80 uppercase tracking-wide">Certificate Template Style</label>
                                    <select
                                        value={templateId}
                                        onChange={(e) => setTemplateId(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-ioha-navy/20 bg-white"
                                    >
                                        <option value="template1">Template 1 - Classic (Navy & Gold Border)</option>
                                        <option value="template2">Template 2 - Elegant (Fleur-de-lis Background)</option>
                                        <option value="template3">Template 3 - Leafy Minimal Border</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold opacity-80 uppercase tracking-wide">Education Contact Hours</label>
                                    <select
                                        value={contactHours}
                                        onChange={(e) => setContactHours(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-ioha-navy/20 bg-white"
                                    >
                                        <option value="60 Minutes">60 Minutes</option>
                                        <option value="90 Minutes">90 Minutes</option>
                                        <option value="120 Minutes">120 Minutes</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold opacity-80 uppercase tracking-wide">Certificate Type</label>
                                    <input
                                        type="text"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-ioha-navy/20"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold opacity-80 uppercase tracking-wide">Presented By</label>
                                    <input
                                        type="text"
                                        value={presentedBy}
                                        onChange={(e) => setPresentedBy(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-ioha-navy/20"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold opacity-80 uppercase tracking-wide">Presentation Date</label>
                                    <input
                                        type="date"
                                        value={presentationDate}
                                        onChange={(e) => setPresentationDate(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-ioha-navy/20"
                                        required
                                    />
                                </div>

                                {/* Primary Signatory */}
                                <div className="space-y-4 col-span-1 md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-100 mt-4">
                                    <h4 className="font-bold tracking-tight uppercase opacity-80">Primary Signatory</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold opacity-80">Name</label>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold opacity-80">Title</label>
                                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3" required />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-semibold opacity-80">Signature Image</label>
                                            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer bg-white" onClick={() => fileInputRef.current?.click()}>
                                                <input type="file" ref={fileInputRef} className="hidden" accept=".png,.jpg,.jpeg" onChange={(e) => handleFileUpload(e, 'sig1')} />
                                                {signature ? <img src={signature} alt="Sig" className="max-h-16 mx-auto mix-blend-multiply" /> : <span className="opacity-50">Upload Signature</span>}
                                            </div>
                                            {signature && <button type="button" onClick={() => setSignature(null)} className="text-xs text-red-500 mt-1">Remove</button>}
                                        </div>
                                    </div>
                                </div>

                                {/* Secondary Signatory */}
                                <div className="space-y-4 col-span-1 md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <h4 className="font-bold tracking-tight uppercase opacity-80">Secondary Signatory</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold opacity-80">Name</label>
                                            <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold opacity-80">Title</label>
                                            <input type="text" value={title2} onChange={(e) => setTitle2(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3" required />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-semibold opacity-80">Signature Image</label>
                                            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer bg-white" onClick={() => fileInput2Ref.current?.click()}>
                                                <input type="file" ref={fileInput2Ref} className="hidden" accept=".png,.jpg,.jpeg" onChange={(e) => handleFileUpload(e, 'sig2')} />
                                                {signature2 ? <img src={signature2} alt="Sig2" className="max-h-16 mx-auto mix-blend-multiply" /> : <span className="opacity-50">Upload Signature</span>}
                                            </div>
                                            {signature2 && <button type="button" onClick={() => setSignature2(null)} className="text-xs text-red-500 mt-1">Remove</button>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 border-t border-gray-100">
                            {saved && <span className="text-green-600 font-medium text-sm">✓ Created Successfully</span>}
                            
                            <button
                                type="button"
                                onClick={handlePreview}
                                disabled={previewing}
                                className="w-full sm:w-auto bg-white border-2 border-ioha-navy text-ioha-navy px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                {previewing ? "Generating PDF..." : "Preview Certificate"}
                            </button>
                            
                            <button
                                type="submit"
                                disabled={loading || !webinarName}
                                className="w-full sm:w-auto bg-ioha-gold text-white px-8 py-3 rounded-lg font-bold shadow hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Publish & Generate Link"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
