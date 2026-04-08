"use client";

import { PaymentMethod } from "@/types";
import { HiCheckCircle } from "react-icons/hi";

interface PaymentSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}[] = [
  {
    id: "esewa",
    name: "eSewa",
    description: "Pay with eSewa digital wallet",
    color: "text-green-700",
    bgColor: "bg-green-600",
    icon: "eSewa",
  },
  {
    id: "khalti",
    name: "Khalti",
    description: "Pay with Khalti digital wallet",
    color: "text-purple-700",
    bgColor: "bg-purple-600",
    icon: "Khalti",
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard accepted",
    color: "text-blue-700",
    bgColor: "bg-blue-600",
    icon: "Card",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank transfer (Nepal banks)",
    color: "text-gray-700",
    bgColor: "bg-gray-600",
    icon: "Bank",
  },
];

export default function PaymentSelector({
  selected,
  onSelect,
}: PaymentSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-nepal-slate">
        Select Payment Method
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              selected === method.id
                ? "border-nepal-crimson bg-nepal-crimson/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`flex h-10 w-14 items-center justify-center rounded-lg ${method.bgColor}`}
            >
              <span className="text-xs font-bold text-white">
                {method.icon}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-nepal-slate">
                {method.name}
              </p>
              <p className="text-xs text-gray-500">{method.description}</p>
            </div>
            {selected === method.id && (
              <HiCheckCircle className="h-5 w-5 text-nepal-crimson" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
