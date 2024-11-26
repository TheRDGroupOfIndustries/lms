import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { verifyPayuHash } from "@/utils/payuConfig";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const status = formData.get("status") as string;
  const txnid = formData.get("txnid") as string;
  const amount = formData.get("amount") as string;
  const productinfo = formData.get("productinfo") as string;
  const firstname = formData.get("firstname") as string;
  const email = formData.get("email") as string;
  const hash = formData.get("hash") as string;

  // Verify the hash
  const isValidHash = verifyPayuHash(
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    status,
    hash
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "")
    : "http://localhost:3000";

  try {
    new URL(baseUrl);
  } catch {
    console.error("Invalid base URL:", baseUrl);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!isValidHash) {
    console.error("Hash mismatch:", {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
    });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?reason=invalid_hash`
    );
  }

  try {
    await prisma.payment.update({
      where: { transactionId: txnid },
      data: {
        status: "FAILED",
        payuTransaction: {
          update: {
            status,
            unmappedstatus: formData.get("unmappedstatus") as string,
            error: formData.get("error") as string,
            errorMessage: formData.get("error_Message") as string,
          },
        },
      },
    });

    const failureUrl = `${baseUrl}/payment/failure`;
    return NextResponse.redirect(failureUrl);
  } catch (error) {
    console.error("Payment success handler error:", error);
    return NextResponse.redirect(
      `${baseUrl}/payment/error?reason=processing_failed`
    );
  }
}
