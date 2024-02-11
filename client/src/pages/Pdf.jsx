import React, { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { useParams } from "react-router";
import { useSelector } from "react-redux";

export default function Pdf() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/auth/get/${params.pdfId}`);
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const pdfBlob = await res.blob();
        setFile(pdfBlob);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPdf();
  }, [params.pdfId]);

  useEffect(() => {
    const loadPdf = async () => {
      if (!file) return;

      try {
        const pdfBytes = await file.arrayBuffer();
        const loadedPdfDoc = await PDFDocument.load(pdfBytes);
        setPdfDoc(loadedPdfDoc);
      } catch (error) {
        console.error("Failed to load PDF:", error);
      }
    };

    loadPdf();
  }, [file]);

  useEffect(() => {
    const extractPages = async () => {
      if (!pdfDoc) return;

      const pages = [];
      const pageCount = pdfDoc.getPageCount();

      for (let i = 0; i < pageCount; i++) {
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
        const modifiedPdfBytes = await newPdfDoc.save();
        pages.push(new Blob([modifiedPdfBytes]));
      }

      setPdfPages(pages);
    };

    extractPages();
  }, [pdfDoc]);

  const handleCheckboxChange = (index) => {
    const selectedIndex = selectedPages.indexOf(index);
    if (selectedIndex === -1) {
      setSelectedPages([...selectedPages, index]);
    } else {
      setSelectedPages(selectedPages.filter((i) => i !== index));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      if (!pdfDoc) return;

      const updatedPdfDoc = await PDFDocument.create();
      const pagesToRemove = selectedPages.map((index) => index - 1);
      const pageIndicesToKeep = Array.from(
        { length: pdfDoc.getPageCount() },
        (_, i) => i
      ).filter((index) => !pagesToRemove.includes(index));

      for (const index of pageIndicesToKeep) {
        const [copiedPage] = await updatedPdfDoc.copyPages(pdfDoc, [index]);
        updatedPdfDoc.addPage(copiedPage);
      }

      const modifiedPdfBytes = await updatedPdfDoc.save();
      setFile(new Blob([modifiedPdfBytes]));
      setSelectedPages([]);
    } catch (error) {
      console.error("Failed to delete selected pages:", error);
    }
  };

  const handleDownloadModifiedPdf = async () => {
    try {
      if (!pdfDoc) return;

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedPdfBlob = new Blob([modifiedPdfBytes], {
        type: "application/pdf",
      });
      const url = window.URL.createObjectURL(modifiedPdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "modified_pdf.pdf"; // You can change the filename here
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download modified PDF:", error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleDownloadModifiedPdf}
        >
          Download Modified PDF
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </button>
      </div>
      {pdfPages.map((pageBlob, index) => (
        <div key={`page_${index + 1}`} className="mb-4">
          <embed
            src={URL.createObjectURL(pageBlob)}
            type="application/pdf"
            width="100%"
            height="600px"
          />
          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              checked={selectedPages.includes(index + 1)}
              onChange={() => handleCheckboxChange(index + 1)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2">Page {index + 1}</span>
          </label>
        </div>
      ))}
    </div>
  );
}
