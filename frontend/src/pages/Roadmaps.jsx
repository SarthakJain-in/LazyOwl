import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { roadmapService } from "../services/roadmapService";
import {
  Map,
  Plus,
  Sparkles,
  X,
  Loader2,
  Pin,
  PinOff,
  FileUp,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function Roadmaps() {
  const {
    roadmaps,
    fetchRoadmaps,
    isLoading,
    generateRoadmap,
    isGenerating,
    isImporting,
    importRoadmapFromPDF,
    toggleRoadmapActive,
    addRoadmap,
  } = useAppStore();

  // AI Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");

  // PDF Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCategory, setImportCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic) return;

    await generateRoadmap(topic, category || "General");

    // Close modal and reset form after generation
    setIsModalOpen(false);
    setTopic("");
    setCategory("");
  };

  // --- PDF Import Handlers ---
  const handleFileSelect = (file) => {
    setImportError("");
    setImportSuccess("");
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else if (file) {
      setImportError("Only PDF files are allowed.");
      setSelectedFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setImportError("");
    setImportSuccess("");

    try {
      await importRoadmapFromPDF(selectedFile, importCategory || "Imported Path");
      setImportSuccess("Roadmap imported successfully! 🎉");
      // Auto-close after a brief moment
      setTimeout(() => {
        setIsImportModalOpen(false);
        setSelectedFile(null);
        setImportCategory("");
        setImportSuccess("");
        setImportError("");
      }, 1500);
    } catch (error) {
      setImportError(error.message || "Failed to import roadmap. Please try again.");
    }
  };

  const handleDownloadSample = async () => {
    try {
      await roadmapService.downloadSamplePDF();
    } catch (error) {
      console.error("Error downloading sample:", error);
    }
  };

  const closeImportModal = () => {
    if (isImporting) return; // Don't allow closing while importing
    setIsImportModalOpen(false);
    setSelectedFile(null);
    setImportCategory("");
    setImportError("");
    setImportSuccess("");
  };

  if (isLoading && roadmaps.length === 0) {
    return (
      <div className="animate-pulse text-forge-textSecondary">
        Loading your learning paths...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-forge-textPrimary">
            Learning Paths
          </h2>
          <p className="text-forge-textSecondary mt-1">
            Map out your journey, module by module.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/roadmaps/new"
            className="flex items-center gap-2 bg-forge-surface border border-forge-border text-forge-textPrimary px-4 py-2 rounded-lg font-semibold hover:border-forge-accent transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create Path</span>
          </Link>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-forge-surface border border-forge-border text-forge-textPrimary px-4 py-2 rounded-lg font-semibold hover:border-emerald-500 hover:text-emerald-500 transition-colors shadow-sm"
          >
            <FileUp size={18} />
            <span className="hidden sm:inline">Import PDF</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-forge-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-forge-accentHover transition-colors shadow-sm"
          >
            <Sparkles size={18} />
            <span className="hidden sm:inline">AI Generate Pathway</span>
          </button>
        </div>
      </div>

      {/* Roadmaps List */}
      {roadmaps.length === 0 ? (
        <div className="bg-forge-surface p-10 rounded-2xl border border-forge-border text-center">
          <p className="text-forge-textSecondary">
            No learning paths found. Let AI generate one for you!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {roadmaps.map((roadmap) => (
            <div key={roadmap._id} className="relative group">
              {/* The Pin Button */}
              <button
                onClick={(e) => {
                  e.preventDefault(); // Stops the Link from triggering
                  e.stopPropagation();
                  toggleRoadmapActive(roadmap._id);
                }}
                className={`absolute top-5 right-5 p-2 rounded-lg z-10 transition-all duration-200 ${
                  roadmap.isActive
                    ? "bg-forge-accent text-white shadow-md opacity-100"
                    : "bg-forge-surface border border-forge-border text-forge-textSecondary hover:text-forge-accent opacity-0 group-hover:opacity-100 shadow-sm"
                }`}
                title={
                  roadmap.isActive ? "Unpin from Dashboard" : "Pin to Dashboard"
                }
              >
                {roadmap.isActive ? <Pin size={16} /> : <PinOff size={16} />}
              </button>

              <Link
                to={`/roadmaps/${roadmap._id}`}
                className="block bg-forge-surface border border-forge-border rounded-2xl shadow-sm overflow-hidden transition-all hover:border-forge-accent hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="p-6 border-b border-forge-border bg-forge-bg/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg text-forge-accent">
                        <Map size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-forge-textPrimary">
                        {roadmap.title}
                      </h3>
                    </div>
                    {/* Added mr-10 so the text doesn't hide behind the absolute pin button */}
                    <span className="text-xs font-bold text-forge-accent bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider mr-10">
                      {roadmap.category || "General"}
                    </span>
                  </div>

                  <div className="w-full bg-forge-border rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-forge-accent h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${roadmap.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* AI Generation Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forge-textPrimary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-forge-surface w-full max-w-md rounded-2xl shadow-2xl border border-forge-border p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-forge-textSecondary hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-forge-accent">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-forge-textPrimary">
                  AI Roadmap Architect
                </h3>
                <p className="text-xs text-forge-textSecondary mt-0.5">
                  Powered by Gemini 2.5 Flash
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                  What do you want to learn?
                </label>
                <input
                  type="text"
                  placeholder="e.g., GraphQL, Three.js, System Design..."
                  className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Frontend, DevOps, Math..."
                  className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !topic}
                className="w-full py-3 mt-2 bg-forge-accent text-white rounded-xl font-bold hover:bg-forge-accentHover transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating your path...
                  </>
                ) : (
                  "Build My Roadmap"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PDF Import Modal Overlay */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-forge-textPrimary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-forge-surface w-full max-w-md rounded-2xl shadow-2xl border border-forge-border p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={closeImportModal}
              disabled={isImporting}
              className="absolute top-4 right-4 text-forge-textSecondary hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                <FileUp size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-forge-textPrimary">
                  Import from PDF
                </h3>
                <p className="text-xs text-forge-textSecondary mt-0.5">
                  Upload a roadmap PDF — AI parses it for you
                </p>
              </div>
            </div>

            <form onSubmit={handleImport} className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isImporting && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50/10"
                    : selectedFile
                    ? "border-emerald-500 bg-emerald-50/5"
                    : "border-forge-border hover:border-emerald-500/50 hover:bg-forge-bg/50"
                } ${isImporting ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                  disabled={isImporting}
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                      <FileText size={20} className="text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-forge-textPrimary truncate max-w-[200px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-forge-textSecondary">
                        {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileUp
                      size={32}
                      className="mx-auto text-forge-textSecondary mb-2"
                    />
                    <p className="text-sm font-semibold text-forge-textPrimary">
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-xs text-forge-textSecondary mt-1">
                      Max 10 MB • PDF files only
                    </p>
                  </>
                )}
              </div>

              {/* Category Input */}
              <div>
                <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Frontend, DevOps, Math..."
                  className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-emerald-500 transition-colors"
                  value={importCategory}
                  onChange={(e) => setImportCategory(e.target.value)}
                  disabled={isImporting}
                />
              </div>

              {/* Download Sample */}
              <button
                type="button"
                onClick={handleDownloadSample}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-forge-textSecondary hover:text-emerald-500 transition-colors"
              >
                <Download size={14} />
                Download sample PDF template
              </button>

              {/* Error Message */}
              {importError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Success Message */}
              {importSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isImporting || !selectedFile}
                className="w-full py-3 mt-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Parsing & creating roadmap...</span>
                  </>
                ) : (
                  <>
                    <FileUp size={18} />
                    Import Roadmap
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
