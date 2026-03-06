
/**
 * Utility to generate a Membership Certificate using HTML5 Canvas and a template
 */

interface CertificateData {
    name: string;
    companyName: string;
    designation: string;
    district: string;
    membershipId: string;
    date: string;
}

export const generateCertificate = async (data: CertificateData) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load template image
    const templateImg = new Image();
    templateImg.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
        templateImg.onload = resolve;
        templateImg.onerror = reject;
        templateImg.src = '/certificate_template.png';
    });

    // Set canvas dimensions to match template
    canvas.width = templateImg.width;
    canvas.height = templateImg.height;

    // Draw Template
    ctx.drawImage(templateImg, 0, 0);

    // Styling
    ctx.fillStyle = '#002366'; // Deep Navy Blue
    ctx.textAlign = 'center';

    // Scale coordinates based on width (assuming original template is roughly 1500px wide)
    const scale = canvas.width / 1500;

    // Membership No (Top Right - Positioned exactly on the line)
    ctx.font = `bold ${Math.round(22 * scale)}px "Inter", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(data.membershipId, canvas.width * 0.77, canvas.height * 0.138);

    // Name (Prominent but not overwhelming)
    ctx.font = `900 ${Math.round(54 * scale)}px "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(data.name.toUpperCase(), canvas.width * 0.5, canvas.height * 0.482);

    // Details Styling (Left aligned)
    ctx.textAlign = 'left';

    // Company (Balanced size)
    ctx.font = `900 ${Math.round(32 * scale)}px "Inter", sans-serif`;
    ctx.fillText(data.companyName.toUpperCase(), canvas.width * 0.42, canvas.height * 0.522);

    // Designation (Clean and readable)
    ctx.font = `bold ${Math.round(24 * scale)}px "Inter", sans-serif`;
    ctx.fillText(data.designation || '', canvas.width * 0.42, canvas.height * 0.64);

    // District
    ctx.fillText(data.district || '', canvas.width * 0.42, canvas.height * 0.675);

    // Validity / Date (Natural fit)
    ctx.font = `bold ${Math.round(30 * scale)}px "Inter", sans-serif`;
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const validity = `${data.date} to ${expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    ctx.fillText(validity, canvas.width * 0.43, canvas.height * 0.71);

    // Trigger Download
    const link = document.createElement('a');
    link.download = `APARDA_Certificate_${data.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
};
