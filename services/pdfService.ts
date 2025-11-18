
import type { GeneratedImage } from '../types';
import { jsPDF } from 'jspdf';

export const generatePdf = (images: GeneratedImage[], childName: string) => {
    if (!images || images.length === 0) {
        console.error("No images provided to generate PDF");
        return;
    }

    try {
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
            
            // Validate image source before adding to PDF
            if (!image.src || !image.src.startsWith('data:image')) {
                console.warn(`Invalid image source for page ${index + 1}`, image.src);
                // Add a placeholder page with error message
                pdf.text(`Image ${index + 1} could not be loaded.`, pdfWidth / 2, pdfHeight / 2, { align: 'center' });
                return;
            }
            
            try {
                pdf.addImage(image.src, 'JPEG', x, y, imgWidth, imgHeight);
            } catch (error) {
                console.error(`Error adding image ${index + 1} to PDF:`, error);
                // Add a placeholder page on error
                pdf.text(`Could not load image ${index + 1}.`, pdfWidth / 2, pdfHeight / 2, { align: 'center' });
            }
        });

        // Sanitize child name for filename
        const sanitizedChildName = childName.replace(/[^a-zA-Z0-9-_]/g, '_');
        const filename = `${sanitizedChildName.toLowerCase()}-coloring-book.pdf`;
        
        pdf.save(filename);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("There was an error creating the PDF. Please try again.");
    }
};
