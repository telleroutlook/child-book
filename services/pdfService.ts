
import type { GeneratedImage } from '../types';

declare const jspdf: any;

export const generatePdf = (images: GeneratedImage[], childName: string) => {
    const { jsPDF } = jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 15;
    const imgWidth = pdfWidth - margin * 2;
    const imgHeight = imgWidth; // For 1:1 aspect ratio
    const x = margin;
    const y = (pdfHeight - imgHeight) / 2;

    images.forEach((image, index) => {
        if (index > 0) {
            pdf.addPage();
        }
        try {
          pdf.addImage(image.src, 'JPEG', x, y, imgWidth, imgHeight);
        } catch (error) {
          console.error("Error adding image to PDF:", error);
          // Add a placeholder page on error
          pdf.text("Could not load image.", pdfWidth / 2, pdfHeight / 2, { align: 'center' });
        }
    });

    pdf.save(`${childName.toLowerCase().replace(/\s/g, '-')}-coloring-book.pdf`);
};
