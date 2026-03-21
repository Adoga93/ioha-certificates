import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function VerifyPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    
    // Fetch certificate from DB
    const certificate = await prisma.certificate.findUnique({
        where: {
            certificateId: params.id,
        },
    });

    if (!certificate) {
        notFound();
    }

    let webinar = null;
    if (certificate.webinarId) {
        webinar = await prisma.webinar.findUnique({
            where: { webinarId: certificate.webinarId }
        });
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-ioha-slate text-ioha-navy">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-2xl w-full border-t-8 border-ioha-gold text-center space-y-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Verified Credential</h1>
                    <p className="opacity-70">This certificate is valid and officially recognized by IOHA.</p>
                </div>

                <div className="bg-ioha-slate p-6 rounded-2xl text-left border border-gray-100 space-y-4">
                    <div>
                        <p className="text-sm font-semibold opacity-50 uppercase tracking-wider">Recipient Name</p>
                        <p className="text-xl font-bold">{certificate.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold opacity-50 uppercase tracking-wider">Course / Certification</p>
                            <p className="font-medium">{certificate.courseName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold opacity-50 uppercase tracking-wider">Issue Date</p>
                            <p className="font-medium">{certificate.issueDate.toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold opacity-50 uppercase tracking-wider">Credential ID</p>
                        <p className="font-mono bg-white px-3 py-1.5 rounded-lg border border-gray-200 mt-1 inline-block text-sm">
                            {certificate.certificateId}
                        </p>
                    </div>

                    {webinar && (
                        <div className="pt-4 border-t border-gray-200 mt-4 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <p className="text-sm font-semibold opacity-50 uppercase tracking-wider">Webinar / Event Focus</p>
                                <p className="font-medium text-lg text-ioha-navy">{webinar.webinarName}</p>
                            </div>
                            {webinar.presentationDate && (
                                <div className="col-span-2">
                                    <p className="text-sm font-semibold opacity-50 uppercase tracking-wider">Held On</p>
                                    <p className="font-medium">{new Date(webinar.presentationDate).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs opacity-50">
                        Powered by International Occupational Hygiene Association
                    </p>
                </div>
            </div>
        </main>
    );
}
