"use client";

import React, { Suspense } from "react"; // Import Suspense
import { useSearchParams, useRouter } from "next/navigation";

const PaymentSuccess: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
};

const PaymentSuccessContent: React.FC = () => {
  const searchParams = useSearchParams(); // Get query parameters
  const router = useRouter(); // Navigation for button redirect

  const txnid = searchParams.get("txnid") || "N/A";

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1 style={{ color: "green" }}>Payment Successful 🎉</h1>
      <p>Your payment was processed successfully!</p>
      <p>
        Transaction ID: <strong>{txnid}</strong>
      </p>
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "green",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default PaymentSuccess;