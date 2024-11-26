"use client"

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PaymentFailure: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsComponent />
    </Suspense>
  );
};

const SearchParamsComponent: React.FC = () => {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "Unknown error";

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1 style={{ color: "red" }}>Payment Failed 😞</h1>
      <p>Unfortunately, your payment could not be processed.</p>
      <p>
        Reason: <strong>{reason}</strong>
      </p>
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default PaymentFailure;