import os
import sys

# Ensure backend root is placed in sys.path BEFORE any other imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from datetime import datetime, timezone, timedelta
from app.db.database import SessionLocal
from app.models.schema_models import (
    Invoice, IncomingTransaction, TransactionStatus, InvoiceStatus,
    AuditLog, User, CompanyEmployeeDirectory, OrganizationSettings,
    ChatMessageRecord
)
from app.services.auth import get_password_hash

def seed():
    db = SessionLocal()

    # 1. Clean All Existing Data
    db.query(ChatMessageRecord).delete()
    db.query(AuditLog).delete()
    db.query(IncomingTransaction).delete()
    db.query(Invoice).delete()
    db.query(User).delete()
    db.query(CompanyEmployeeDirectory).delete()
    db.query(OrganizationSettings).delete()
    db.commit()

    # 2. Organization Enterprise Profile
    org = OrganizationSettings(
        company_name="LoopBack AI Enterprise",
        corporate_domain="loopback.ai",
        primary_db_type="MYSQL",
        primary_db_uri="mysql+pymysql://root:Prathamesh%4004@localhost:3306/loopback_enterprise",
        additional_connectors="[]",
        payment_gateway_provider="RAZORPAY",
        is_configured=True
    )
    db.add(org)

    # 3. Authorized Employee Directory & 5 Pre-Configured Tester Passports
    tester_profiles = [
        {
            "emp_id": "EMP-888",
            "name": "Prathamesh Tirmare",
            "email": "prathamesh@loopback.ai",
            "role": "Admin",
            "password": "Prathamesh@04"
        },
        {
            "emp_id": "EMP-101",
            "name": "Aarav Sharma",
            "email": "aarav.sharma@loopback.ai",
            "role": "Treasury Auditor",
            "password": "Tester@101"
        },
        {
            "emp_id": "EMP-102",
            "name": "Ananya Sen",
            "email": "ananya.sen@loopback.ai",
            "role": "Merchant Ops Lead",
            "password": "Tester@102"
        },
        {
            "emp_id": "EMP-103",
            "name": "Rohan Kapoor",
            "email": "rohan.kapoor@loopback.ai",
            "role": "Risk & Compliance Officer",
            "password": "Tester@103"
        },
        {
            "emp_id": "EMP-104",
            "name": "Priya Nair",
            "email": "priya.nair@loopback.ai",
            "role": "Reconciliation Specialist",
            "password": "Tester@104"
        }
    ]

    for p in tester_profiles:
        dir_entry = CompanyEmployeeDirectory(
            employee_id=p["emp_id"],
            official_name=p["name"],
            corporate_email=p["email"],
            assigned_role=p["role"],
            is_claimed=True
        )
        db.add(dir_entry)

        user = User(
            employee_id=p["emp_id"],
            email=p["email"],
            hashed_password=get_password_hash(p["password"]),
            full_name=p["name"],
            role=p["role"]
        )
        db.add(user)

    # 4. Pending Invoices
    invoices = [
        Invoice(
            invoice_number="INV-2026-001",
            customer_name="Prathamesh Tirmare",
            customer_phone="9699246283",
            amount=50000.0,
            virtual_account_number="RAZR_VAN_969924",
            due_date=datetime.now(timezone.utc) - timedelta(days=2),
            status=InvoiceStatus.UNPAID
        ),
        Invoice(
            invoice_number="INV-2026-002",
            customer_name="Aarav Mehta Logistics",
            customer_phone="9820011445",
            amount=75000.0,
            virtual_account_number="RAZR_VAN_750001",
            due_date=datetime.now(timezone.utc) - timedelta(days=5),
            status=InvoiceStatus.UNPAID
        ),
        Invoice(
            invoice_number="INV-2026-003",
            customer_name="Kavita Deshmukh Enterprises",
            customer_phone="9833445566",
            amount=65000.0,
            virtual_account_number="RAZR_VAN_650002",
            due_date=datetime.now(timezone.utc) - timedelta(days=1),
            status=InvoiceStatus.UNPAID
        ),
        Invoice(
            invoice_number="INV-2026-004",
            customer_name="Nexus Cloud Systems",
            customer_phone="9766554433",
            amount=55000.0,
            virtual_account_number="RAZR_VAN_550003",
            due_date=datetime.now(timezone.utc) - timedelta(days=4),
            status=InvoiceStatus.UNPAID
        ),
        Invoice(
            invoice_number="INV-2026-005",
            customer_name="Zenith Infra Infrastructure",
            customer_phone="9899112233",
            amount=98000.0,
            virtual_account_number="RAZR_VAN_980004",
            due_date=datetime.now(timezone.utc) - timedelta(days=3),
            status=InvoiceStatus.UNPAID
        )
    ]
    for inv in invoices:
        db.add(inv)

    # 5. Incoming Dead-Letter Suspense Inflows (All marked as SUSPENSE)
    transactions = [
        # Exactly ONE transaction for Prathamesh Tirmare
        IncomingTransaction(
            utr_number="UTR_LIVE_9699246283",
            amount=50000.0,
            remitter_name="Prathamesh Tirmare",
            remitter_phone="9699246283",
            remitter_upi="prathamesh@upi",
            destination_van="RAZR_UNMAPPED_9699",
            payment_mode="UPI",
            status=TransactionStatus.SUSPENSE,
            confidence_score=0.0
        ),
        # Randomized senders
        IncomingTransaction(
            utr_number="UTR_NEFT_2026_8849",
            amount=75000.0,
            remitter_name="Aarav Mehta Logistics",
            remitter_phone="9820011445",
            remitter_upi="aarav.logistics@hdfcbank",
            destination_van="RAZR_UNMAPPED_7500",
            payment_mode="NEFT",
            status=TransactionStatus.SUSPENSE,
            confidence_score=0.25
        ),
        IncomingTransaction(
            utr_number="UTR_UPI_2026_PT9901",
            amount=65000.0,
            remitter_name="Kavita Deshmukh Enterprises",
            remitter_phone="9833445566",
            remitter_upi="kavita.ent@icici",
            destination_van="RAZR_UNMAPPED_6500",
            payment_mode="UPI",
            status=TransactionStatus.SUSPENSE,
            confidence_score=0.55
        ),
        IncomingTransaction(
            utr_number="UTR_IMPS_2026_88003",
            amount=55000.0,
            remitter_name="Nexus Cloud Systems",
            remitter_phone="9766554433",
            remitter_upi="nexus.pay@sbi",
            destination_van="RAZR_UNMAPPED_5500",
            payment_mode="IMPS",
            status=TransactionStatus.SUSPENSE,
            confidence_score=0.03
        ),
        IncomingTransaction(
            utr_number="UTR_RTGS_2026_88004",
            amount=98000.0,
            remitter_name="Zenith Infra Infrastructure",
            remitter_phone="9899112233",
            remitter_upi=None,
            destination_van="RAZR_UNMAPPED_9800",
            payment_mode="RTGS",
            status=TransactionStatus.SUSPENSE,
            confidence_score=0.88
        ),
        IncomingTransaction(
            utr_number="UTR_UPI_2026_44120",
            amount=42000.0,
            remitter_name="Sanjay Verma Agro Traders",
            remitter_phone="9811223344",
            remitter_upi="sanjay.agro@okaxis",
            destination_van="RAZR_UNMAPPED_4200",
            payment_mode="UPI",
            status=TransactionStatus.SUSPENSE,
            confidence_score=0.12
        )
    ]

    for tx in transactions:
        db.add(tx)

    db.commit()
    db.close()
    print("[SUCCESS] Database successfully seeded with clean suspense pool.")

if __name__ == "__main__":
    seed()