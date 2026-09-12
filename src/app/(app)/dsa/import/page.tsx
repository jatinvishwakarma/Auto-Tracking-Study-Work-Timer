"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import * as XLSX from "xlsx";

type ParsedRow = Record<string, string>;

export default function DSAImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [batchName, setBatchName] = useState("");

  // Column Mapping State
  const [mapTitle, setMapTitle] = useState("");
  const [mapTopic, setMapTopic] = useState("");
  const [mapDiff, setMapDiff] = useState("");
  const [mapStatus, setMapStatus] = useState("");
  const [mapPattern, setMapPattern] = useState("");
  const [mapSubTopic, setMapSubTopic] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setBatchName(`Import: ${selectedFile.name.replace(/\.[^/.]+$/, "")}`);

    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();

    if (fileType === 'csv') {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results: { data: unknown[]; meta: { fields?: string[] } }) => {
          if (results.data && results.data.length > 0) {
            setupPreview(results.data as ParsedRow[], results.meta.fields || []);
          }
        },
        error: (err: Error) => setError(`CSV Parse Error: ${err.message}`)
      });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
           
          if (data.length > 1) {
            const headers = data[0] || [];
            const rows = data.slice(1).map(row => {
              const obj: ParsedRow = {};
              headers.forEach((header, i) => {
                obj[header] = row[i] ?? "";
              });
              return obj;
            });
            setupPreview(rows, headers);
          }
        } catch {
          setError("Failed to parse Excel file. Make sure it is valid.");
        }
      };
      reader.readAsBinaryString(selectedFile);
    } else {
      setError("Unsupported file format. Please upload a .csv or .xlsx file.");
    }
  };

  const setupPreview = (data: ParsedRow[], headers: string[]) => {
    setColumns(headers);
    setPreviewData(data.slice(0, 5)); // Preview first 5 rows

    // Auto-guess mapping based on common column names
    const guessMap = (possibleNames: string[]) => {
      return headers.find(h => possibleNames.includes(h.toLowerCase().trim())) || "";
    };

    setMapTitle(guessMap(["title", "problem", "name", "question"]));
    setMapTopic(guessMap(["topic", "category", "tag", "pattern"]));
    setMapDiff(guessMap(["difficulty", "level", "diff"]));
    setMapStatus(guessMap(["status", "state", "progress"]));
    setMapPattern(guessMap(["pattern", "Pattern"]));
    setMapSubTopic(guessMap(["subtopic", "sub-topic", "sub topic", "sub-topic", "subtopic", "Sub-Topic", "Sub Topic"]));
  };

  const handleImport = async () => {
    if (!file || !mapTitle) {
      setError("Please select a file and map at least the Title column.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Re-parse the full file depending on type
      let fullData: ParsedRow[] = [];
      
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'csv') {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        fullData = result.data as ParsedRow[];
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json<ParsedRow>(wb.Sheets[wsname]);
        fullData = data;
      }

      // Transform data based on mapping
      const mappedData = fullData.map(row => ({
        title: row[mapTitle] || "Untitled",
        topic: mapTopic ? row[mapTopic] : "General",
        difficulty: mapDiff ? normalizeDifficulty(row[mapDiff]) : "Medium",
        status: mapStatus ? normalizeStatus(row[mapStatus]) : "NotStarted",
        pattern: mapPattern ? row[mapPattern] : undefined,
        subTopic: mapSubTopic ? row[mapSubTopic] : undefined,
      })).filter(p => p.title && p.title !== "Untitled");

      const response = await fetch("/api/dsa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName,
          problems: mappedData
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to import data");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dsa");
        router.refresh();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to normalize data into Prisma Enums
  const normalizeDifficulty = (val: string) => {
    if (!val) return "Medium";
    const low = val.toLowerCase().trim();
    if (low === "easy" || low === "e") return "Easy";
    if (low === "hard" || low === "h") return "Hard";
    return "Medium";
  };

  const normalizeStatus = (val: string) => {
    if (!val) return "NotStarted";
    const low = val.toLowerCase().trim();
    if (low.includes("solve") || low === "done" || low === "yes") return "Solved";
    if (low.includes("progress") || low === "doing") return "InProgress";
    if (low.includes("review") || low === "revise") return "NeedsReview";
    return "NotStarted";
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/dsa" className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Import Data</h1>
          <p className="text-[var(--text-muted)] mt-1">Upload your existing spreadsheet (CSV or XLSX) from Striver&apos;s sheet, NeetCode, or your own.</p>
        </div>
      </header>

      {/* Upload Zone */}
      {!file && (
        <div className="card border-dashed border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)]/30 hover:bg-[var(--bg-elevated)] transition-colors p-12 text-center relative cursor-pointer group">
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex justify-center mb-4 text-[var(--accent)] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
            <FileSpreadsheet size={48} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Click or drag file here</h3>
          <p className="text-[var(--text-muted)] mt-2">Supports .csv and .xlsx files</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-[var(--error-dim)] border border-[var(--error)] text-[var(--error-text)] flex gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[var(--success-dim)] border border-[var(--success)] text-[var(--success-text)] flex gap-3 items-center">
          <CheckCircle2 size={24} />
          <p className="font-semibold">Import successful! Redirecting to DSA Tracker...</p>
        </div>
      )}

      {/* Column Mapping & Preview */}
      {file && !success && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">1. Map Columns</h2>
              <button 
                onClick={() => { setFile(null); setPreviewData([]); }}
                className="text-sm text-[var(--error)] hover:underline"
              >
                Change File
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Batch Name</label>
                <input type="text" className="input" value={batchName} onChange={e => setBatchName(e.target.value)} />
              </div>
              <div className="hidden sm:block"></div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Title / Problem <span className="text-[var(--error)]">*</span></label>
                <select className="input" value={mapTitle} onChange={e => setMapTitle(e.target.value)}>
                  <option value="">-- Ignore --</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Topic / Category</label>
                <select className="input" value={mapTopic} onChange={e => setMapTopic(e.target.value)}>
                  <option value="">-- Ignore (Sets to &quot;General&quot;) --</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Difficulty</label>
                <select className="input" value={mapDiff} onChange={e => setMapDiff(e.target.value)}>
                  <option value="">-- Ignore (Sets to &quot;Medium&quot;) --</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Status</label>
                <select className="input" value={mapStatus} onChange={e => setMapStatus(e.target.value)}>
                  <option value="">-- Ignore (Sets to &quot;Not Started&quot;) --</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Pattern</label>
                <select className="input" value={mapPattern} onChange={e => setMapPattern(e.target.value)}>
                  <option value="">-- Ignore --</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Sub-Topic</label>
                <select className="input" value={mapSubTopic} onChange={e => setMapSubTopic(e.target.value)}>
                  <option value="">-- Ignore --</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">2. Preview Data</h2>
            <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                  <tr>
                    <th className="p-3 text-[var(--text-secondary)] font-semibold">Title</th>
                    <th className="p-3 text-[var(--text-secondary)] font-semibold">Topic</th>
                    <th className="p-3 text-[var(--text-secondary)] font-semibold">Difficulty</th>
                    <th className="p-3 text-[var(--text-secondary)] font-semibold">Status</th>
                    <th className="p-3 text-[var(--text-secondary)] font-semibold">Pattern</th>
                    <th className="p-3 text-[var(--text-secondary)] font-semibold">Sub-Topic</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                      <td className="p-3 font-medium">{mapTitle ? row[mapTitle] : "-"}</td>
                      <td className="p-3 text-[var(--text-muted)]">{mapTopic ? row[mapTopic] : "-"}</td>
                      <td className="p-3 text-[var(--text-muted)]">{mapDiff ? normalizeDifficulty(row[mapDiff]) : "-"}</td>
                      <td className="p-3 text-[var(--text-muted)]">{mapStatus ? normalizeStatus(row[mapStatus]) : "-"}</td>
                      <td className="p-3 text-[var(--text-muted)]">{mapPattern ? row[mapPattern] : "-"}</td>
                      <td className="p-3 text-[var(--text-muted)]">{mapSubTopic ? row[mapSubTopic] : "-"}</td>
                    </tr>
                  ))}
                  {previewData.length === 5 && (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)]">
                        Showing first 5 rows only
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleImport}
                disabled={loading || !mapTitle}
                className="btn btn-primary"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                {loading ? "Importing..." : "Start Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}