import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  const webinar = await prisma.webinar.findUnique({
    where: { webinarId: id }
  });

  if (!webinar) {
    return notFound();
  }

  const certificates = await prisma.certificate.findMany({
    where: { webinarId: id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-[#002147] hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-[#002147]">Report: {webinar.webinarName}</h1>
            <p className="text-gray-600 mt-2">Total Downloads: {certificates.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-gray-200">
                <th className="p-4 font-semibold text-[#002147]">Participant Name</th>
                <th className="p-4 font-semibold text-[#002147]">Certificate ID</th>
                <th className="p-4 font-semibold text-[#002147]">Date Claimed</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-500">No certificates downloaded yet.</td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="border-b border-gray-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-gray-900">{cert.name}</td>
                    <td className="p-4 text-gray-600 font-mono text-sm">#{cert.certificateId}</td>
                    <td className="p-4 text-gray-600">{new Date(cert.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
