"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Clock, FileText, Download } from "lucide-react";
import { AuditLog } from "@/types";

export default function AuditTrailPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/audit-trail")
            .then((res) => res.json())
            .then((data) => {
                setLogs(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed fetching audit logs:", err);
                setLoading(false);
            });
    }, []);

    const exportCSV = () => {
        if (logs.length === 0) return;
        const headers = "ID,Transaction_ID,Action,Timestamp,Details\n";
        const rows = logs
            .map((l) => `${l.id},${l.transaction_id},"${l.action}","${l.timestamp}","${l.details.replace(/"/g, '""')}"`)
            .join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `LoopBack_Audit_Trail_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Overview
                        </Link>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            Compliance & Decision Audit Trail
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportCSV}
                            disabled={logs.length === 0}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                        >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            Export Audit CSV
                        </button>
                        <span className="text-xs text-slate-400 font-mono">Immutable Action Log (RBI / NPCI Compliant)</span>
                    </div>
                </div>

                <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 text-sm">Loading audit records...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-sm">
                            No automated actions logged yet. Run a batch to generate audit entries.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {logs.map((log) => (
                                <div key={log.id} className="p-5 flex items-start justify-between hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-semibold text-xs text-emerald-400 bg-emerald-950 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                                                    {log.action}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono">Tx ID #{log.transaction_id}</span>
                                            </div>
                                            <p className="text-sm text-slate-200 mt-1.5">{log.details}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}