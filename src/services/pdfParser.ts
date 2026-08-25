import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import PDFWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker';
import type { INPData } from '../types/inp';
import {
  extractDataFromPages,
  type ExtractedPDFPage,
} from './pdfParserCore';

export { extractDataFromText } from './pdfParserCore';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerPort = new PDFWorker();
}

export class PDFImportError extends Error {
  readonly code: 'invalid_file' | 'password' | 'no_text' | 'no_subjects' | 'missing_group' | 'read_failed';

  constructor(
    code: PDFImportError['code'],
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'PDFImportError';
    this.code = code;
  }
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    try {
      return await file.arrayBuffer();
    } catch {
      // FileReader is a compatibility fallback for older WebKit versions.
    }
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error('Unexpected FileReader result'));
    };
    reader.readAsArrayBuffer(file);
  });
}

function validatePDFBytes(bytes: Uint8Array) {
  if (bytes.byteLength < 5) {
    throw new PDFImportError('invalid_file', 'Файл порожній або пошкоджений. Завантажте оригінальний PDF-файл ІНП.');
  }

  const prefix = String.fromCharCode(...bytes.subarray(0, Math.min(bytes.length, 1024)));
  if (!prefix.includes('%PDF-')) {
    throw new PDFImportError('invalid_file', 'Обраний файл не є PDF. Завантажте оригінальний ІНП у форматі PDF.');
  }
}

function friendlyPDFError(error: unknown): PDFImportError {
  if (error instanceof PDFImportError) return error;

  const details = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  if (/password/i.test(details)) {
    return new PDFImportError('password', 'PDF захищений паролем. Збережіть незахищену копію ІНП та завантажте її повторно.', { cause: error });
  }
  if (/invalid pdf|missing pdf|unexpected response|formaterror/i.test(details)) {
    return new PDFImportError('invalid_file', 'PDF пошкоджений або має непідтримувану структуру. Завантажте оригінальний файл ІНП з Електронного кампусу.', { cause: error });
  }

  return new PDFImportError('read_failed', 'Не вдалося відкрити PDF у браузері. Оновіть сторінку або завантажте оригінальний файл ІНП ще раз.', { cause: error });
}

export async function parsePdfINP(file: File): Promise<INPData> {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const bytes = new Uint8Array(arrayBuffer);
    validatePDFBytes(bytes);

    const loadingTask = pdfjsLib.getDocument({
      data: bytes,
      useWasm: false,
      useWorkerFetch: false,
      isOffscreenCanvasSupported: false,
      isImageDecoderSupported: false,
    });
    const pdf = await loadingTask.promise;

    try {
      const pages: ExtractedPDFPage[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const items: ExtractedPDFPage['items'] = [];
        const textReader = page.streamTextContent().getReader();

        try {
          while (true) {
            const chunk = await textReader.read();
            if (chunk.done) break;

            for (const item of chunk.value.items) {
              if (!('str' in item) || !item.str.trim()) continue;
              items.push({
                str: item.str,
                x: Number(item.transform[4]),
                y: Number(item.transform[5]),
              });
            }
          }
        } finally {
          textReader.releaseLock();
        }

        pages.push({ width: viewport.width, items });
        page.cleanup();
      }

      const textLength = pages
        .flatMap(page => page.items)
        .reduce((length, item) => length + item.str.replace(/\s/g, '').length, 0);

      if (textLength < 20) {
        throw new PDFImportError('no_text', 'У PDF немає текстового шару. Завантажте оригінальний ІНП з Електронного кампусу, а не скан або фото.');
      }

      const result = extractDataFromPages(pages, file.name);
      if (result.subjects.length === 0) {
        throw new PDFImportError('no_subjects', 'У файлі не знайдено таблицю дисциплін. Завантажте повний оригінальний ІНП з Електронного кампусу.');
      }
      if (!result.group) {
        throw new PDFImportError('missing_group', 'У PDF не знайдено навчальну групу. Перевірте, що завантажено повний ІНП, а не окрему сторінку.');
      }

      return result;
    } finally {
      await loadingTask.destroy();
    }
  } catch (error) {
    const friendlyError = friendlyPDFError(error);
    console.error('Error parsing PDF:', friendlyError.code, error);
    throw friendlyError;
  }
}
