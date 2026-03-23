import { NextResponse } from 'next/server';
import { generateCertificatePdf } from '@/lib/pdf';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';
import JSZip from 'jszip';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileContent = await file.text();

        // Parse CSV
        const { data: rows, errors } = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => {
                const lower = header.trim().toLowerCase();
                if (lower === 'name') return 'name';
                if (lower === 'coursename') return 'courseName';
                if (lower === 'issuedate') return 'issueDate';
                return header.trim();
            },
        });

        if (errors.length > 0) {
            console.warn("CSV parsing warnings:", errors);
        }

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'CSV is empty or invalid' }, { status: 400 });
        }

        let settings = await prisma.signatorySettings.findUnique({ where: { id: 1 } });
        if (!settings) {
            settings = {
                id: 1,
                signatoryName: "M. Olota",
                signatoryTitle: "IOHA President",
                signatureImage: null,
                signatory2Name: "Chairman",
                signatory2Title: "Chairman Education Affairs IOHA",
                signature2Image: null,
                certificateType: "Of Attendance At",
                presentedBy: "IOHA Training Committee",
                presentationDate: new Date().toISOString().split('T')[0],
                templateId: "template1",
                contactHours: "60 Minutes",
                updatedAt: new Date()
            };
        }

        const zip = new JSZip();

        // Process each row
        const certificatesToCreate = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as any;
            const name = row.name?.trim();
            const courseName = row.courseName?.trim() || "Certified Premium Professional";
            const issueDate = row.issueDate?.trim() || new Date().toISOString().split('T')[0];

            if (!name) continue;

            const certificateId = crypto.randomUUID().split('-')[0].toUpperCase();

            // Generate PDF
            const pdfBytes = await generateCertificatePdf({
                name,
                courseName,
                issueDate,
                certificateId,
                signatoryName: settings.signatoryName,
                signatoryTitle: settings.signatoryTitle,
                signatureImage: settings.signatureImage,
                signatory2Name: settings.signatory2Name,
                signatory2Title: settings.signatory2Title,
                signature2Image: settings.signature2Image,
                certificateType: settings.certificateType,
                presentedBy: settings.presentedBy,
                presentationDate: settings.presentationDate,
                templateId: (settings as any).templateId || "template1"
            });

            // Prepare DB record
            certificatesToCreate.push({
                name,
                courseName,
                issueDate: new Date(issueDate),
                certificateId,
            });

            // Add to ZIP
            const fileName = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${certificateId}.pdf`;
            zip.file(fileName, pdfBytes);
        }

        if (certificatesToCreate.length === 0) {
            return NextResponse.json({ error: 'No valid rows found in CSV (missing name column?)' }, { status: 400 });
        }

        // Bulk save to Prisma
        await prisma.certificate.createMany({
            data: certificatesToCreate,
        });

        // Generate ZIP buffer - using arraybuffer which Next.js handles natively as a BufferSource for Responses
        const zipData = await zip.generateAsync({ type: 'arraybuffer' });

        return new NextResponse(zipData, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="ioha-certificates-batch.zip"`,
            },
        });
    } catch (error: any) {
        console.error("Batch generation error:", error);
        return NextResponse.json({ error: error.message || 'Failed to process batch generation' }, { status: 500 });
    }
}
