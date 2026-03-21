import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export interface CertificateData {
  name: string;
  courseName: string;
  issueDate: string;
  certificateId: string;
  signatoryName?: string;
  signatoryTitle?: string;
  signatureImage?: string | null;
  signatory2Name?: string;
  signatory2Title?: string;
  signature2Image?: string | null;
  certificateType?: string;
  presentedBy?: string;
  presentationDate?: string;
  templateId?: string;
}

export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const { name, courseName, issueDate, certificateId, signatoryName, signatoryTitle, signatureImage, signatory2Name, signatory2Title, signature2Image, certificateType, presentedBy, presentationDate, templateId = 'template1' } = data;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Set metadata
  pdfDoc.setTitle(`IOHA Certificate - ${name}`);
  pdfDoc.setAuthor('International Occupational Hygiene Association');
  pdfDoc.setSubject('Official Professional Certification');
  pdfDoc.setCreationDate(new Date());

  // A4 Landscape
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Load fonts
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontTimesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const greatVibesPath = path.join(process.cwd(), 'public', 'fonts', 'GreatVibes-Regular.ttf');
  const greatVibesBytes = fs.readFileSync(greatVibesPath);
  const fontGreatVibes = await pdfDoc.embedFont(greatVibesBytes);

  // Colors
  const navy = rgb(0 / 255, 33 / 255, 71 / 255);
  const gold = rgb(212 / 255, 175 / 255, 55 / 255);
  const white = rgb(1, 1, 1);
  const black = rgb(0, 0, 0);
  const gray = rgb(0.5, 0.5, 0.5);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://certificates.ioha.org';
  const qrBase64 = await QRCode.toDataURL(`${baseUrl}/verify/${certificateId}`, {
    errorCorrectionLevel: 'H', margin: 1, color: { dark: '#002147', light: '#ffffff' }
  });
  const qrImage = await pdfDoc.embedPng(qrBase64);
  const qrDims = qrImage.scale(0.3);

  // Helper for embedded logo
  const logoPath = path.join(process.cwd(), 'public', 'ioha-logo.jpg');
  let logoImage = null;
  let logoDims = null;
  try {
    const logoBytes = fs.readFileSync(logoPath);
    logoImage = await pdfDoc.embedJpg(logoBytes);
    logoDims = logoImage.scaleToFit(120, 70);
  } catch (e) {
    console.error("Failed to load IOHA logo", e);
  }

  const drawCenteredText = (text: string, yPos: number, font: PDFFont, size: number, color: any, xOffset = 0) => {
    let tWidth = font.widthOfTextAtSize(text, size);
    let finalSize = size;
    const maxWidth = 640; // Safe zone to guarantee no border collision
    if (tWidth > maxWidth) {
      finalSize = size * (maxWidth / tWidth);
      tWidth = font.widthOfTextAtSize(text, finalSize);
    }
    page.drawText(text, { x: ((width - tWidth) / 2) + xOffset, y: yPos, size: finalSize, font, color });
  };

  const drawSignature = async (sigImage: string | null | undefined, sigName: string | undefined, sigTitle: string | undefined, xPos: number, yPos: number, fallbackLayout: boolean = false) => {
      
      if (sigImage) {
        const base64Data = sigImage.split(',')[1] || sigImage;
        const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        try {
          const img = sigImage.includes('jpeg') || sigImage.includes('jpg') ? await pdfDoc.embedJpg(imgBytes) : await pdfDoc.embedPng(imgBytes);
          const sDims = img.scaleToFit(180, 60);
          page.drawImage(img, { x: xPos + 10, y: yPos + 10, width: sDims.width, height: sDims.height });
        } catch (e) {}
      } else if (sigName) {
        page.drawText(sigName, { x: xPos + 20, y: yPos + 28, size: 30, font: fontGreatVibes, color: black });
      }
    
      page.drawLine({ start: { x: xPos, y: yPos }, end: { x: xPos + 200, y: yPos }, thickness: 1, color: navy });
    
      const defaultTitle = fallbackLayout ? "IOHA Official" : "IOHA President";
      const actualTitle = sigTitle || defaultTitle;
      
      let finalSize = 10;
      let tWidth = fontHelvetica.widthOfTextAtSize(actualTitle, finalSize);
      const maxWidth = 230; // Max allowed width for signature labels
      if (tWidth > maxWidth) {
          finalSize = 10 * (maxWidth / tWidth);
          tWidth = fontHelvetica.widthOfTextAtSize(actualTitle, finalSize);
      }
      
      page.drawText(actualTitle, { x: xPos + 100 - (tWidth / 2), y: yPos - 15, size: finalSize, font: fontHelvetica, color: black });
  };

  // --- BACKGROUND & LOGO rendering based on selected template ---
  if (templateId === 'template3') {
    const bgPath = path.join(process.cwd(), 'public', 'template3-bg.png');
    try {
      if (fs.existsSync(bgPath)) {
        const bgBytes = fs.readFileSync(bgPath);
        const bgImg = await pdfDoc.embedPng(bgBytes);
        page.drawImage(bgImg, { x: 0, y: 0, width, height });
      }
    } catch (e) {
      console.error("Failed to load template 3 background", e);
      page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(253/255, 253/255, 253/255) });
    }
    // Template 3 background lacks logo, so draw it
    if (logoImage && logoDims) {
      page.drawImage(logoImage, { x: (width - logoDims.width) / 2, y: height - 130, width: logoDims.width, height: logoDims.height });
    }
  } else if (templateId === 'template2') {
    const bgPath = path.join(process.cwd(), 'public', 'template-elegant-bg.png');
    try {
      if (fs.existsSync(bgPath)) {
        const bgBytes = fs.readFileSync(bgPath);
        const bgImg = await pdfDoc.embedPng(bgBytes);
        page.drawImage(bgImg, { x: 0, y: 0, width, height });
      }
    } catch (e) {
      console.error("Failed to load elegant background", e);
      page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(253/255, 253/255, 253/255) });
    }
    // Elegant background already contains the logo inside the image
  } else {
    // TEMPLATE 1 (Classic)
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(248 / 255, 250 / 255, 252 / 255) });
    
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: navy, borderWidth: 8 });
    page.drawRectangle({ x: 43, y: 43, width: width - 86, height: height - 86, borderColor: gold, borderWidth: 2 });
    
    const drawFlourish = (fx: number, fy: number) => page.drawRectangle({ x: fx, y: fy, width: 10, height: 10, color: gold });
    drawFlourish(43, 43); drawFlourish(width - 53, 43); drawFlourish(43, height - 53); drawFlourish(width - 53, height - 53);

    if (logoImage && logoDims) {
      page.drawImage(logoImage, { x: (width - logoDims.width) / 2, y: height - 125, width: logoDims.width, height: logoDims.height });
    }
  }

  // --- UNIFIED TEXT RENDERING ---
  // All templates share the exact same typography, signature, and QR code placement logic!
  
  drawCenteredText('INTERNATIONAL OCCUPATIONAL HYGIENE ASSOCIATION', height - 145, fontHelveticaBold, 12, navy);
  drawCenteredText('CERTIFICATE', height - 200, fontHelveticaBold, 48, black);
  drawCenteredText(certificateType || 'Of Attendance At', height - 240, fontTimesItalic, 20, black);
  drawCenteredText(courseName, height - 290, fontHelveticaBold, 16, navy);
  drawCenteredText(`Presented By ${presentedBy || ''}`, height - 325, fontTimesItalic, 14, black);
  
  if (presentationDate) {
      drawCenteredText(`On ${new Date(presentationDate).toLocaleDateString()}`, height - 345, fontHelveticaBold, 14, navy);
  }
  
  drawCenteredText(name, height - 400, fontGreatVibes, 54, black);
  page.drawLine({ start: { x: width/2 - 200, y: height - 410 }, end: { x: width/2 + 200, y: height - 410 }, thickness: 1, color: navy });

  await drawSignature(signature2Image, signatory2Name, signatory2Title, width/2 - 320, 100, true);
  await drawSignature(signatureImage, signatoryName, signatoryTitle, width/2 + 120, 100, false);

  // QR Box
  const qrY = 70;
  const boxPadding = 8;
  const extraWidth = 95;
  const boxWidth = qrDims.width + (boxPadding * 2) + extraWidth;
  const boxX = (width / 2) - (boxWidth / 2);

  page.drawRectangle({
    x: boxX, y: qrY - boxPadding + 2, width: boxWidth, height: qrDims.height + (boxPadding * 2) - 4,
    borderColor: gold, borderWidth: 1.5, color: white,
  });
  
  const qrImgX = boxX + boxPadding;
  page.drawImage(qrImage, { x: qrImgX, y: qrY, width: qrDims.width, height: qrDims.height });
  
  const qrTextX = qrImgX + qrDims.width + 5;
  const iDateObj = new Date(issueDate || Date.now());
  const iDateStr = iDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  
  page.drawText(`Issued: ${iDateStr}`, { x: qrTextX, y: qrY + 29, size: 8, font: fontHelveticaBold, color: navy });
  page.drawText("IOHA VERIFIED", { x: qrTextX, y: qrY + 18, size: 9, font: fontHelveticaBold, color: gold });
  page.drawText(`#${certificateId}`, { x: qrTextX, y: qrY + 7, size: 8, font: fontHelvetica, color: black });

  return await pdfDoc.save();
}
