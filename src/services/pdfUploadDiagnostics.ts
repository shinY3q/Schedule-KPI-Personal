export type PDFDiagnosticDetails = Record<string, string | number | boolean | null | undefined>;

interface PDFDiagnosticEvent {
  elapsedMs: number;
  stage: string;
  details?: PDFDiagnosticDetails;
}

export interface PDFUploadDiagnostics {
  log: (stage: string, details?: PDFDiagnosticDetails) => void;
  fail: (error: unknown, code?: string) => void;
  toText: () => string;
}

function describeError(error: unknown): { name: string; message: string } {
  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: error.message || 'Unknown error',
    };
  }

  return { name: typeof error, message: String(error) };
}

function formatDetails(details?: PDFDiagnosticDetails): string {
  if (!details) return '';

  const values = Object.entries(details)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`);

  return values.length > 0 ? ` | ${values.join(', ')}` : '';
}

export function createPDFUploadDiagnostics(file: File): PDFUploadDiagnostics {
  const startedAt = Date.now();
  const reportId = `${startedAt.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const events: PDFDiagnosticEvent[] = [];
  let failureRecorded = false;

  const environment = {
    userAgent: navigator.userAgent || 'unknown',
    platform: navigator.platform || 'unknown',
    language: navigator.language || 'unknown',
    online: navigator.onLine,
    worker: typeof Worker !== 'undefined',
    webAssembly: typeof WebAssembly !== 'undefined',
    fileArrayBuffer: typeof File !== 'undefined' && typeof File.prototype.arrayBuffer === 'function',
    promiseWithResolvers: typeof (Promise as typeof Promise & { withResolvers?: unknown }).withResolvers === 'function',
    promiseTry: typeof (Promise as typeof Promise & { try?: unknown }).try === 'function',
  };

  const log = (stage: string, details?: PDFDiagnosticDetails) => {
    const event: PDFDiagnosticEvent = {
      elapsedMs: Date.now() - startedAt,
      stage,
      details,
    };
    events.push(event);
    console.info(`[PDF upload ${reportId}] ${stage}`, details ?? '');
  };

  log('file_selected', {
    sizeBytes: file.size,
    mimeType: file.type || 'empty',
    extension: file.name.includes('.') ? file.name.split('.').pop()?.toLocaleLowerCase() : 'none',
  });

  return {
    log,
    fail(error, code) {
      if (failureRecorded) return;
      failureRecorded = true;
      const description = describeError(error);
      log('failed', {
        code: code || 'unknown',
        errorName: description.name,
        errorMessage: description.message.slice(0, 500),
      });
      console.error(`[PDF upload ${reportId}]`, description.name, description.message);
    },
    toText() {
      const lines = [
        'PDF upload diagnostic report',
        `Report ID: ${reportId}`,
        `Started: ${new Date(startedAt).toISOString()}`,
        'Privacy: file content, filename and student data are not included.',
        '',
        'Environment:',
        `userAgent=${environment.userAgent}`,
        `platform=${environment.platform}`,
        `language=${environment.language}`,
        `online=${environment.online}`,
        `Worker=${environment.worker}`,
        `WebAssembly=${environment.webAssembly}`,
        `File.arrayBuffer=${environment.fileArrayBuffer}`,
        `Promise.withResolvers=${environment.promiseWithResolvers}`,
        `Promise.try=${environment.promiseTry}`,
        '',
        'Events:',
        ...events.map(event => `+${event.elapsedMs}ms ${event.stage}${formatDetails(event.details)}`),
      ];

      return lines.join('\n');
    },
  };
}

export async function copyDiagnosticReport(report: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(report);
      return true;
    }
  } catch {
    // Older iOS versions can reject the Clipboard API even after a user click.
  }

  const textarea = document.createElement('textarea');
  textarea.value = report;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
