/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Reliable A4 Portrait PDF Export & Clean Print helper for Monthly Behaviour Reports
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const DASINYA_FALLBACK_CREST_SVG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="16" fill="#F0F8FA" stroke="#0087A5" stroke-width="3"/>
      <path d="M40 12 L62 22 V42 C62 55 52 64 40 69 C28 64 18 55 18 42 V22 Z" fill="#1A1D4E"/>
      <path d="M40 18 L56 26 V42 C56 51 49 58 40 62 C31 58 24 51 24 42 V26 Z" fill="#0087A5"/>
      <text x="40" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="13" fill="#FFFFFF">DS</text>
    </svg>`
  );

async function resolveSafeImageDataUrl(src: string): Promise<string> {
  if (!src) return DASINYA_FALLBACK_CREST_SVG;
  if (src.startsWith('data:')) return src;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(src, { mode: 'cors', cache: 'force-cache', signal: controller.signal });
    if (!res.ok) return DASINYA_FALLBACK_CREST_SVG;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string' && reader.result.startsWith('data:')) {
          resolve(reader.result);
        } else {
          resolve(DASINYA_FALLBACK_CREST_SVG);
        }
      };
      reader.onerror = () => resolve(DASINYA_FALLBACK_CREST_SVG);
      reader.readAsDataURL(blob);
    });
  } catch {
    return DASINYA_FALLBACK_CREST_SVG;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function replaceInputsWithSpans(targetRoot: HTMLElement, liveInputValues: string[]): void {
  const inputs = Array.from(targetRoot.querySelectorAll('input'));
  inputs.forEach((inp, idx) => {
    const val = (liveInputValues[idx] ?? inp.value ?? '').trim();
    const span = document.createElement('span');
    span.textContent = val;
    span.style.display = 'inline-block';
    span.style.width = '100%';
    span.style.fontWeight = '700';
    span.style.fontSize = '10px';
    span.style.lineHeight = '1.25';
    span.style.color = '#1A1D4E';
    if (inp.className.includes('text-center')) {
      span.style.textAlign = 'center';
    }
    if (inp.className.includes('font-mono')) {
      span.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, monospace';
    }
    inp.replaceWith(span);
  });
}

function stripUnsupportedColorFunctions(css: string): string {
  if (!css.includes('oklch(') && !css.includes('oklab(') && !css.includes('color-mix(')) {
    return css;
  }
  return css
    .replace(/oklch\([^()]*\)/g, '#334155')
    .replace(/oklab\([^()]*\)/g, '#334155')
    .replace(/color-mix\([^()]*\)/g, '#E6EEF8')
    .replace(/color-mix\([^()]*\)/g, '#E6EEF8');
}

function collectSanitizedProdCssFromLiveDocument(): string | null {
  try {
    const chunks: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      if (sheet.ownerNode instanceof HTMLLinkElement) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          chunks.push(rules.map((r) => r.cssText).join('\n'));
        } catch {
          // Cross-origin font stylesheets (e.g. Google Fonts) cannot be read; leave those <link> tags untouched
        }
      }
    }
    if (chunks.length === 0) return null;
    return stripUnsupportedColorFunctions(chunks.join('\n'));
  } catch {
    return null;
  }
}

function sanitizeClonedStylesheets(clonedDoc: Document, sanitizedProdCss: string | null): void {
  // Replace Tailwind v4 oklch/oklab/color-mix tokens in inline <style> sheets
  const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
  for (const st of styleTags) {
    if (st.textContent) {
      st.textContent = stripUnsupportedColorFunctions(st.textContent);
    }
  }

  // In production Vite builds, Tailwind CSS lives in same-origin <link rel="stylesheet">.
  // Replace same-origin stylesheet links with the pre-sanitized CSS text.
  if (sanitizedProdCss) {
    const links = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
    for (const lnk of links) {
      const href = lnk.getAttribute('href') || '';
      if (href.startsWith('/') || href.startsWith(window.location.origin)) {
        lnk.remove();
      }
    }
    const inlineStyle = clonedDoc.createElement('style');
    inlineStyle.textContent = sanitizedProdCss;
    clonedDoc.head.appendChild(inlineStyle);
  }
}

export interface ExportBehaviourPdfOptions {
  elementId?: string;
  studentName: string;
  monthKey: string;
}

export async function exportBehaviourReportPdf({
  elementId = 'printable-behaviour',
  studentName,
  monthKey,
}: ExportBehaviourPdfOptions): Promise<void> {
  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) {
    throw new Error('Behaviour report preview is not currently visible.');
  }

  // Wait for any Arabic/Kurdish/Latin web fonts to finish loading
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready.catch(() => {});
  }

  // Capture live controlled <input> values before DOM cloning
  const liveInputValues = Array.from(sourceEl.querySelectorAll('input')).map(
    (inp) => inp.value || ''
  );

  // Pre-resolve remote logo images to safe Data URLs to prevent canvas CORS tainting
  const sourceImgs = Array.from(sourceEl.querySelectorAll('img'));
  const resolvedImgSrcs = await Promise.all(
    sourceImgs.map((img) => resolveSafeImageDataUrl(img.currentSrc || img.src || ''))
  );

  const sanitizedProdCss = collectSanitizedProdCssFromLiveDocument();
  const captureWidth = 920;

  const canvas = await html2canvas(sourceEl, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width: captureWidth,
    windowWidth: 1100,
    onclone: (clonedDoc, clonedEl) => {
      sanitizeClonedStylesheets(clonedDoc, sanitizedProdCss);

      // Reset root backgrounds to clean hex
      clonedDoc.documentElement.style.backgroundColor = '#ffffff';
      clonedDoc.body.style.backgroundColor = '#ffffff';
      clonedEl.style.overflow = 'visible';

      // Inject compact Portrait A4 table & cell rules for crisp 1-page Portrait A4 fit
      const portraitRule = clonedDoc.createElement('style');
      portraitRule.textContent = `
        #${elementId} {
          width: ${captureWidth}px !important;
          max-width: ${captureWidth}px !important;
          min-width: ${captureWidth}px !important;
          padding: 10px 12px !important;
          margin: 0 !important;
          background: #ffffff !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          border: 1px solid #94A3B8 !important;
          box-sizing: border-box !important;
        }
        #${elementId} table {
          font-size: 8.5px !important;
          line-height: 1.2 !important;
        }
        #${elementId} td,
        #${elementId} th {
          padding: 2px 4px !important;
        }
        #${elementId} td > div.h-6 {
          height: 17px !important;
        }
      `;
      clonedDoc.head.appendChild(portraitRule);

      // Force top trilingual header to 3 columns
      const topTitleGrid = clonedEl.querySelector('[data-behaviour-title-row="true"]') as HTMLElement | null;
      if (topTitleGrid) {
        topTitleGrid.style.display = 'grid';
        topTitleGrid.style.gridTemplateColumns = '1fr 1fr 1fr';
        topTitleGrid.style.gap = '6px';
      }

      // Force 2-column side-by-side body layout proportioned for Portrait A4
      const bodyGrid = clonedEl.querySelector('[data-behaviour-grid="true"]') as HTMLElement | null;
      if (bodyGrid) {
        bodyGrid.style.display = 'grid';
        bodyGrid.style.gridTemplateColumns = '1fr 1fr';
        bodyGrid.style.gap = '8px';
        bodyGrid.style.alignItems = 'start';
      }

      // Prevent horizontal scroll wrappers from clipping wide tables
      const scrollers = Array.from(clonedEl.querySelectorAll('.overflow-x-auto')) as HTMLElement[];
      for (const sc of scrollers) {
        sc.style.overflow = 'visible';
      }

      // Swap live input controls with crisp printable text spans
      replaceInputsWithSpans(clonedEl, liveInputValues);

      // Swap images with CORS-safe Data URLs
      const clonedImgs = Array.from(clonedEl.querySelectorAll('img'));
      clonedImgs.forEach((img, idx) => {
        const safeSrc = resolvedImgSrcs[idx] || DASINYA_FALLBACK_CREST_SVG;
        img.removeAttribute('crossorigin');
        img.src = safeSrc;
      });
    },
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 6;
  const availWidth = pdfWidth - margin * 2;
  const availHeight = pdfHeight - margin * 2;

  // Uniform proportional scaling so the entire report fits crisply on 1 Portrait A4 page
  const scale = Math.min(availWidth / canvas.width, availHeight / canvas.height);
  const drawWidth = canvas.width * scale;
  const drawHeight = canvas.height * scale;
  const offsetX = (pdfWidth - drawWidth) / 2;
  const offsetY = margin;

  pdf.addImage(imgData, 'PNG', offsetX, offsetY, drawWidth, drawHeight);

  const cleanStudent = (studentName || 'Student')
    .trim()
    .replace(/[^a-zA-Z0-9\u0600-\u06FF_-]+/g, '_');
  const cleanMonth = (monthKey || 'Monthly').replace(/[^a-zA-Z0-9_-]+/g, '_');
  pdf.save(`${cleanStudent}_Behaviour_Report_${cleanMonth}.pdf`);
}

export function printBehaviourReport(elementId = 'printable-behaviour'): void {
  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) return;

  const liveInputValues = Array.from(sourceEl.querySelectorAll('input')).map(
    (inp) => inp.value || ''
  );

  const existingMount = document.getElementById('dasinya-print-root');
  if (existingMount) {
    existingMount.remove();
  }

  const mount = document.createElement('div');
  mount.id = 'dasinya-print-root';

  const clone = sourceEl.cloneNode(true) as HTMLElement;
  clone.id = 'printable-behaviour-print-clone';
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0px';
  clone.style.padding = '8px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.width = '100%';

  const topTitleGrid = clone.querySelector('[data-behaviour-title-row="true"]') as HTMLElement | null;
  if (topTitleGrid) {
    topTitleGrid.style.display = 'grid';
    topTitleGrid.style.gridTemplateColumns = '1fr 1fr 1fr';
    topTitleGrid.style.gap = '6px';
  }

  const bodyGrid = clone.querySelector('[data-behaviour-grid="true"]') as HTMLElement | null;
  if (bodyGrid) {
    bodyGrid.style.display = 'grid';
    bodyGrid.style.gridTemplateColumns = '1fr 1fr';
    bodyGrid.style.gap = '8px';
    bodyGrid.style.alignItems = 'start';
  }

  const scrollers = Array.from(clone.querySelectorAll('.overflow-x-auto')) as HTMLElement[];
  for (const sc of scrollers) {
    sc.style.overflow = 'visible';
  }

  const styleTag = document.createElement('style');
  styleTag.id = 'dasinya-behaviour-page-rule';
  styleTag.textContent = '@page { size: A4 portrait; margin: 6mm; }';
  document.head.appendChild(styleTag);

  replaceInputsWithSpans(clone, liveInputValues);
  mount.appendChild(clone);
  document.body.appendChild(mount);
  document.body.classList.add('dasinya-printing-behaviour');

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.body.classList.remove('dasinya-printing-behaviour');
    mount.remove();
    styleTag.remove();
  };

  window.addEventListener('afterprint', cleanup, { once: true });
  // Fallback cleanup if afterprint doesn't fire in some browsers
  window.setTimeout(cleanup, 60000);

  try {
    window.print();
  } catch (err) {
    cleanup();
    console.error('Browser print dialog could not be opened:', err);
  }
}
