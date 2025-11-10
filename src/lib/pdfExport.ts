import jsPDF from 'jspdf';
import { Metrics, ThinkingStep } from '@/types';

export interface PDFExportData {
  query: string;
  thinkingSteps: ThinkingStep[];
  result: string;
  metrics: Metrics;
}

export function exportToPDF(data: PDFExportData): void {
  console.log('[PDF Export] Creating PDF document...');
  console.log('[PDF Export] Data:', {
    queryLength: data.query?.length,
    resultLength: data.result?.length,
    thinkingSteps: data.thinkingSteps?.length,
    metrics: data.metrics,
  });

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPosition = margin;

    console.log('[PDF Export] PDF initialized. Page dimensions:', { pageWidth, pageHeight });

  // Helper function to add text with word wrapping
  const addText = (
    text: string,
    fontSize: number,
    color: [number, number, number],
    isBold: boolean = false
  ) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');

    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    }
    yPosition += 5;
  };

  // Helper function to add a separator line
  const addSeparator = () => {
    if (yPosition > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setDrawColor(139, 92, 246); // Purple color
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  };

  // Title
  doc.setFillColor(139, 92, 246); // Purple
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Kimi K2 Research Report', pageWidth / 2, 25, { align: 'center' });
  yPosition = 50;

  // Timestamp
  const timestamp = new Date().toLocaleString();
  addText(`Generated: ${timestamp}`, 10, [100, 116, 139]);
  yPosition += 5;

  // Query Section
  addSeparator();
  addText('Query', 16, [139, 92, 246], true);
  addText(data.query, 11, [30, 41, 59]);
  yPosition += 5;

  // Thinking Process Section
  addSeparator();
  addText('AI Thinking Process', 16, [139, 92, 246], true);

  if (data.thinkingSteps.length === 0) {
    addText(
      'No thinking steps were captured. The AI processed this query directly.',
      10,
      [100, 116, 139]
    );
  } else {
    addText(
      `The AI went through ${data.thinkingSteps.length} thinking step${data.thinkingSteps.length !== 1 ? 's' : ''}:`,
      10,
      [71, 85, 105]
    );
    yPosition += 3;

    data.thinkingSteps.forEach((step, index) => {
      if (yPosition > pageHeight - margin - 30) {
        doc.addPage();
        yPosition = margin;
      }

      // Step header
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPosition - 5, maxWidth, 8, 'F');
      addText(`Step ${index + 1} (${step.tokens} tokens)`, 10, [139, 92, 246], true);

      // Step content
      addText(step.content, 9, [51, 65, 85]);
      yPosition += 3;
    });
  }

  yPosition += 5;

  // Results Section
  addSeparator();
  addText('Results', 16, [139, 92, 246], true);

  if (!data.result || data.result.trim() === '') {
    addText('No results available.', 10, [100, 116, 139]);
  } else {
    // Clean markdown formatting for PDF
    const cleanedResult = data.result
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/`([^`]+)`/g, '$1') // Remove code markers
      .replace(/^[-*]\s/gm, '• '); // Convert list markers to bullets

    addText(cleanedResult, 10, [30, 41, 59]);
  }

  yPosition += 10;

  // Metrics Section
  addSeparator();
  addText('Performance Metrics', 16, [139, 92, 246], true);

  // Create metrics box
  const metricsY = yPosition;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, metricsY - 5, maxWidth, 50, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, metricsY - 5, maxWidth, 50, 'S');

  // Metrics content
  const metricsData = [
    { label: 'Thinking Tokens:', value: data.metrics.thinkingTokens.toLocaleString() },
    { label: 'Input Tokens:', value: data.metrics.inputTokens.toLocaleString() },
    { label: 'Output Tokens:', value: data.metrics.outputTokens.toLocaleString() },
    { label: 'Tool Calls:', value: data.metrics.toolCalls.toString() },
    { label: 'Processing Time:', value: `${(data.metrics.elapsedTime / 1000).toFixed(2)}s` },
  ];

  metricsData.forEach((metric, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = margin + 10 + col * (maxWidth / 2);
    const y = metricsY + row * 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(metric.label, x, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(metric.value, x + 40, y);
  });

  yPosition += 60;

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Generated by Kimi K2 Thinking Demo - Powered by Moonshot AI',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

    // Save the PDF
    const filename = `kimi-k2-report-${Date.now()}.pdf`;
    console.log('[PDF Export] Saving PDF as:', filename);
    doc.save(filename);
    console.log('[PDF Export] PDF saved successfully');
  } catch (error) {
    console.error('[PDF Export] Error creating PDF:', error);
    throw error;
  }
}
