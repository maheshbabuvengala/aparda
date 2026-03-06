
/**
 * Utility to generate a premium PNG receipt using HTML5 Canvas
 */

interface ReceiptData {
    companyName: string;
    partnerName: string;
    orderId: string;
    amount: number;
    date: string;
    logoUrl?: string;
}

export const generateReceipt = async (data: ReceiptData) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions (A5 aspect ratio approx)
    canvas.width = 800;
    canvas.height = 1100;

    // Background - Clean White
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sidebar - AP-ARDA Blue
    ctx.fillStyle = '#1e293b'; // blue-950
    ctx.fillRect(0, 0, 15, canvas.height);

    // Header Section - Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = gradient;
    ctx.fillRect(15, 0, canvas.width - 15, 200);

    // Logo Background - Circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(100, 100, 60, 0, Math.PI * 2);
    ctx.fill();

    // Helper to draw image
    const drawImage = (url: string, x: number, y: number, w: number, h: number): Promise<void> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.drawImage(img, x, y, w, h);
                resolve();
            };
            img.onerror = () => resolve(); // Silently fail image but continue
            img.src = url;
        });
    };

    // Draw AP-ARDA Logo (using absolute path or public URL)
    await drawImage('/image.png', 55, 55, 90, 90);

    // Title Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px Inter, sans-serif';
    ctx.fillText('AP-ARDA', 180, 85);

    ctx.fillStyle = '#fbbf24'; // yellow-400
    ctx.font = '700 14px Inter, sans-serif';
    ctx.fillText('ANDHRA PRADESH', 180, 110);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillText('OFFICIAL REGISTRATION RECEIPT', 180, 140);

    // Receipt Number & Date (Header Right)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px Inter, sans-serif';
    ctx.fillText(`RECEIPT NO: ${data.orderId.toUpperCase()}`, canvas.width - 40, 85);
    ctx.font = '500 14px Inter, sans-serif';
    ctx.fillText(`DATE: ${data.date}`, canvas.width - 40, 110);
    ctx.textAlign = 'left';

    // Content Section
    let currentY = 300;

    // "Received From" Label
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = '900 12px Inter, sans-serif';
    ctx.fillText('RECEIVED FROM', 60, currentY);
    currentY += 40;

    // Company Name
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = '900 32px Inter, sans-serif';
    ctx.fillText(data.companyName.toUpperCase(), 60, currentY);
    currentY += 40;

    // Partner Name
    ctx.fillStyle = '#475569'; // slate-600
    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillText(`Attn: ${data.partnerName}`, 60, currentY);
    currentY += 80;

    // Separator line
    ctx.strokeStyle = '#f1f5f9'; // slate-100
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, currentY);
    ctx.lineTo(canvas.width - 60, currentY);
    ctx.stroke();
    currentY += 60;

    // Details Table Header
    ctx.fillStyle = '#94a3b8';
    ctx.font = '900 12px Inter, sans-serif';
    ctx.fillText('DESCRIPTION', 60, currentY);
    ctx.textAlign = 'right';
    ctx.fillText('AMOUNT', canvas.width - 60, currentY);
    ctx.textAlign = 'left';
    currentY += 40;

    // Details Content
    ctx.fillStyle = '#1e293b';
    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillText('Partner Registration Fee', 60, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`₹${data.amount.toLocaleString()}`, canvas.width - 60, currentY);
    ctx.textAlign = 'left';
    currentY += 60;

    // Total Section
    ctx.fillStyle = '#f8fafc'; // slate-50
    ctx.fillRect(60, currentY, canvas.width - 120, 100);

    currentY += 60;
    ctx.fillStyle = '#1e293b';
    ctx.font = '900 14px Inter, sans-serif';
    ctx.fillText('TOTAL AMOUNT PAID', 90, currentY);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#2563eb'; // blue-600
    ctx.font = '900 28px Inter, sans-serif';
    ctx.fillText(`₹${data.amount.toLocaleString()}`, canvas.width - 90, currentY);
    ctx.textAlign = 'left';

    currentY += 150;

    // Payment Status Stamp
    ctx.save();
    ctx.translate(canvas.width - 200, currentY);
    ctx.rotate(-0.1);
    ctx.strokeStyle = '#22c55e'; // green-500
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 180, 70);
    ctx.fillStyle = '#22c55e';
    ctx.font = '900 24px Inter, sans-serif';
    ctx.fillText('PAID', 55, 45);
    ctx.restore();

    // Footer Info
    currentY = canvas.height - 150;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillText('This is a computer generated receipt and does not require a physical signature.', 60, currentY);
    currentY += 25;
    ctx.fillText('Amaravati Region Developers Association (AP-ARDA)', 60, currentY);
    currentY += 20;
    ctx.fillText('Contact: support@aparda.com | +91 9177142464', 60, currentY);

    // Decorative Element Bottom Right
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height - 100);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width - 100, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Trigger Download
    const link = document.createElement('a');
    link.download = `APARDA_Receipt_${data.orderId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};
