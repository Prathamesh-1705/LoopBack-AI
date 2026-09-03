export interface AuditLog {
  id: number;
  transaction_id: number;
  action: string;
  details: string;
  timestamp: string;
}

export interface Transaction {
  id: number;
  utr_number: string;
  amount: number;
  remitter_name: string;
  remitter_phone: string;
  remitter_upi?: string;
  destination_van?: string;
  payment_mode: string;
  status: string;
  confidence_score: number;
  matched_invoice_id?: number;
}

export interface DashboardMetrics {
  total_revenue_recovered: number;
  total_refunded_misdirected: number;
  total_unresolved_suspense: number;
  recovery_rate_percentage: number;
  total_processed_count: number;
}