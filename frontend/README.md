This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# LoopBack AI - Autonomous Revenue Recovery Engine

> **Razorpay AI Buildathon | Track 03: Revenue Recovery**
> Eliminating dead-letter unallocated suspense balances with multi-signal fuzzy reconciliation, conversational buyer loops, and bounded payout reversals.

---

### What Broke at 2 AM & How We Engineered Out of It

#### The Incident: The "Phantom Settle" Race Condition
* **Failure:** When testing high-frequency concurrent NEFT inflows against a single large outstanding invoice, two independent incoming transfers simultaneously satisfied the fuzzy threshold. Both attempted to mark the same invoice as `PAID`, leading to an over-settlement state.
* **The Root Cause:** Read-then-write race condition across the SQLite session before transaction state locks were applied.
* **The Fix:**
  1. **Strict Signal Boundary Policies:** Enforced a multi-signal composite matrix (VAN match 45%, Exact Amount 30%, Phone 15%, Fuzzy Name 10%) requiring $\ge 0.85$ confidence for auto-reconciliation.
  2. **Atomic State Transition & Idempotency Key:** Applied state checks where an invoice transition to `PAID` locks subsequent matches and routes all secondary inflows to the conversational WhatsApp loop or automated refund.
  3. **Deterministic Audit Log Stream:** Every single signal vector is saved immutably with timestamped evidence for full regulatory compliance.

---

### Architecture & Data Flow
