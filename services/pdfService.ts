
import type { GeneratedImage } from '../types';
import { jsPDF } from 'jspdf';

// Chinese font support
// Note: jsPDF uses system fonts which typically support Chinese on modern systems
// For better Chinese support, consider loading Noto Sans CJK or similar fonts

const sanitizeFileName = (name: string): string => {
    return name.replace(/[^a-zA-Z0-9\-_\s]/g, '_').replace(/\s+/g, '_').substring(0, 50);
};

const validateImageData = (src: string): boolean => {
    if (!src || typeof src !== 'string') {
        return false;
    }
    
    if (!src.startsWith('data:image/')) {
        console.warn('Invalid image data format');
        return false;
    }
    
    return true;
};

export const generatePdf = (images: GeneratedImage[], childName: string): void => {
    if (!images || !Array.isArray(images) || images.length === 0) {
        console.error("No images provided to generate PDF");
        throw new Error("No images available to generate PDF");
    }
    
    if (!childName || typeof childName !== 'string') {
        console.error("Invalid child name provided");
        throw new Error("Invalid child name");
    }

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Set font to support Chinese characters (using system default)
        // Most modern systems have Chinese fonts available
        pdf.setFont('helvetica', 'normal');
        const pdfWidth = 210;
        const pdfHeight = 297;
        const margin = 15;
        const imgWidth = pdfWidth - margin * 2;
        const imgHeight = imgWidth; // For 1:1 aspect ratio
        const x = margin;
        const y = (pdfHeight - imgHeight) / 2;
        
        let validImages = 0;

        images.forEach((image, index) => {
            if (index > 0) {
                pdf.addPage();
            }
            
            // Validate image source before adding to PDF
            if (!validateImageData(image.src)) {
                console.warn(`Invalid image source for page ${index + 1}`, image.src);
                // Add a placeholder page with error message
                pdf.setFontSize(14);
                pdf.setTextColor(220, 38, 38); // red-600
                try {
                    pdf.text(`Image ${index + 1} could not be loaded.`, pdfWidth / 2, pdfHeight / 2 - 5, { align: 'center' });
                    pdf.setFontSize(12);
                    pdf.setTextColor(107, 114, 128); // gray-500
                    pdf.text('Please check the image data and try again.', pdfWidth / 2, pdfHeight / 2 + 5, { align: 'center' });
                } catch (textError) {
                    console.warn('Error adding error text to PDF:', textError);
                    // Continue without text if font rendering fails
                }
            }
            
            try {
                pdf.addImage(image.src, 'JPEG', x, y, imgWidth, imgHeight);
                validImages++;
            } catch (error) {
                console.error(`Error adding image ${index + 1} to PDF:`, error);
                // Add a placeholder page on error
                pdf.setFontSize(14);
                pdf.setTextColor(220, 38, 38); // red-600
                try {
                    pdf.text(`Could not load image ${index + 1}.`, pdfWidth / 2, pdfHeight / 2 - 5, { align: 'center' });
                    pdf.setFontSize(12);
                    pdf.setTextColor(107, 114, 128); // gray-500
                    pdf.text('There was an error processing this image.', pdfWidth / 2, pdfHeight / 2 + 5, { align: 'center' });
                } catch (textError) {
                    console.warn('Error adding error text to PDF:', textError);
                }
            }
        });
        
        if (validImages === 0) {
            throw new Error("No valid images could be added to the PDF");
        }

        // Sanitize child name for filename
        const sanitizedChildName = sanitizeFileName(childName);
        const filename = `${sanitizedChildName.toLowerCase()}-coloring-book.pdf`;
        
        // Add metadata to PDF - safely handle Chinese characters
        const safeTitle = childName ? `${childName}'s Coloring Book` : 'Coloring Book';
        
        pdf.setProperties({
            title: safeTitle,
            subject: `AI-generated coloring book with ${images.length} pages`,
            creator: 'AI Coloring Book Creator',
            keywords: 'coloring book, children, AI-generated, printable',
        });
        
        // Try to save PDF with error handling
        try {
            pdf.save(filename);
        } catch (saveError) {
            console.error('Error saving PDF:', saveError);
            // Fallback: try with ASCII-only filename
            const asciiFilename = 'coloring-book.pdf';
            pdf.save(asciiFilename);
        }
        
        console.log(`PDF generated successfully with ${validImages}/${images.length} valid images`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        
        let errorMessage = "There was an error creating the PDF. Please try again.";
        if (error instanceof Error) {
            if (error.message.includes('No valid images')) {
                errorMessage = "Could not add any images to the PDF. Please generate the coloring book again.";
            } else if (error.message.includes('memory') || error.message.includes('size')) {
                errorMessage = "The PDF is too large. Please try with fewer images or smaller themes.";
            }
        }
        
        throw new Error(errorMessage);
    }
};
