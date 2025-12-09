import { jsPDF } from "jspdf";

export const certificateService = {
    generateCertificate: (userName, courseTitle, completionDate = new Date()) => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();

        // Background
        doc.setFillColor(250, 250, 250);
        doc.rect(0, 0, width, height, "F");

        // Border
        doc.setLineWidth(2);
        doc.setDrawColor(79, 70, 229); // Primary color
        doc.rect(10, 10, width - 20, height - 20);

        // Inner Border
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.rect(15, 15, width - 30, height - 30);

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(40);
        doc.setTextColor(79, 70, 229);
        doc.text("Certificate of Completion", width / 2, 50, { align: "center" });

        // Subtext
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.text("This certifies that", width / 2, 75, { align: "center" });

        // Name
        doc.setFont("times", "bolditalic");
        doc.setFontSize(36);
        doc.setTextColor(0, 0, 0);
        doc.text(userName, width / 2, 95, { align: "center" });

        // Line under name
        doc.setLineWidth(0.5);
        doc.setDrawColor(100, 100, 100);
        doc.line(width / 2 - 60, 100, width / 2 + 60, 100);

        // Course Text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.text("has successfully completed the course", width / 2, 120, { align: "center" });

        // Course Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(30, 30, 30);
        doc.text(courseTitle, width / 2, 135, { align: "center" });

        // Date
        const dateStr = completionDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Completed on ${dateStr}`, width / 2, 155, { align: "center" });

        // Signature Area
        doc.setFontSize(14);
        doc.text("HALS Platform", width / 2, 180, { align: "center" });
        doc.setFontSize(10);
        doc.text("Official Certification", width / 2, 185, { align: "center" });

        // Save
        doc.save(`${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
    }
};
