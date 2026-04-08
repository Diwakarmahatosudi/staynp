interface KhaltiInitPayload {
  returnUrl: string;
  websiteUrl: string;
  amount: number; // in paisa (1 NPR = 100 paisa)
  purchaseOrderId: string;
  purchaseOrderName: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface KhaltiInitResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired";
  transaction_id: string;
  fee: number;
  refunded: boolean;
}

const KHALTI_BASE_URL = "https://a.khalti.com/api/v2";

export async function initializeKhaltiPayment(
  payload: KhaltiInitPayload
): Promise<KhaltiInitResponse> {
  const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
    method: "POST",
    headers: {
      Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to initialize Khalti payment");
  }

  return response.json();
}

export async function verifyKhaltiPayment(
  pidx: string
): Promise<KhaltiLookupResponse> {
  const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  if (!response.ok) {
    throw new Error("Failed to verify Khalti payment");
  }

  return response.json();
}
