import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let settings = await prisma.signatorySettings.findUnique({ where: { id: 1 } });
        if (!settings) {
            settings = await prisma.signatorySettings.create({
                data: {
                    signatoryName: "M. Olota",
                    signatoryTitle: "IOHA President",
                    signatory2Name: "Chairman",
                    signatory2Title: "Chairman Education Affairs IOHA",
                    certificateType: "Of Attendance At",
                    presentedBy: "IOHA Training Committee",
                    presentationDate: new Date().toISOString().split('T')[0]
                }
            });
        }
        return NextResponse.json(settings);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const settings = await prisma.signatorySettings.upsert({
            where: { id: 1 },
            update: {
                signatoryName: body.signatoryName,
                signatoryTitle: body.signatoryTitle,
                signatureImage: body.signatureImage,
                signatory2Name: body.signatory2Name,
                signatory2Title: body.signatory2Title,
                signature2Image: body.signature2Image,
                certificateType: body.certificateType,
                presentedBy: body.presentedBy,
                presentationDate: body.presentationDate,
                templateId: body.templateId,
            },
            create: {
                id: 1,
                signatoryName: body.signatoryName || "M. Olota",
                signatoryTitle: body.signatoryTitle || "IOHA President",
                signatureImage: body.signatureImage,
                signatory2Name: body.signatory2Name || "Chairman",
                signatory2Title: body.signatory2Title || "Chairman Education Affairs IOHA",
                signature2Image: body.signature2Image,
                certificateType: body.certificateType || "Of Attendance At",
                presentedBy: body.presentedBy || "IOHA Training Committee",
                presentationDate: body.presentationDate || new Date().toISOString().split('T')[0],
                templateId: body.templateId || "template1",
            }
        });
        return NextResponse.json(settings);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
