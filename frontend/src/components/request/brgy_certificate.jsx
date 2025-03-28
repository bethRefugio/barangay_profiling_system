import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import axios from 'axios';

const generateBarangayCertificate = async (request) => {
    try {
        // Fetch the O.R. number from the backend
        const response = await axios.get('http://localhost:5000/generate-or-number');
        const orNumber = response.data.orNumber;

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        // Add a page to the document with A4 dimensions
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points (8.3 x 11.7 inches)

        // Set up fonts and styles
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontSize = 12;

        // Add the logo to the left side
        const logoUrl = "/logo_enhanced final.png"; // Replace with the actual path to the logo
        const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(logoBytes);
        page.drawImage(logoImage, { x: 50, y: 720, width: 100, height: 100 });

        // Add the header text
        page.drawText("Republic of the Philippines", { x: 160, y: 800, size: fontSize, font });
        page.drawText("Province of Lanao del Norte", { x: 160, y: 785, size: fontSize, font });
        page.drawText("City of Iligan", { x: 160, y: 770, size: fontSize, font });
        page.drawText("Barangay Bunawan", { x: 160, y: 755, size: fontSize, font });

        // Add the title
        page.drawText("OFFICE OF THE BARANGAY CAPTAIN", { x: 200, y: 720, size: fontSize, font: boldFont });
        page.drawText("CERTIFICATE OF RESIDENCY", { x: 200, y: 700, size: fontSize + 4, font, color: rgb(0, 0, 0) });

        // Add the body text with 1.5 line spacing
        const bodyTextLines = [
            "TO WHOM IT MAY CONCERN:",
            "",
            `This is to certify that ${request.name}, ${request.age} years old, a resident of ${request.address}.`,
            "",
            "",
            "",
            "Based on records the of this office, that he/she is a resident of this barangay.",
            "",
            `ISSUED this ${new Date().toLocaleDateString()} at Barangay Bunawan, City of Iligan, Province of Lanao del Norte,`,
            `upon request of the interested party for ${request.purpose}.`,
        ];

        let y = 650; // Starting y-coordinate for the body text
        const lineSpacing = fontSize * 1.5; // 1.5 line spacing

        bodyTextLines.forEach((line) => {
            page.drawText(line, { x: 50, y, size: fontSize, font, maxWidth: 495.28 });
            y -= lineSpacing; // Move to the next line
        });

        // Add the Barangay Captain's name
        const rightX = 400;
        page.drawText("REY T. MAGLANGIT", { x: rightX, y: 220, size: fontSize, font: boldFont });
        page.drawText("Barangay Captain", { x: rightX, y: 205, size: fontSize, font });

        // Add the footer with the O.R. number
        page.drawText(`O.R No.: ${orNumber}`, { x: 50, y: 80, size: fontSize, font });
        page.drawText("Date Issued: " + new Date().toLocaleDateString(), { x: 50, y: 65, size: fontSize, font });
        page.drawText("Doc. Stamp: Paid", { x: 50, y: 50, size: fontSize, font });

        // Serialize the PDF to bytes
        const pdfBytes = await pdfDoc.save();

        // Trigger download
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Barangay_Certificate_${request.name}.pdf`;
        link.click();

        console.log("PDF generated successfully!");
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};

export default generateBarangayCertificate;