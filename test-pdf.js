// Test script to verify PDF generation functionality
import { jsPDF } from 'jspdf';

console.log('Testing jsPDF import and basic functionality...');

try {
    // Create a simple PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add some text
    pdf.text('Test PDF Generation', 20, 20);
    pdf.text('If you can see this, jsPDF is working correctly!', 20, 30);
    
    // Add a simple rectangle
    pdf.rect(20, 40, 50, 20);
    pdf.text('Rectangle test', 22, 52);
    
    console.log('✓ jsPDF instance created successfully');
    console.log('✓ Text and shapes added successfully');
    
    // Try to generate a data URL instead of saving to avoid file system issues
    const pdfData = pdf.output('datauristring');
    
    if (pdfData && pdfData.startsWith('data:application/pdf')) {
        console.log('✓ PDF generated successfully as data URL');
        console.log('✓ PDF data length:', pdfData.length, 'characters');
        console.log('\nPDF generation test PASSED! ✓');
    } else {
        console.log('✗ PDF data URL generation failed');
    }
    
} catch (error) {
    console.error('✗ PDF generation test FAILED:', error.message);
    console.error('Stack trace:', error.stack);
}