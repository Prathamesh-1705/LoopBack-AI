import os
import json
import re
import base64
import urllib.parse
import urllib.request

# Load backend/.env if present
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

# Live Phone Delivery Bridge Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8660302674:AAHUPw12KXFQuriL_M7fno3frwdn27PHHR4")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# Twilio WhatsApp Business Configuration (Loaded from .env)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
TWILIO_CONTENT_SID = os.getenv("TWILIO_CONTENT_SID", "")

# Meta WhatsApp Cloud API Configuration
WHATSAPP_API_TOKEN = os.getenv("WHATSAPP_API_TOKEN", "")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
WHATSAPP_API_VERSION = os.getenv("WHATSAPP_API_VERSION", "v20.0")
WHATSAPP_WEBHOOK_VERIFY_TOKEN = os.getenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", "loopback_ai_verify_token")
PORTAL_BRAND_NAME = os.getenv("PORTAL_BRAND_NAME", "LoopBack AI Settlement Gateway")

def format_whatsapp_phone(phone_raw: str) -> str:
    """Format raw phone number to international E.164 without leading plus."""
    digits = re.sub(r"\D", "", str(phone_raw or ""))
    if len(digits) == 10:
        return f"91{digits}"
    return digits

def dispatch_live_message(
    to_phone: str,
    message_text: str,
    customer_name: str = "Customer",
    sender_org: str = None,
    tx_id: int = None,
    custom_buttons: list = None
) -> dict:
    """
    Universal Live Carrier Dispatcher:
    - Dispatches rich interactive verification cards with clickable action buttons directly to Telegram & WhatsApp.
    """
    org_header = sender_org or PORTAL_BRAND_NAME
    clean_phone = format_whatsapp_phone(to_phone)
    target_tx = str(tx_id or "1")

    # 1. Telegram Dispatch with Live Interactive Buttons
    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        try:
            tg_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            
            tg_card = (
                f"🏢 *{org_header.upper()}*\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"{message_text}\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"📱 *Linked Device:* `+{clean_phone}`\n"
                f"🔒 _Official Enterprise Settlement Rail_"
            )

            # Interactive Clickable Action Buttons
            inline_keyboard = [
                [
                    {"text": "✅ Approve & Clear", "callback_data": f"approve_{target_tx}"},
                    {"text": "❌ Refund Account", "callback_data": f"refund_{target_tx}"}
                ],
                [
                    {"text": "🌐 Language (भाषा)", "callback_data": f"lang_{target_tx}"},
                    {"text": "📄 Invoice Details", "callback_data": f"inv_{target_tx}"}
                ]
            ]

            payload = {
                "chat_id": TELEGRAM_CHAT_ID,
                "text": tg_card,
                "parse_mode": "Markdown",
                "reply_markup": {"inline_keyboard": inline_keyboard}
            }

            req = urllib.request.Request(
                tg_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode())
                print(f"[SUCCESS] [TELEGRAM DISPATCHED TO CHAT {TELEGRAM_CHAT_ID}]")
                return {"success": True, "provider": "TELEGRAM", "data": data}
        except Exception as e:
            print(f"[TELEGRAM DISPATCH ERROR]: {e}")

    # 2. Twilio WhatsApp Dispatch
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and clean_phone:
        try:
            twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
            to_whatsapp = f"whatsapp:+{clean_phone}"
            auth_str = f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}"
            b64_auth = base64.b64encode(auth_str.encode()).decode()
            
            post_fields = {
                "To": to_whatsapp,
                "From": TWILIO_WHATSAPP_FROM,
                "ContentSid": TWILIO_CONTENT_SID
            }
            data = urllib.parse.urlencode(post_fields).encode("utf-8")
            
            req_twilio = urllib.request.Request(
                twilio_url,
                data=data,
                headers={"Authorization": f"Basic {b64_auth}", "Content-Type": "application/x-www-form-urlencoded"}
            )
            with urllib.request.urlopen(req_twilio, timeout=8) as tw_resp:
                resp_data = json.loads(tw_resp.read().decode())
                print(f"[SUCCESS] [WHATSAPP DISPATCHED TO {to_whatsapp}] (SID: {resp_data.get('sid')})")
                return {"success": True, "provider": "TWILIO_WHATSAPP", "sid": resp_data.get("sid")}
        except Exception as e:
            print(f"[TWILIO DISPATCH ERROR]: {e}")

    # 3. Local Simulated Fallback
    print(f"[SIMULATED] Delivered to {clean_phone} ({customer_name}) | Org: {org_header}")
    return {"success": True, "provider": "SIMULATED", "org": org_header, "phone": clean_phone}