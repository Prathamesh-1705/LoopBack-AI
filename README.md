# LoopBack AI: Autonomous Dead-Letter Settlement Engine & Live Carrier Gateway

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python)](https://python.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Enterprise_Inflows-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)
[![Telegram](https://img.shields.io/badge/Telegram-Live_Carrier_Bridge-2CA5E0?style=for-the-badge&logo=telegram)](https://t.me/loopback_settle_ai_bot)

> **Autonomous revenue recovery and conversational suspense clearance engine for Indian banking inflows (UPI, NEFT, RTGS, IMPS).**

---

## 📌 Executive Summary

In high-volume enterprise banking and merchant payouts, **1.2% to 4.5% of inbound transfers** fail automated straight-through processing due to:
1. **Missing or Truncated Virtual Account Numbers (VANs)** from legacy banking portals.
2. **Unannounced 2% TDS or GST Deductions** creating numeric amount mismatches.
3. **Typographical Errors** in remitter names across NEFT/RTGS clearing networks.

Traditionally, these funds sit frozen in a **Dead-Letter Suspense Ledger** for 30–90 days, requiring labor-intensive manual ticket audits.

**LoopBack AI solves this completely**:
- Correlates multi-factor signals (exact/split amounts, fuzzy remitter names, VAN prefixes, temporal proximity) in **< 0.4 seconds**.
- Reaches out autonomously to remitters via **Live Carrier Rail** in **8 Indian languages** with interactive approval cards.
- Autonomously settles the ledger upon remitter confirmation, credits merchant revenue, and records an immutable double-entry audit trail.

---

## 🚀 One-Command Quickstart for Evaluators

LoopBack AI is 100% plug-and-play with zero manual configuration:

```bash
# 1. Clone Repository
git clone https://github.com/Prathamesh-1705/LoopBack-AI.git
cd LoopBack-AI

# 2. Install Dependencies
npm install
npm install --prefix frontend
pip install -r backend/requirements.txt

# 3. Launch Platform (Auto-connects Database, Auto-seeds Accounts & Opens Browser)
npm run start
```

Your default browser will automatically open to **`http://localhost:3000`** with the full dashboard ready!

---

## 📱 Live Mobile Testing on Your Phone (Telegram Live Carrier Bridge)

Evaluators can receive **real-time interactive settlement cards with clickable buttons** directly on their Telegram app:

### 3-Step Live Carrier Activation:
1. Open Telegram on your PC or phone and search for:
   👉 **`@loopback_settle_ai_bot`** *(or click [https://t.me/loopback_settle_ai_bot](https://t.me/loopback_settle_ai_bot))*
2. Click the blue **"START"** button at the bottom of the chat (or send `/start`).
3. On the portal (**`http://localhost:3000`**), click **"Open Live Gateway"** on any dead-letter transaction (or click **"Re-Send WhatsApp Alert"**).

### What You Will Receive:
* A rich interactive settlement card will pop up in your Telegram with 4 action buttons:
  - `✅ Approve & Clear` ➔ Settle funds and credit merchant revenue.
  - `❌ Refund Account` ➔ Initiate instant reversal back to sender.
  - `🌐 Language (भाषा)` ➔ Toggle 8 Indian regional languages.
  - `📄 Invoice Details` ➔ View matching invoice breakdown.
* **Tap any button on Telegram**, and watch the portal ledger update and clear the suspense balance in **real-time**!

---

## ⚡ 1-Click Evaluator Passports (Zero Manual Typing)

On the login screen, evaluators can click any of the **5 Pre-Configured Passports** to sign in instantly:

| Passport / Role | Employee ID | Default Email | Password | System Access Level |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Prathamesh Tirmare** | `EMP-888` | `prathamesh@loopback.ai` | `Prathamesh@04` | **Admin / Lead System Architect** (Full root permissions) |
| 🏦 **Aarav Sharma** | `EMP-101` | `aarav.sharma@loopback.ai` | `Tester@101` | **Treasury Auditor** (Suspense ledger & audit export) |
| 💼 **Ananya Sen** | `EMP-102` | `ananya.sen@loopback.ai` | `Tester@102` | **Merchant Operations Lead** (Settlement batch execution) |
| 🛡️ **Rohan Kapoor** | `EMP-103` | `rohan.kapoor@loopback.ai` | `Tester@103` | **Risk & Compliance Officer** (Ledger governance & freeze) |
| ⚖️ **Priya Nair** | `EMP-104` | `priya.nair@loopback.ai` | `Tester@104` | **Reconciliation Specialist** (Manual carrier overrides) |

---

## 🕹️ Complete Button-by-Button & Feature Tour

### 1. Header & Navigation Controls
- **`AI Pilot Switch (AUTONOMOUS / MANUAL REVIEW)`**: 
  - **`AUTONOMOUS (ON)`**: When the customer taps *Approve* or replies *YES*, the autonomous agent instantly settles the payment, credits merchant revenue, and logs the receipt with zero human latency.
  - **`MANUAL REVIEW (OFF)`**: Customer confirmations are queued for staff review, unlocking visual `Approve & Transfer` / `Approve & Refund` action buttons in the chat drawer.
- **`Demo Cases: TDS 2% Inflow`**: Injects a complex dead-letter transaction where the customer deducted 2% Section 194C TDS (e.g. transferred ₹49,000 against a ₹50,000 invoice). Demonstrates the agent's mathematical tax-split resolution.
- **`Demo Cases: Fuzzy VAN`**: Injects an inflow where the banking remittance truncated the Virtual Account number (e.g. `RAZR_UNMAPPED_...`). Demonstrates fuzzy entity correlation.
- **`Upload CSV`**: Allows uploading custom bank statement CSVs for bulk ingest.
- **`Audit Trail`**: Opens the tamper-proof ledger ([`/audit-trail`](http://localhost:3000/audit-trail)) recording timestamps, actions, performed-by actors, and settlement amounts.
- **`System Guide (ⓘ)`**: Opens the interactive architectural guide ([`/guide`](http://localhost:3000/guide)).
- **`Pair Test Phone`**: Allows linking evaluator devices and contains the 1-click Telegram bot launcher.
- **`Execute AI Recovery Batch`**: Runs the global correlation pass across all pending dead-letter items.

---

### 2. Dead-Letter Suspense Queue (Left Panel)
- **`Search Input`**: Real-time filtering by Remitter Name, UTR Number, or Phone.
- **`Ledger Tabs (Active Suspense / Settled & Cleared / All)`**: Toggles between pending dead-letter items and cleared transactions.
- **`Signal Confidence Score (% Badge)`**: Multi-factor match probability calculated by the heuristic engine.
- **`Open Live Gateway`**: Loads the active conversational drawer for that specific suspense transaction.

---

### 3. Live Carrier Gateway (Right Panel)
- **`Live WhatsApp Stream Synchronized Badge`**: Real-time carrier link indicator.
- **`Re-Send WhatsApp Alert`**: Re-dispatches the official verification prompt if the remitter deleted or cleared their chat.
- **`Chat Stream Interface`**: Shows the chronological dialogue between the customer and LoopBack AI.
- **`Staff Reply Input & Send Button`**: Enables internal operators to send direct messages to the customer's device.

---

## 🧠 Autonomous Signal Scoring Engine

When an unmatched transaction arrives, LoopBack AI compares it against pending unpaid invoices across 4 weighted vectors:

$$\text{Confidence Score} = w_1 S_{\text{amount}} + w_2 S_{\text{entity}} + w_3 S_{\text{van}} + w_4 S_{\text{temporal}}$$

| Vector | Weight | Mathematical Logic |
| :--- | :--- | :--- |
| **Amount Matching ($S_{\text{amount}}$)** | **40%** | Exact match $= 1.0$. Automatic **2% TDS split** ($\text{Amount} \times 0.98$) $= 0.95$. Partial split $= 0.70$. |
| **Entity Fuzzy Match ($S_{\text{entity}}$)** | **30%** | Levenshtein token sort ratio between remitter corporate name and registered business name. |
| **VAN Substring ($S_{\text{van}}$)** | **20%** | Prefix and suffix match against customer Virtual Account registry. |
| **Temporal Proximity ($S_{\text{temporal}}$)** | **10%** | Gaussian decay based on invoice due date ($\Delta t \le 72\text{ hours} = 1.0$). |

---

## 🇮🇳 Multilingual Indian Language Matrix (8 Regional Dialects)

LoopBack AI supports 8 Indian languages with localized prompts, currency formatting (₹), and natural conversational responses:

| Language | Script | Approval Intent Keywords | Reversal / Refund Keywords |
| :--- | :--- | :--- | :--- |
| **English** | Latin | `YES`, `APPROVE`, `CONFIRM`, `CLEAR`, `1` | `NO`, `REFUND`, `WRONG`, `CANCEL`, `2` |
| **Hindi (हिंदी)** | Devanagari | `हाँ`, `स्वीकार`, `सही है`, `भुगतान करें`, `1` | `नहीं`, `वापस करें`, `गलत है`, `रद्द करें`, `2` |
| **Marathi (मराठी)** | Devanagari | `होय`, `मंजूर`, `पैसे जमा करा`, `बरोबर`, `1` | `नाही`, `परत करा`, `चूक`, `रद्द`, `2` |
| **Gujarati (ગુજરાતી)** | Gujarati | `હા`, `મંજૂર`, `બરાબર`, `જમા કરો`, `1` | `ના`, `પાછા આપો`, `ખોટું`, `રદ`, `2` |
| **Tamil (தமிழ்)** | Tamil | `ஆம்`, `சரி`, `ஏற்றுக்கொள்`, `1` | `இல்லை`, `தவறு`, `திரும்பப்பெறு`, `2` |
| **Telugu (తెలుగు)** | Telugu | `అవును`, `సరే`, `ఆమోదించండి`, `1` | `కాదు`, `తప్పు`, `వాపసు చేయండి`, `2` |
| **Kannada (ಕನ್ನಡ)** | Kannada | `ಹೌದು`, `ಸರಿ`, `ಅನುಮೋದಿಸಿ`, `1` | `ಇಲ್ಲ`, `ತಪ್ಪು`, `ಮರುಪಾವತಿಸಿ`, `2` |
| **Bengali (বাংলা)** | Bengali | `হ্যাঁ`, `অনুমোদন`, `ঠিক আছে`, `1` | `না`, `ভুল`, `ফেরত দিন`, `2` |

---

## 📄 License & Intellectual Property

Built for the **Razorpay Enterprise Inflow & Autonomous Settlement Track**.
Licensed under the Apache 2.0 License.
