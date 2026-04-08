import crypto from "crypto";

interface EsewaPaymentParams {
  amount: number;
  taxAmount?: number;
  productServiceCharge?: number;
  productDeliveryCharge?: number;
  productCode: string;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
}

export function generateEsewaSignature(message: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);
  return hmac.digest("base64");
}

export function createEsewaPaymentPayload(params: EsewaPaymentParams) {
  const {
    amount,
    taxAmount = 0,
    productServiceCharge = 0,
    productDeliveryCharge = 0,
    productCode,
    transactionUuid,
    successUrl,
    failureUrl,
  } = params;

  const totalAmount = amount + taxAmount + productServiceCharge + productDeliveryCharge;
  const secret = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = generateEsewaSignature(message, secret);

  return {
    amount: amount.toString(),
    tax_amount: taxAmount.toString(),
    product_service_charge: productServiceCharge.toString(),
    product_delivery_charge: productDeliveryCharge.toString(),
    total_amount: totalAmount.toString(),
    transaction_uuid: transactionUuid,
    product_code: productCode,
    signature,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    success_url: successUrl,
    failure_url: failureUrl,
  };
}

export async function verifyEsewaPayment(encodedData: string): Promise<{
  success: boolean;
  data?: Record<string, string>;
}> {
  try {
    const decoded = Buffer.from(encodedData, "base64").toString("utf-8");
    const data = JSON.parse(decoded);

    const secret = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    const message = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;
    const expectedSignature = generateEsewaSignature(message, secret);

    if (data.signature !== expectedSignature) {
      return { success: false };
    }

    return { success: true, data };
  } catch {
    return { success: false };
  }
}
