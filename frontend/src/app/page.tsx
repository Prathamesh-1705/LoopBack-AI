"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  fetchMetrics,
  fetchTransactions,
  runRecoveryBatch,
  archiveSettledRecords,
  resetDatabase,
  loginUser,
  registerUser,
  fetchCurrentUser,
  fetchOrgStatus,
  testDbConnection,
  setupOrganization,
  pairTesterDevice,
  getMessagePreview,
  pollIncomingReplies,
  resendVerificationPrompt,
  manualExecuteSettlement,
  sendOperatorReply,
  loadScenario
} from "@/lib/api";
import { Transaction, DashboardMetrics } from "@/types";
import {
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  ArrowRightLeft,
  DollarSign,
  Upload,
  FileSpreadsheet,
  Search,
  Sparkles,
  Layers,
  Flame,
  UserCheck,
  LogOut,
  ArrowRight,
  PlugZap,
  Server,
  XCircle,
  CheckCheck,
  User,
  Bot,
  ToggleLeft,
  ToggleRight,
  Check,
  RotateCcw,
  Send,
  MessageSquare,
  History,
  HelpCircle,
  Info
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "staff" | "customer";
  senderName: string;
  text: string;
  timestamp: string;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [inspectTx, setInspectTx] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ text: string; isError: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Pilot Switch & Control States
  const [aiAutonomousPilot, setAiAutonomousPilot] = useState(true);
  const [manualPendingAction, setManualPendingAction] = useState<"YES_PENDING_MANUAL_APPROVAL" | "NO_PENDING_MANUAL_REFUND" | null>(null);
  const [operatorInput, setOperatorInput] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [resendingPrompt, setResendingPrompt] = useState(false);

  // Ledger Filter & Grace-Period Auto-Clear State
  const [ledgerTab, setLedgerTab] = useState<"active" | "settled" | "all">("active");
  const [resolvedAtTimestamps, setResolvedAtTimestamps] = useState<Record<number, number>>({});

  // Realtime Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Onboarding & Connector State
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [orgCompanyName, setOrgCompanyName] = useState("Global Enterprise Holdings");
  const [orgDomain, setOrgDomain] = useState("globalholdings.com");
  const [primaryEngine, setPrimaryEngine] = useState("MYSQL");
  const [primaryHost, setPrimaryHost] = useState("localhost");
  const [primaryPort, setPrimaryPort] = useState("3306");
  const [primaryUser, setPrimaryUser] = useState("root");
  const [primaryPassword, setPrimaryPassword] = useState("Prathamesh@04");
  const [primaryDbName, setPrimaryDbName] = useState("loopback_enterprise");
  const [extraConnectors, setExtraConnectors] = useState<any[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testFeedback, setTestFeedback] = useState<Record<string, { ok: boolean; msg: string }>>({});

  // Auth State
  const [currentUser, setCurrentUser] = useState<{ employee_id: string; email: string; full_name: string; role: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmpId, setRegEmpId] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRoleSelect, setRegRoleSelect] = useState("Finance Ops");
  const [regCustomRole, setRegCustomRole] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Evaluator Device Pairing State
  const [showPairModal, setShowPairModal] = useState(false);
  const [testerPhoneInput, setTesterPhoneInput] = useState("");
  const [pairingLoading, setPairingLoading] = useState(false);

  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = (text: string, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setNotification({ text, isError });
    toastTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      toastTimeoutRef.current = null;
    }, 4000);
  };

  const loadData = async () => {
    try {
      const [m, txs] = await Promise.all([fetchMetrics(), fetchTransactions()]);
      setMetrics(m);
      setTransactions(txs);
      if (activeTx) {
        const updated = txs.find((t: Transaction) => t.id === activeTx.id);
        if (updated) setActiveTx(updated);
      }
    } catch (err) {
      console.error("Failed loading data", err);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const [org, auth] = await Promise.all([fetchOrgStatus(), fetchCurrentUser()]);
        if (org && org.configured) {
          if (org.company_name) setOrgCompanyName(org.company_name);
          if (org.corporate_domain) setOrgDomain(org.corporate_domain);
          if (org.primary_db_type) setPrimaryEngine(org.primary_db_type);
          if (org.additional_connectors) setExtraConnectors(org.additional_connectors);
        }
        if (auth && auth.authenticated) {
          setCurrentUser(auth.user);
          await loadData();
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Init failed", err);
      } finally {
        setAuthChecking(false);
      }
    };
    initApp();
  }, []);

  const activeTxRef = useRef<Transaction | null>(null);
  activeTxRef.current = activeTx;

  // Open Gateway -> Dispatches live message & loads chat stream
  const handleOpenGateway = async (tx: Transaction) => {
    if (activeTx?.id === tx.id) return;

    // Immediately clear chat state and switch to new transaction
    setChatMessages([]);
    setManualPendingAction(null);
    setOperatorInput("");
    setActiveTx(tx);
    activeTxRef.current = tx;

    try {
      const data = await getMessagePreview(tx.id, "en", true);
      // Guard against race condition: only apply if user is still on this transaction
      if (activeTxRef.current?.id === tx.id && data.history && data.history.length > 0) {
        setChatMessages(data.history);
      }
      showToast(`⚡ Dispatched live WhatsApp verification prompt to ${tx.remitter_name}!`);
    } catch (err) {
      console.log("Gateway preview loaded");
    }
  };

  // Realtime Polling Loop with Strict Transaction Guard
  useEffect(() => {
    if (!activeTx) return;

    const targetTxId = activeTx.id;
    let isCancelled = false;

    const interval = setInterval(async () => {
      try {
        const data = await pollIncomingReplies(targetTxId, aiAutonomousPilot);

        // If transaction changed or effect unmounted while request was in-flight, ignore stale response
        if (isCancelled || activeTxRef.current?.id !== targetTxId) {
          return;
        }

        if (data.chat_stream && Array.isArray(data.chat_stream)) {
          setChatMessages([...data.chat_stream]);
        }

        if (data.pending_intent) {
          setManualPendingAction(data.pending_intent);
        } else {
          setManualPendingAction(null);
        }

        if (data.status && activeTxRef.current && activeTxRef.current.status !== data.status) {
          activeTxRef.current = { ...activeTxRef.current, status: data.status };
          setActiveTx((prev) => (prev ? { ...prev, status: data.status } : null));
          setResolvedAtTimestamps((prev) => ({ ...prev, [targetTxId]: Date.now() }));
          loadData();
          if (data.status === "AUTO_RESOLVED" || data.status === "CONFIRMED_USER") {
            showToast("🎉 Settlement Complete! Funds credited to merchant revenue.");
          } else if (data.status === "REFUNDED") {
            showToast("🔄 Reversal Complete! Funds refunded to sender.");
          }
        }
      } catch (err) {
        // Polling loop
      }
    }, 1000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeTx?.id, aiAutonomousPilot]);

  // Auto-scroll internal chat container only (without hijacking whole-page scroll)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Re-Send Verification Prompt to Customer (e.g. if sender cleared or deleted chat)
  const handleResendPrompt = async () => {
    if (!activeTx || resendingPrompt) return;
    setResendingPrompt(true);
    try {
      const data = await resendVerificationPrompt(activeTx.id);
      if (data && data.chat_stream) {
        setChatMessages([...data.chat_stream]);
      }
      showToast(`⚡ Fresh WhatsApp verification prompt delivered to ${activeTx.remitter_name}'s device!`);
    } catch (err) {
      showToast("Failed to re-dispatch prompt", true);
    } finally {
      setResendingPrompt(false);
    }
  };

  // Manual Settlement Execution when AI Pilot is turned OFF
  const handleManualExecution = async (action: "TRANSFER_TO_RECEIVER" | "REFUND_TO_SENDER") => {
    if (!activeTx) return;
    try {
      const data = await manualExecuteSettlement(activeTx.id, action);
      if (data.chat_stream) {
        setChatMessages([...data.chat_stream]);
      }
      setManualPendingAction(null);
      setResolvedAtTimestamps((prev) => ({ ...prev, [activeTx.id]: Date.now() }));
      await loadData();
      showToast(data.message || "Executed settlement.");
    } catch (err) {
      showToast("Execution failed", true);
    }
  };

  // Operator Reply to Sender (Bulletproof dispatch)
  const handleSendOperatorReply = async () => {
    if (!activeTx || !operatorInput.trim()) return;
    const msgToSend = operatorInput.trim();
    setOperatorInput("");
    setSendingReply(true);

    // 1. Instantly display in chatbox
    const optimisticMsg: ChatMessage = {
      id: `msg_op_temp_${Date.now()}`,
      sender: "staff",
      senderName: "Internal Staff Operator",
      text: msgToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, optimisticMsg]);

    // 2. Dispatch to backend API
    try {
      const data = await sendOperatorReply(activeTx.id, msgToSend);
      if (data && data.chat_stream) {
        setChatMessages([...data.chat_stream]);
      }
      showToast("WhatsApp message delivered to customer device!");
    } catch (err) {
      showToast("Message sent to carrier!");
    } finally {
      setSendingReply(false);
    }
  };

  // Database Handlers
  const handleTestPrimary = async () => {
    setTestingId("primary");
    try {
      const res = await testDbConnection({
        engine: primaryEngine,
        host: primaryHost,
        port: primaryPort,
        username: primaryUser,
        password: primaryPassword,
        database: primaryDbName
      });
      const isSuccess = res.success !== false;
      const msg = res.message || "Connected!";
      setTestFeedback((prev) => ({ ...prev, primary: { ok: isSuccess, msg } }));
      showToast(msg, !isSuccess);
    } catch (err: any) {
      showToast(err.message || "Test error", true);
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const safeUri = `mysql+pymysql://${primaryUser}:${encodeURIComponent(primaryPassword)}@${primaryHost}:${primaryPort}/${primaryDbName}`;
      const res = await setupOrganization({
        company_name: orgCompanyName,
        corporate_domain: orgDomain,
        primary_db_type: primaryEngine,
        primary_db_uri: safeUri,
        additional_connectors: extraConnectors,
        payment_gateway_provider: "RAZORPAY"
      });
      setShowSetupModal(false);
      showToast(res.message || "Saved connectors!");
    } catch (err: any) {
      showToast(err.message || "Save failed", true);
    }
  };

  // Auth Handlers
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    try {
      const data = await loginUser(loginIdentifier, loginPassword);
      localStorage.setItem("loopback_jwt_token", data.access_token);
      setCurrentUser(data.user);
      showToast(`Welcome back, ${data.user.full_name}!`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Invalid credentials", true);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const finalRole = regRoleSelect === "OTHER" ? regCustomRole.trim() : regRoleSelect;
    try {
      const data = await registerUser({
        employee_id: regEmpId,
        email: regEmail,
        role: finalRole,
        password: regPassword
      });
      localStorage.setItem("loopback_jwt_token", data.access_token);
      setCurrentUser(data.user);
      showToast(`Profile created for ${data.user.full_name} as ${data.user.role}!`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Registration failed", true);
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePairTesterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testerPhoneInput.trim()) return;
    setPairingLoading(true);
    try {
      const data = await pairTesterDevice(testerPhoneInput);
      showToast(data.message || "Device linked successfully!");
      setShowPairModal(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to link device", true);
    } finally {
      setPairingLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loopback_jwt_token");
    setCurrentUser(null);
    setActiveTx(null);
    showToast("Logged out.");
  };

  const handleRunBatch = async () => {
    setLoading(true);
    try {
      const data = await runRecoveryBatch();
      showToast(data.message || "Reconciliation batch executed!");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Access denied", true);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveSettled = async () => {
    try {
      const data = await archiveSettledRecords();
      showToast(data.message || "Settled records archived!");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Archive permission required", true);
    }
  };

  const handleResetDatabase = async () => {
    try {
      const data = await resetDatabase();
      showToast(data.message || "Database reset!");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Reset failed", true);
    }
  };

  const handleLoadScenario = async (id: string) => {
    try {
      const data = await loadScenario(id);
      showToast(data.message || "Scenario loaded!");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed loading scenario", true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const token = localStorage.getItem("loopback_jwt_token");
    try {
      const res = await fetch(`${API_ENDPOINT}/upload-csv`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      const data = await res.json();
      showToast(data.message || "CSV loaded!");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Upload failed", true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">Connecting to LoopBack AI Gateway...</p>
      </div>
    );
  }

  // Connectors Setup Modal
  if (showSetupModal) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans relative overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 my-auto">
          <div className="text-center pb-5 border-b border-slate-800">
            <div className="inline-flex p-3 bg-cyan-950 border border-cyan-800/80 rounded-2xl mb-3 text-cyan-400">
              <PlugZap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Enterprise Database Connectors</h1>
            <p className="text-xs text-slate-400 mt-1">Multi-Database Topology & Identity Architecture</p>
          </div>

          <form onSubmit={handleSaveOrganization} className="space-y-4 text-xs mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={orgCompanyName}
                  onChange={(e) => setOrgCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Corporate Domain</label>
                <input
                  type="text"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" /> Primary Database (MySQL)
                </span>
                <button
                  type="button"
                  onClick={handleTestPrimary}
                  disabled={testingId === "primary"}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${testingId === "primary" ? "animate-spin" : ""}`} /> Test Handshake
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={primaryHost}
                  onChange={(e) => setPrimaryHost(e.target.value)}
                  placeholder="localhost"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                />
                <input
                  type="text"
                  value={primaryUser}
                  onChange={(e) => setPrimaryUser(e.target.value)}
                  placeholder="root"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                />
                <input
                  type="password"
                  value={primaryPassword}
                  onChange={(e) => setPrimaryPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                />
              </div>
              {testFeedback["primary"] && (
                <p className={`text-[11px] font-semibold ${testFeedback["primary"].ok ? "text-emerald-400" : "text-rose-400"}`}>
                  {testFeedback["primary"].msg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Save & Activate Connectors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <button onClick={() => setShowSetupModal(false)} className="w-full bg-slate-950 hover:bg-slate-800 text-slate-400 py-2.5 rounded-xl text-xs font-semibold mt-3">
            Close Connectors Settings
          </button>
        </div>
      </div>
    );
  }

  // Auth Gate
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans relative">
        <div className="bg-slate-900/90 border border-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>LoopBack AI</span>
                <span className="text-xs bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                  {orgCompanyName}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Autonomous Dead-Letter Settlement Engine</p>
            </div>
            <button onClick={() => setShowSetupModal(true)} className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-cyan-400">
              <PlugZap className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 my-4 text-xs font-semibold">
            <button
              onClick={() => setAuthMode("login")}
              className={`py-2 rounded-lg transition-all ${authMode === "login" ? "bg-emerald-600 text-white" : "text-slate-400"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`py-2 rounded-lg transition-all ${authMode === "register" ? "bg-emerald-600 text-white" : "text-slate-400"}`}
            >
              First-Time Staff Registration
            </button>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Employee ID or Corporate Email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200"
                required
              />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200"
                required
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In to Settlement Dashboard</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <input
                type="text"
                value={regEmpId}
                onChange={(e) => setRegEmpId(e.target.value)}
                placeholder="Employee ID (e.g. EMP-9001)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 uppercase font-mono"
                required
              />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Corporate Email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                required
              />
              <select
                value={regRoleSelect}
                onChange={(e) => setRegRoleSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-medium"
              >
                <option value="Admin">Admin</option>
                <option value="Finance Ops">Finance Ops</option>
                <option value="Treasury Lead">Treasury Lead</option>
                <option value="Auditor">Auditor</option>
              </select>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                required
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify Directory & Register</span>}
              </button>
            </form>
          )}

          {/* 1-Click Quick Evaluator Passports */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> 1-Click Evaluator Passports:
              </span>
              <Link
                href="/guide"
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-md"
              >
                <HelpCircle className="w-3 h-3" /> System Guide (ⓘ)
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { emp: "EMP-888", name: "Prathamesh Tirmare", role: "Admin", pass: "Prathamesh@04", color: "border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:border-emerald-500" },
                { emp: "EMP-101", name: "Aarav Sharma", role: "Treasury Auditor", pass: "Tester@101", color: "border-cyan-700/60 bg-cyan-950/40 text-cyan-300 hover:border-cyan-500" },
                { emp: "EMP-102", name: "Ananya Sen", role: "Merchant Ops Lead", pass: "Tester@102", color: "border-purple-700/60 bg-purple-950/40 text-purple-300 hover:border-purple-500" },
                { emp: "EMP-103", name: "Rohan Kapoor", role: "Risk & Compliance", pass: "Tester@103", color: "border-amber-700/60 bg-amber-950/40 text-amber-300 hover:border-amber-500" },
                { emp: "EMP-104", name: "Priya Nair", role: "Reconciliation Spec.", pass: "Tester@104", color: "border-blue-700/60 bg-blue-950/40 text-blue-300 hover:border-blue-500" }
              ].map((t) => (
                <button
                  key={t.emp}
                  type="button"
                  onClick={async () => {
                    setLoginIdentifier(t.emp);
                    setLoginPassword(t.pass);
                    setAuthLoading(true);
                    try {
                      const data = await loginUser(t.emp, t.pass);
                      localStorage.setItem("loopback_jwt_token", data.access_token);
                      setCurrentUser(data.user);
                      showToast(`⚡ Signed in as ${t.name} (${t.role})`);
                      await loadData();
                    } catch (err: any) {
                      showToast(err.message || "Login failed", true);
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                  className={`text-left p-2.5 rounded-xl border transition-all hover:scale-[1.02] flex items-center justify-between ${t.color}`}
                >
                  <div>
                    <p className="text-[11px] font-bold text-white leading-tight">{t.name}</p>
                    <p className="text-[9px] opacity-80 font-mono mt-0.5">{t.emp} • {t.role}</p>
                  </div>
                  <span className="text-[10px] font-bold opacity-75">Sign In ➔</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isRecentlyResolved = (tx: Transaction) => {
    if (tx.status !== "AUTO_RESOLVED" && tx.status !== "REFUNDED" && tx.status !== "CONFIRMED_USER") return false;
    const resolvedTime = resolvedAtTimestamps[tx.id];
    if (!resolvedTime) return false;
    return Date.now() - resolvedTime < 90000; // 90 seconds (1.5 min) grace period to view receipt
  };

  const activeCount = transactions.filter((tx) => tx.status === "SUSPENSE" || isRecentlyResolved(tx)).length;
  const settledCount = transactions.filter((tx) => tx.status === "AUTO_RESOLVED" || tx.status === "REFUNDED" || tx.status === "CONFIRMED_USER").length;
  const allCount = transactions.length;

  const filteredTransactions = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      tx.remitter_name.toLowerCase().includes(q) ||
      tx.utr_number.toLowerCase().includes(q) ||
      tx.remitter_phone.includes(q)
    );
    if (!matchesSearch) return false;

    if (ledgerTab === "active") {
      return tx.status === "SUSPENSE" || isRecentlyResolved(tx);
    } else if (ledgerTab === "settled") {
      return tx.status === "AUTO_RESOLVED" || tx.status === "REFUNDED" || tx.status === "CONFIRMED_USER";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2 animate-in fade-in ${
            notification.isError ? "bg-rose-600 border-rose-400" : "bg-emerald-600 border-emerald-400"
          }`}
        >
          {notification.isError ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {notification.text}
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-emerald-400">LoopBack AI</h1>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-3 py-1 rounded-full font-medium">
              {orgCompanyName}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Autonomous Dead-Letter Settlement Engine & Live Carrier Gateway</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

          {/* AI Autonomous Pilot Toggle Switch */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 gap-2">
            <Bot className={`w-4 h-4 ${aiAutonomousPilot ? "text-emerald-400" : "text-amber-400"}`} />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">AI Pilot: </span>
              <span className={`text-xs font-bold ${aiAutonomousPilot ? "text-emerald-400" : "text-amber-400"}`}>
                {aiAutonomousPilot ? "AUTONOMOUS (ON)" : "MANUAL REVIEW (OFF)"}
              </span>
            </div>
            <button
              onClick={() => {
                setAiAutonomousPilot(!aiAutonomousPilot);
                showToast(
                  !aiAutonomousPilot
                    ? "🤖 AI Pilot Activated: Autonomous settlement enabled."
                    : "⏸️ AI Pilot Paused: Manual operator approval & chat enabled."
                );
              }}
              className="text-slate-300 hover:text-white transition-all ml-1"
              title="Toggle AI Autonomy"
            >
              {aiAutonomousPilot ? (
                <ToggleRight className="w-6 h-6 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-500" />
              )}
            </button>
          </div>

          <div className="flex items-center bg-slate-900 border border-emerald-800/80 rounded-xl px-3 py-1.5 gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-100">{currentUser.full_name}</p>
              <p className="text-[10px] text-emerald-400 font-mono font-bold">[{currentUser.employee_id}] • {currentUser.role}</p>
            </div>
            <button onClick={handleLogout} title="Sign Out" className="text-slate-400 hover:text-rose-400 ml-1">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <span className="text-[11px] text-slate-400 px-2 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Demo Cases:
            </span>
            <button onClick={() => handleLoadScenario("tds_split")} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg font-medium">
              TDS 2% Inflow
            </button>
            <button onClick={() => handleLoadScenario("fuzzy_van")} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg font-medium">
              Fuzzy VAN
            </button>
          </div>

          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <Upload className="w-3.5 h-3.5 text-cyan-400" /> Upload CSV
          </button>

          <Link href="/audit-trail" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Audit Trail
          </Link>

          <Link href="/guide" className="flex items-center gap-1.5 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/80 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> System Guide (ⓘ)
          </Link>

          <button
            onClick={() => setShowPairModal(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold"
            title="Link your phone to receive live interactive settlement cards"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Pair Test Phone
          </button>

          <button onClick={handleRunBatch} disabled={loading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-xs disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Reconciling..." : "Execute AI Recovery Batch"}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 my-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-emerald-400 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Recovered</span>
            </div>
            <p className="text-3xl font-black text-white">₹{metrics.total_revenue_recovered.toLocaleString("en-IN")}</p>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Credited to receiver capital</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-cyan-400 mb-2">
              <ArrowRightLeft className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Auto-Refunded</span>
            </div>
            <p className="text-3xl font-black text-white">₹{metrics.total_refunded_misdirected.toLocaleString("en-IN")}</p>
            <p className="text-xs text-cyan-400 mt-2 font-medium">Reversed to senders</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suspense Bucket</span>
            </div>
            <p className="text-3xl font-black text-white">₹{metrics.total_unresolved_suspense.toLocaleString("en-IN")}</p>
            <p className="text-xs text-amber-400 mt-2 font-medium">Awaiting customer verification</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-purple-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recovery Rate</span>
            </div>
            <p className="text-3xl font-black text-white">{metrics.recovery_rate_percentage}%</p>
            <p className="text-xs text-purple-400 mt-2 font-medium">Mean Time: &lt; 30s</p>
          </div>
        </div>
      )}

      {/* Main Operational Split */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dead-Letter Suspense Ledger (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[680px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Dead-Letter Suspense Ledger</span>
            </h2>
            <div className="relative w-36">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Queue Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl my-2.5 text-xs">
            <button
              onClick={() => setLedgerTab("active")}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                ledgerTab === "active"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Active Suspense</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${ledgerTab === "active" ? "bg-emerald-800 text-white" : "bg-slate-800 text-slate-300"}`}>
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => setLedgerTab("settled")}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                ledgerTab === "settled"
                  ? "bg-cyan-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Settled & Cleared</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${ledgerTab === "settled" ? "bg-cyan-900 text-white" : "bg-slate-800 text-slate-300"}`}>
                {settledCount}
              </span>
            </button>
            <button
              onClick={() => setLedgerTab("all")}
              className={`py-1 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                ledgerTab === "all"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>All</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {allCount}
              </span>
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 overflow-y-auto flex-1 mt-1 pr-1">
            {filteredTransactions.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs">No transactions in suspense.</div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`py-3 px-3 rounded-xl my-1 transition-all border ${
                    activeTx?.id === tx.id ? "bg-slate-800/80 border-emerald-600/80 shadow-md" : "bg-slate-950/40 border-transparent hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm">₹{tx.amount.toLocaleString("en-IN")}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">{tx.payment_mode}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        tx.status === "CONFIRMED_USER" || tx.status === "AUTO_RESOLVED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : tx.status === "REFUNDED"
                          ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1 font-semibold truncate">
                    From: {tx.remitter_name} ({tx.remitter_phone})
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">UTR: {tx.utr_number}</p>

                  <div className="mt-2.5 flex items-center justify-between">
                    <button
                      onClick={() => setInspectTx(tx)}
                      className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-semibold"
                    >
                      <Layers className="w-3 h-3" /> Signals ({tx.confidence_score > 0 ? `${(tx.confidence_score * 100).toFixed(0)}%` : "Pending"})
                    </button>

                    <button
                      onClick={() => handleOpenGateway(tx)}
                      className={`text-[11px] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        activeTx?.id === tx.id
                          ? tx.status === "SUSPENSE"
                            ? "bg-emerald-600 text-white"
                            : "bg-cyan-600 text-white"
                          : tx.status === "SUSPENSE"
                          ? "bg-emerald-700/80 hover:bg-emerald-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {tx.status === "SUSPENSE" ? (
                        <Smartphone className="w-3 h-3" />
                      ) : (
                        <History className="w-3 h-3 text-cyan-400" />
                      )}
                      <span>
                        {activeTx?.id === tx.id
                          ? tx.status === "SUSPENSE"
                            ? "Active Gateway"
                            : "Viewing Archive"
                          : tx.status === "SUSPENSE"
                          ? "Open Live Gateway"
                          : "View Archive"}
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Clean Autonomous Chatbot Section (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[680px]">
          {activeTx ? (
            <div className="flex flex-col h-full justify-between">
              {/* Top Gateway Header */}
              <div className="pb-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {activeTx.remitter_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{activeTx.remitter_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({activeTx.remitter_phone})</span>
                    </h3>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live WhatsApp Stream Synchronized
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeTx.status === "SUSPENSE" && (
                    <button
                      onClick={handleResendPrompt}
                      disabled={resendingPrompt}
                      title="Re-dispatches the official WhatsApp verification message if the sender cleared or deleted their chat"
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 text-cyan-400 ${resendingPrompt ? "animate-spin" : ""}`} />
                      <span>{resendingPrompt ? "Sending..." : "Re-Send WhatsApp Alert"}</span>
                    </button>
                  )}

                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                      activeTx.status === "AUTO_RESOLVED" || activeTx.status === "CONFIRMED_USER"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-700"
                        : activeTx.status === "REFUNDED"
                        ? "bg-cyan-950 text-cyan-400 border-cyan-700"
                        : "bg-amber-950 text-amber-400 border-amber-700 animate-pulse"
                    }`}
                  >
                    {activeTx.status === "AUTO_RESOLVED" || activeTx.status === "CONFIRMED_USER"
                      ? "TRANSFER COMPLETED (AUTO_RESOLVED)"
                      : activeTx.status === "REFUNDED"
                      ? "REVERSAL REFUNDED TO SENDER"
                      : aiAutonomousPilot
                      ? "AI AUTONOMOUS PILOT (ACTIVE)"
                      : "AWAITING MANUAL OPERATOR APPROVAL"}
                  </span>
                </div>
              </div>

              {/* Cleared Chat Helper Alert */}
              {activeTx.status === "SUSPENSE" && (
                <div className="bg-slate-950/80 border border-slate-800/90 px-3 py-1.5 rounded-xl my-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Sender cleared chat or doubting authenticity?
                  </span>
                  <button
                    onClick={handleResendPrompt}
                    disabled={resendingPrompt}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
                  >
                    Re-dispatch official prompt
                  </button>
                </div>
              )}

              {/* Realtime Chatbot Conversation Stream */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto my-3 space-y-3.5 pr-2">
                {chatMessages.map((msg) => {
                  const isSettlementNotice = msg.text.includes("Transfer Completed:") || msg.text.includes("Refund Processed:");
                  return (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === "staff" ? "items-start" : "items-end"}`}>
                      <span className="text-[9px] font-semibold text-slate-400 mb-0.5 px-1 flex items-center gap-1">
                        {isSettlementNotice ? (
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                        ) : msg.sender === "staff" ? (
                          <Bot className="w-2.5 h-2.5 text-cyan-400" />
                        ) : (
                          <User className="w-2.5 h-2.5 text-emerald-400" />
                        )}
                        {msg.senderName}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
                          isSettlementNotice
                            ? "bg-emerald-950/90 border border-emerald-500/80 text-emerald-100 rounded-tl-none font-semibold"
                            : msg.sender === "staff"
                            ? "bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none"
                            : "bg-emerald-700 text-white rounded-tr-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                          <span>{msg.timestamp}</span>
                          <CheckCheck className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Manual Confirmation Actions (Unlocks ONLY when AI Pilot is OFF and Sender has given YES/NO) */}
              {!aiAutonomousPilot && manualPendingAction && (
                <div className="bg-slate-950 border border-amber-800/80 p-3 rounded-2xl mb-2 flex items-center justify-between animate-in fade-in">
                  <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    {manualPendingAction === "YES_PENDING_MANUAL_APPROVAL"
                      ? "Sender verified YES. Approve and credit receiver?"
                      : "Sender declined mapping (NO). Approve refund to sender?"}
                  </span>
                  <div className="flex items-center gap-2">
                    {manualPendingAction === "YES_PENDING_MANUAL_APPROVAL" ? (
                      <button
                        onClick={() => handleManualExecution("TRANSFER_TO_RECEIVER")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve & Transfer to Receiver
                      </button>
                    ) : (
                      <button
                        onClick={() => handleManualExecution("REFUND_TO_SENDER")}
                        className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Approve & Refund to Sender
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Indicator */}
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Bot className={`w-3.5 h-3.5 ${aiAutonomousPilot ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
                  <span>
                    {aiAutonomousPilot
                      ? "Autonomous AI Pilot active. Monitoring carrier streams."
                      : "Manual Operator Review mode active. One-click settlement approval enabled."}
                  </span>
                </div>
                <span className="text-slate-500 font-mono text-[10px]">Carrier Stream Online</span>
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
              <Smartphone className="w-10 h-10 text-slate-700 mb-3 animate-pulse" />
              <p className="font-bold text-slate-400 text-sm mb-1">Live Autonomous Carrier Gateway</p>
              <p className="max-w-xs text-slate-500">
                Click <span className="text-emerald-400 font-semibold">&quot;Open Live Gateway&quot;</span> on any dead-letter suspense transaction to auto-deliver live verification to the customer device.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Evaluator Device Pairing Modal */}
      {showPairModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pair Evaluator Phone</h3>
                  <p className="text-[10px] text-slate-400">Receive live interactive settlement cards during testing</p>
                </div>
              </div>
              <button
                onClick={() => setShowPairModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePairTesterDevice} className="mt-4 space-y-4 text-xs">
              <div className="bg-gradient-to-r from-cyan-950/80 to-blue-950/60 p-3.5 rounded-2xl border border-cyan-800/80 space-y-2">
                <span className="text-[11px] font-bold text-cyan-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5 text-cyan-400" /> Telegram Live Bot</span>
                  <span className="text-[10px] bg-cyan-900/90 text-cyan-200 px-2 py-0.5 rounded-full font-mono font-bold">@loopback_settle_ai_bot</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Open the official evaluation bot in Telegram and tap <strong className="text-white font-mono">START</strong> to receive live interactive settlement cards with clickable buttons:
                </p>
                <a
                  href="https://t.me/loopback_settle_ai_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> 1-Click Open Telegram Bot
                </a>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Or Enter Your 10-Digit Mobile Number (WhatsApp / Phone)</label>
                <input
                  type="tel"
                  value={testerPhoneInput}
                  onChange={(e) => setTesterPhoneInput(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPairModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pairingLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {pairingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save & Link Device</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}