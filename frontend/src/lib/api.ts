function getBaseUrl(): string {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname || "localhost";
        return `http://${hostname}:8000/api`;
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
}

function getAuthHeader(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("loopback_jwt_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function resilientFetch(endpoint: string, options: RequestInit = {}) {
    const headers = {
        ...getAuthHeader(),
        ...(options.headers || {}),
    };

    const primaryUrl = getBaseUrl();
    try {
        const res = await fetch(`${primaryUrl}${endpoint}`, {
            ...options,
            headers,
            cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.detail || data.message || `HTTP Error ${res.status}`);
        }
        return data;
    } catch (err: any) {
        const fallbackUrl = primaryUrl.includes("127.0.0.1")
            ? primaryUrl.replace("127.0.0.1", "localhost")
            : primaryUrl.replace("localhost", "127.0.0.1");

        try {
            const fallbackRes = await fetch(`${fallbackUrl}${endpoint}`, {
                ...options,
                headers,
                cache: "no-store",
            });
            const data = await fallbackRes.json().catch(() => ({}));
            if (!fallbackRes.ok) {
                throw new Error(data.detail || data.message || `HTTP Error ${fallbackRes.status}`);
            }
            return data;
        } catch (innerErr: any) {
            throw new Error(innerErr.message || "Failed to reach backend API.");
        }
    }
}

export async function fetchOrgStatus() {
    try {
        return await resilientFetch("/organization/status");
    } catch {
        return { configured: true };
    }
}

export async function testDbConnection(payload: any) {
    return await resilientFetch("/organization/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(typeof payload === "string" ? { db_uri: payload } : payload),
    });
}

export async function setupOrganization(payload: any) {
    return await resilientFetch("/organization/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function loginUser(idOrEmail: string, pass: string) {
    return await resilientFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id_or_email: idOrEmail, password: pass }),
    });
}

export async function registerUser(data: {
    employee_id: string;
    email: string;
    role: string;
    password: string;
}) {
    return await resilientFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

export async function fetchCurrentUser() {
    try {
        return await resilientFetch("/auth/me");
    } catch {
        return { authenticated: false };
    }
}

export async function fetchTransactions() {
    try {
        return await resilientFetch("/transactions");
    } catch {
        return [];
    }
}

export async function fetchMetrics() {
    try {
        return await resilientFetch("/dashboard-metrics");
    } catch {
        return {
            total_revenue_recovered: 0,
            total_refunded_misdirected: 0,
            total_unresolved_suspense: 0,
            recovery_rate_percentage: 0,
            total_processed_count: 0,
        };
    }
}

export async function runRecoveryBatch() {
    return await resilientFetch("/run-recovery-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
}

export async function archiveSettledRecords() {
    return await resilientFetch("/archive-settled", {
        method: "POST",
    });
}

export async function resetDatabase() {
    return await resilientFetch("/reset-database", {
        method: "POST",
    });
}

export async function pairTesterDevice(phoneNumber: string) {
    return await resilientFetch("/gateway/tester-device-pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber }),
    });
}