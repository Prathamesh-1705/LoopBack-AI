import enum
import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base

class InvoiceStatus(str, enum.Enum):
    UNPAID = "UNPAID"
    PAID = "PAID"
    PARTIALLY_PAID = "PARTIALLY_PAID"

class TransactionStatus(str, enum.Enum):
    SUSPENSE = "SUSPENSE"
    AUTO_RESOLVED = "AUTO_RESOLVED"
    CONFIRMED_USER = "CONFIRMED_USER"
    REFUNDED = "REFUNDED"
    ESCALATED = "ESCALATED"

# Tenant Organization Configuration Supporting Infinite Dynamic DB Connections
class OrganizationSettings(Base):
    __tablename__ = "organization_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(150), nullable=False)
    corporate_domain = Column(String(100), nullable=False)
    
    # Primary Connection URI
    primary_db_type = Column(String(50), default="POSTGRESQL")
    primary_db_uri = Column(String(500), nullable=True)
    
    # Serialized JSON array of arbitrary extra database connections:
    # [{"name": "ERP Ledger", "engine": "ORACLE", "uri": "..."}, ...]
    additional_connectors = Column(Text, default="[]")
    
    payment_gateway_provider = Column(String(50), default="RAZORPAY")
    is_configured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CompanyEmployeeDirectory(Base):
    __tablename__ = "company_employee_directory"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    corporate_email = Column(String(100), unique=True, index=True, nullable=False)
    official_name = Column(String(100), nullable=False)
    assigned_role = Column(String(100), nullable=False)
    is_claimed = Column(Boolean, default=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(100), default="Finance Ops", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    amount = Column(Float, nullable=False)
    virtual_account_number = Column(String(50), unique=True, index=True, nullable=False)
    due_date = Column(DateTime, nullable=True)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.UNPAID, nullable=False)
    is_archived = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    paid_at = Column(DateTime, nullable=True)

    transactions = relationship("IncomingTransaction", back_populates="matched_invoice")

class IncomingTransaction(Base):
    __tablename__ = "incoming_transactions"

    id = Column(Integer, primary_key=True, index=True)
    utr_number = Column(String(100), unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    remitter_name = Column(String(150), nullable=False)
    remitter_phone = Column(String(20), nullable=False)
    remitter_upi = Column(String(100), nullable=True)
    destination_van = Column(String(50), nullable=True)
    payment_mode = Column(String(20), default="UPI")
    status = Column(Enum(TransactionStatus), default=TransactionStatus.SUSPENSE, nullable=False)
    confidence_score = Column(Float, default=0.0)
    matched_invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    is_archived = Column(Boolean, default=False, index=True)
    received_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    matched_invoice = relationship("Invoice", back_populates="transactions")
    audit_logs = relationship("AuditLog", back_populates="transaction")
    chat_messages = relationship("ChatMessageRecord", back_populates="transaction", order_by="ChatMessageRecord.id.asc()")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("incoming_transactions.id"), nullable=False)
    action = Column(String(50), nullable=False)
    details = Column(Text, nullable=False)
    performed_by = Column(String(100), default="SYSTEM_ENGINE")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    transaction = relationship("IncomingTransaction", back_populates="audit_logs")

class ChatMessageRecord(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("incoming_transactions.id"), nullable=False, index=True)
    msg_id = Column(String(100), nullable=False)
    sender = Column(String(50), nullable=False)  # "staff" or "customer"
    sender_name = Column(String(150), nullable=False)
    text = Column(Text, nullable=False)
    timestamp = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    transaction = relationship("IncomingTransaction", back_populates="chat_messages")