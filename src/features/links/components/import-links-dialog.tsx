"use client";

import { useRef, useState } from "react";
import { Upload, Download, CheckCircle, XCircle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { importLinksAction, type ImportResult } from "@/features/links/actions/import-links.action";

const CSV_TEMPLATE =
  "url,title,slug,tags\n" +
  "https://example.com/long-url,My first link,my-link,\"marketing,social\"\n" +
  "https://example.com/another-page,Another link,,brand\n";

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "linkpilot-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parsePreview(text: string): { headers: string[]; rows: string[][]; total: number } {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [], total: 0 };

  const parse = (line: string) => {
    const fields: string[] = [];
    let field = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) { if (c === '"' && line[i + 1] === '"') { field += '"'; i++; } else if (c === '"') { inQ = false; } else { field += c; } }
      else { if (c === '"') { inQ = true; } else if (c === ',') { fields.push(field.trim()); field = ""; } else { field += c; } }
    }
    fields.push(field.trim());
    return fields;
  };

  const first = parse(lines[0]);
  const hasHeader = first.map((h) => h.toLowerCase()).includes("url");
  const headers = hasHeader ? first : ["url", "title", "slug", "tags"];
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return {
    headers,
    rows: dataLines.slice(0, 5).map(parse),
    total: dataLines.length,
  };
}

export function ImportLinksDialog() {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReturnType<typeof parsePreview> | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setCsvText(null);
    setPreview(null);
    setResult(null);
  }

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      toast.error("Please select a .csv file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      setPreview(parsePreview(text));
      setResult(null);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!csvText) return;
    setImporting(true);
    const res = await importLinksAction(csvText);
    setImporting(false);
    if ("error" in res) { toast.error(res.error); return; }
    setResult(res);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Import links from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your links. Required column: <code className="font-mono text-xs">url</code>.
            Optional: <code className="font-mono text-xs">title</code>, <code className="font-mono text-xs">slug</code>, <code className="font-mono text-xs">tags</code>.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Template download */}
            <button
              type="button"
              onClick={downloadTemplate}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <Download className="h-4 w-4 shrink-0" />
              Download CSV template
            </button>

            {/* Drop zone */}
            {!csvText ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <FileText className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Drop your CSV here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>
            ) : (
              /* Preview */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {preview?.total ?? 0} link{preview?.total !== 1 ? "s" : ""} found
                    {(preview?.total ?? 0) > 5 && ` · showing first 5`}
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Clear
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        {preview?.headers.map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold capitalize text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {preview?.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/20">
                          {row.map((cell, j) => (
                            <td key={j} className="max-w-[160px] truncate px-3 py-2 text-foreground">
                              {cell || <span className="text-muted-foreground/40">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button onClick={handleImport} disabled={importing} className="w-full gap-1.5">
                  {importing
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing…</>
                    : <><Upload className="h-4 w-4" /> Import {preview?.total} link{preview?.total !== 1 ? "s" : ""}</>
                  }
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-green-50 dark:bg-green-950/20 p-4">
                <CheckCircle className="h-8 w-8 shrink-0 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{result.created}</p>
                  <p className="text-xs text-green-700/70 dark:text-green-500">imported</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-amber-50 dark:bg-amber-950/20 p-4">
                <XCircle className="h-8 w-8 shrink-0 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{result.skipped.length}</p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-500">skipped</p>
                </div>
              </div>
            </div>

            {result.skipped.length > 0 && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skipped rows</p>
                {result.skipped.map((s) => (
                  <div key={s.row} className="flex gap-2 text-xs">
                    <span className="shrink-0 font-mono text-muted-foreground">row {s.row}</span>
                    <span className="truncate text-foreground">{s.url || "—"}</span>
                    <span className="shrink-0 text-amber-600">· {s.reason}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={reset}>Import another</Button>
              <Button className="flex-1" onClick={() => setOpen(false)}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
