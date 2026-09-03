"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  ShieldCheck,
  Zap,
  Globe2,
  Database,
  Layers,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Smartphone,
  Cpu,
  RefreshCw,
  Server,
  Lock,
  MessageSquare
} from "lucide-react";

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "evaluator" | "architecture">("overview");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20">
      {/* Top Banner & Navigation */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Portal</span>
            </Link>
            <div className="h-4 w-[1px] bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> LoopBack AI Guide & Architecture
              </span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                Razorpay Edition
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "overview" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("features")}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "features" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Core Engine
            </button>
            <button
              onClick={() => setActiveTab("evaluator")}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "evaluator" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              2-Min Evaluation Tour
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "architecture" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tech Architecture
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-full">
                  Autonomous Dead-Letter Reconciliation
                </span>
                <h1 className="text-3xl lg:text-4xl font-black text-white mt-4 tracking-tight leading-tight">
                  Recovering Unmapped Indian Inflows via Conversational Settlement
                </h1>
                <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                  LoopBack AI eliminates manual suspense ledger reconciliation. When payments arrive with missing virtual account numbers (VANs), mismatched TDS splits, or truncated remitters, LoopBack AI maps signals and interacts autonomously with senders across 8 Indian languages to achieve instant ledger clearance.
                </p>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-emerald-400 font-mono">0.4s</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Signal Mapping Latency</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-cyan-400 font-mono">8</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Indian Languages Supported</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-400 font-mono">100%</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Immutable Audit Trail</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Suspense Queue Scoring</h3>
                <p className="text-xs text-slate-400 mt-1">Multi-factor signal correlation combining fuzzy VANs, UTR prefixes, exact amounts, and remitter timing.</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Live Carrier Gateway</h3>
                <p className="text-xs text-slate-400 mt-1">Dispatches interactive prompt cards directly to customer devices with real-time settlement callbacks.</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 mb-3">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Multi-Lingual AI</h3>
                <p className="text-xs text-slate-400 mt-1">Auto-detects Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, Bengali, and English in natural conversation.</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Double-Entry Audit</h3>
                <p className="text-xs text-slate-400 mt-1">Every AI decision, user override, and carrier callback is recorded in a tamper-proof audit trail.</p>
              </div>
            </div>
          </div>
        )}

        {/* CORE FEATURES TAB */}
        {activeTab === "features" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Cpu className="w-5 h-5 text-emerald-400" /> Deep-Dive: Core System Capabilities
              </h2>

              <div className="space-y-6 text-xs text-slate-300">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 1. Autonomous Signal Scoring Algorithm
                  </h3>
                  <p className="mt-2 leading-relaxed">
                    When an unmatched inflow enters the dead-letter queue, LoopBack AI compares it against pending unpaid invoices using 4 distinct weights:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Exact Amount / TDS Match</span>
                      <span className="text-emerald-400 font-black text-sm">40% Weight</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Fuzzy Remitter Name</span>
                      <span className="text-cyan-400 font-black text-sm">30% Weight</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Virtual Account Prefix</span>
                      <span className="text-purple-400 font-black text-sm">20% Weight</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Temporal Timing Proximity</span>
                      <span className="text-amber-400 font-black text-sm">10% Weight</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 2. Dual-Mode Pilot: Autonomous AI vs. Manual Operator
                  </h3>
                  <p className="mt-2 leading-relaxed">
                    The portal provides an **AI Pilot Switch** in the top navigation bar:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                    <li><strong className="text-emerald-400">Autonomous Pilot (ON)</strong>: When customer approves via carrier, the AI agent autonomously credits the merchant revenue, resolves the suspense ledger, and issues confirmation receipts with zero human latency.</li>
                    <li><strong className="text-amber-400">Manual Review (OFF)</strong>: Customer replies are queued for staff review with visual 1-click execution actions (<code className="text-slate-200">Release Credit</code> / <code className="text-slate-200">Instant Refund</code>).</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span> 3. Conversational Multi-Lingual Intent Parsing
                  </h3>
                  <p className="mt-2 leading-relaxed">
                    Customer messages are parsed in real time to understand approval, rejection, and inquiries in their preferred language:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 font-mono text-[11px]">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">Marathi: होय / नाही</div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">Hindi: हाँ / नहीं</div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">Gujarati: હા / ના</div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">Tamil: ஆம் / இல்லை</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2-MIN EVALUATOR TOUR */}
        {activeTab === "evaluator" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Razorpay 2-Minute Interactive Evaluation Walkthrough</h2>
                  <p className="text-xs text-slate-400">Quick steps to test every subsystem in real-time</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <div>
                    <h4 className="font-bold text-white">1-Click Login as Any Role</h4>
                    <p className="text-slate-400 mt-1">Use the 5 Quick Login buttons on the login screen (Admin, Treasury Auditor, Merchant Ops Lead, Risk Officer, Escrow Specialist) to sign in with zero typing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <div>
                    <h4 className="font-bold text-white">Inspect Dead-Letter Suspense Queue</h4>
                    <p className="text-slate-400 mt-1">Look at the left panel. Each transaction shows real-time signal match confidence (e.g. 88%, 55%, 3%). Click on **Prathamesh Tirmare (₹50,000)** to open the Live Gateway.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <div>
                    <h4 className="font-bold text-white">Interact with Live Gateway (In-Portal or Telegram Mobile)</h4>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      <strong>Option A (In-Portal Simulator):</strong> Test operator replies by typing in the chatbox on the right.
                      <br />
                      <strong>Option B (Live Phone Delivery):</strong>
                      <br />
                      1. Click <span className="text-purple-400 font-bold">"Pair Test Phone"</span> in the top navigation bar and enter your mobile number.
                      <br />
                      2. Open Telegram on <strong>that device</strong>, search for <code className="text-cyan-400 font-mono">@loopback_settle_ai_bot</code>, and tap <strong>START</strong>.
                      <br />
                      3. Click <strong>Open Live Gateway</strong> on any transaction in the portal to receive rich interactive cards with 4 action buttons (<code className="text-emerald-400">Approve</code>, <code className="text-rose-400">Refund</code>, <code className="text-cyan-400">Language</code>, <code className="text-purple-400">Invoice</code>) directly on your device!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <div>
                    <h4 className="font-bold text-white">Test Edge-Case Scenarios</h4>
                    <p className="text-slate-400 mt-1">Click **Demo Cases: TDS 2% Inflow** or **Fuzzy VAN** in the top navigation bar to inject complex enterprise dead-letter inflows into the queue.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">5</span>
                  <div>
                    <h4 className="font-bold text-white">View Immutable Audit Trail</h4>
                    <p className="text-slate-400 mt-1">Click **Audit Trail** in the header to view the timestamped, immutable ledger records of every settlement decision.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TECHNICAL ARCHITECTURE */}
        {activeTab === "architecture" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Server className="w-5 h-5 text-cyan-400" /> Enterprise Technology Stack & Resilience
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-2">Frontend</span>
                  <p className="text-white font-bold text-sm">Next.js 14 & TailwindCSS</p>
                  <p className="text-slate-400 mt-2 leading-relaxed">
                    Real-time polling state machines, responsive ledger drawers, optimistic operator dispatching, and zero-flicker UI updates.
                  </p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-2">Backend Engine</span>
                  <p className="text-white font-bold text-sm">FastAPI & Python 3.12+</p>
                  <p className="text-slate-400 mt-2 leading-relaxed">
                    Asynchronous REST endpoints, webhook ingestion engines for Meta Cloud API & Twilio, and automated background seeding.
                  </p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-2">Database Layer</span>
                  <p className="text-white font-bold text-sm">MySQL 8.0 with SQLite Fallback</p>
                  <p className="text-slate-400 mt-2 leading-relaxed">
                    Automated service discovery with automatic retry loop, self-healing fallbacks, and transactional foreign key integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
