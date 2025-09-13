import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportService = {
  exportChatToPDF: async (messages: any[]) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.text('FloatChat - Ocean Data Analysis', margin, yPosition);
      yPosition += 20;

      // Add timestamp
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 20;

      // Add messages
      pdf.setFontSize(12);
      messages.forEach((message, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = margin;
        }

        const prefix = message.type === 'user' ? 'User: ' : 'Bot: ';
        const text = `${prefix}${message.content}`;
        
        const splitText = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        pdf.text(splitText, margin, yPosition);
        yPosition += splitText.length * 7 + 10;
      });

      pdf.save('floatchat-conversation.pdf');
    } catch (error) {
      console.error('Export error:', error);
    }
  },

  exportChartToPNG: async (chartElement: HTMLElement) => {
    try {
      const canvas = await html2canvas(chartElement);
      const link = document.createElement('a');
      link.download = 'ocean-data-chart.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Chart export error:', error);
    }
  },
};