import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Some polyfills for Node
// pdfjs-dist needs standard fetch and canvas sometimes, but let's hope it just works for text

async function extract() {
    const data = new Uint8Array(fs.readFileSync('C:/Users/bludj/.gemini/antigravity/brain/5f4d698e-f77e-4a62-b8e7-b0979bfdf0d4/.user_uploaded/media_1787571171643.pdf'));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item) => item.str)
            .join(' ');
        fullText += `\n=== PAGE ${i} ===\n` + pageText;
    }
    
    fs.writeFileSync('C:/Users/bludj/.gemini/antigravity/brain/5f4d698e-f77e-4a62-b8e7-b0979bfdf0d4/scratch/pdf_text_mjs.txt', fullText);
}

extract().catch(console.error);
