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

      <div className="flex flex-col items-center w-full max-w-lg mt-4">
        {/* Admin Portal Card */}
        <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-ioha-navy/5 flex flex-col justify-between w-full text-center">
          <div>
            <h2 className="text-3xl font-bold mb-3 text-ioha-navy">Admin Portal</h2>
            <p className="text-base opacity-75 mb-10 leading-relaxed">
              Create new Webinar styles, override signatory configurations, and generate claim links and QR codes to distribute to your attendees.
            </p>
          </div>
          <Link
            href="/admin"
            className="w-full inline-block text-center bg-ioha-navy text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-ioha-navy/90 hover:shadow-xl transition-all duration-300"
          >
            Access Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
