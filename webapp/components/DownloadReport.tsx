"use client";

import { useState } from "react";
import type { RiskAssessment } from "@/lib/types";
import { GRADE_LABELS } from "@/lib/constants";

interface DownloadReportProps {
  result: RiskAssessment;
}

export default function DownloadReport({ result }: DownloadReportProps) {
  const [generating, setGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  async function handleDownload() {
    setGenerating(true);

    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      function checkNewPage(needed: number) {
        if (y + needed > 270) {
          doc.addPage();
          y = 20;
        }
      }

      // header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 58, 47);
      doc.text(`Herbs for ${result.concern_label}`, margin, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(107, 114, 128);
      doc.text(
        "Personalized herb recommendations — for discussion with your healthcare provider",
        margin,
        y
      );
      y += 6;

      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // summary
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);

      doc.text(
        `${result.total_relevant} herbs with evidence for ${result.concern_label}`,
        margin,
        y
      );
      y += 5;
      doc.text(
        `Recommended: ${result.recommended_herbs.length}  |  Caution: ${result.caution_herbs.length}  |  Avoid: ${result.avoid_herbs.length}`,
        margin,
        y
      );
      y += 5;
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
        margin,
        y
      );
      y += 10;

      // recommended herbs
      if (result.recommended_herbs.length > 0) {
        checkNewPage(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(21, 128, 61);
        doc.text("RECOMMENDED FOR YOU", margin, y);
        y += 7;

        for (const herb of result.recommended_herbs) {
          checkNewPage(25);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(31, 41, 55);
          const grade = herb.evidence_grade ? ` [Grade ${herb.evidence_grade}]` : "";
          doc.text(`${herb.herb_name}${grade}`, margin + 2, y);
          y += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81);
          const reasonLines = doc.splitTextToSize(herb.relevance_summary, contentWidth - 4);
          doc.text(reasonLines, margin + 2, y);
          y += reasonLines.length * 4 + 2;

          doc.setTextColor(21, 128, 61);
          doc.text(herb.safety_note, margin + 2, y);
          y += 7;
        }
      }

      // caution herbs
      if (result.caution_herbs.length > 0) {
        checkNewPage(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 83, 9);
        doc.text("USE WITH DOCTOR GUIDANCE", margin, y);
        y += 7;

        for (const herb of result.caution_herbs) {
          checkNewPage(25);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(31, 41, 55);
          const gradeLabel = herb.evidence_grade ? ` [Grade ${herb.evidence_grade}]` : "";
          doc.text(`${herb.herb_name}${gradeLabel}`, margin + 2, y);
          y += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);

          if (herb.relevance_summary) {
            doc.setTextColor(55, 65, 81);
            const relLines = doc.splitTextToSize(herb.relevance_summary, contentWidth - 4);
            doc.text(relLines, margin + 2, y);
            y += relLines.length * 4 + 2;
          }

          for (const caution of herb.cautions) {
            checkNewPage(15);
            doc.setTextColor(55, 65, 81);
            const cautionLines = doc.splitTextToSize(`Warning: ${caution.explanation}`, contentWidth - 6);
            doc.text(cautionLines, margin + 4, y);
            y += cautionLines.length * 4;

            if (caution.clinical_action) {
              doc.setTextColor(180, 83, 9);
              const actionLines = doc.splitTextToSize(`Action: ${caution.clinical_action}`, contentWidth - 6);
              doc.text(actionLines, margin + 4, y);
              y += actionLines.length * 4;
            }
            y += 2;
          }
          y += 3;
        }
      }

      // avoid herbs
      if (result.avoid_herbs.length > 0) {
        checkNewPage(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("NOT SAFE FOR YOU", margin, y);
        y += 7;

        for (const herb of result.avoid_herbs) {
          checkNewPage(20);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(31, 41, 55);
          doc.text(`${herb.herb_name} — AVOID`, margin + 2, y);
          y += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81);
          const reasonLines = doc.splitTextToSize(`Why: ${herb.reason}`, contentWidth - 4);
          doc.text(reasonLines, margin + 2, y);
          y += reasonLines.length * 4 + 7;
        }
      }

      // footer disclaimer
      checkNewPage(30);
      y += 5;
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(156, 163, 175);
      const disclaimerLines = doc.splitTextToSize(result.disclaimer, contentWidth);
      doc.text(disclaimerLines, margin, y);
      y += disclaimerLines.length * 3.5 + 4;

      doc.setFont("helvetica", "normal");
      doc.text(
        "Ayurv — Herb Safety Intelligence | Not a prescription | Educational only",
        margin,
        y
      );

      doc.save(`ayurv-${result.concern.replace(/_/g, "-")}-report.pdf`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="px-4 py-2 text-sm font-medium text-ayurv-primary border border-ayurv-primary rounded-lg hover:bg-ayurv-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      {generating ? "Generating..." : downloaded ? "Downloaded!" : "Download Report"}
    </button>
  );
}
