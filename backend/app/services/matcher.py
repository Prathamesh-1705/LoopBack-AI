from rapidfuzz import fuzz
from typing import List, Tuple, Optional
from app.models.schema_models import Invoice, IncomingTransaction

class EntityResolver:
    @staticmethod
    def calculate_match_score(tx: IncomingTransaction, invoice: Invoice) -> Tuple[float, List[str]]:
        score = 0.0
        reasons = []

        # 1. Exact Amount Match (Weight: 40%)
        if abs(tx.amount - invoice.amount_due) < 0.01:
            score += 40.0
            reasons.append("Exact amount match")
        elif abs(tx.amount - invoice.amount_due) / invoice.amount_due <= 0.02:
            # 2% TDS or minor deduction
            score += 25.0
            reasons.append("Approximate amount match (possible TDS deduction)")

        # 2. Virtual Account Number Match / Typo Check (Weight: 30%)
        if tx.destination_van and invoice.virtual_account:
            if tx.destination_van == invoice.virtual_account:
                score += 30.0
                reasons.append("Exact Virtual Account match")
            else:
                van_sim = fuzz.ratio(tx.destination_van, invoice.virtual_account)
                if van_sim >= 85:
                    score += 20.0
                    reasons.append(f"Near-match VAN typo detected ({van_sim}% similarity)")

        # 3. Remitter Name vs Client Legal Name (Weight: 20%)
        name_sim = fuzz.token_set_ratio(tx.remitter_name.lower(), invoice.client_name.lower())
        if name_sim >= 75:
            score += 20.0 * (name_sim / 100.0)
            reasons.append(f"Entity name matched ({name_sim}%)")

        # 4. Phone Number Match (Weight: 10%)
        if tx.remitter_phone and invoice.client_phone:
            if tx.remitter_phone[-10:] == invoice.client_phone[-10:]:
                score += 10.0
                reasons.append("Direct phone number match")

        normalized_score = round(min(score / 100.0, 1.0), 2)
        return normalized_score, reasons

    @classmethod
    def find_best_candidate(cls, tx: IncomingTransaction, open_invoices: List[Invoice]) -> Tuple[Optional[Invoice], float, List[str]]:
        best_invoice = None
        highest_score = 0.0
        best_reasons = []

        for inv in open_invoices:
            score, reasons = cls.calculate_match_score(tx, inv)
            if score > highest_score:
                highest_score = score
                best_invoice = inv
                best_reasons = reasons

        return best_invoice, highest_score, best_reasons