import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-24 px-6 bg-ioha-slate text-ioha-navy gap-12 font-sans">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          IOHA<span className="text-ioha-gold drop-shadow-sm">Certificates</span>
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Premium certificate generation utilizing the Golden Ratio for typography and layout.
          Now entirely self-serve for seamless distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Admin Portal Card */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-ioha-navy/5 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Portal</h2>
            <p className="text-sm opacity-70 mb-8">
              Create new Webinar styles, override signatory configurations, and generate claim links and QR codes to distribute to your attendees.
            </p>
          </div>
          <Link
            href="/admin"
            className="w-full inline-block text-center bg-ioha-navy text-white border border-ioha-navy/20 px-6 py-3.5 rounded-xl font-semibold hover:bg-ioha-navy/90 hover:shadow-lg transition-all"
          >
            Go to Admin Dashboard
          </Link>
        </div>

        {/* Participant Example Flow Card */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-ioha-gold/20 border-t-4 border-t-ioha-gold flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Participant Flow
              <span className="bg-ioha-gold/20 text-ioha-navy text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
            </h2>
            <p className="text-sm opacity-70 mb-6">
              Distribute unique claim links (<code className="bg-gray-100 px-1 py-0.5 rounded text-ioha-navy">/claim/[id]</code>) directly to participants. They type their name, and the PDF is generated instantly without any CSV uploads.
            </p>
          </div>

          <div className="space-y-4">
             <p className="text-center text-sm font-semibold opacity-70 mb-2">Create a Webinar in the Admin portal to get a claim link!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
