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

  // Improved base URL handling
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "")
    : "http://localhost:3000";

  // Validate base URL more thoroughly
  try {
    new URL(baseUrl);
  } catch {
    console.error("Invalid base URL:", baseUrl);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

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

  if (!isValidHash) {
    return NextResponse.redirect(
      `${baseUrl}/payment/error?reason=hash_verification_failed`
    );
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { transactionId: txnid },
      include: { consultation: true },
    });

    if (!payment) {
      console.error("Payment not found for txnid:", txnid);
      return NextResponse.redirect(
        `${baseUrl}/payment/error?reason=payment_not_found`
      );
    }

    await prisma.payment.update({
      where: { transactionId: txnid },
      data: {
        status: "COMPLETED",
        payuTransaction: {
          update: {
            status,
            unmappedstatus: formData.get("unmappedstatus") as string,
            mode: formData.get("mode") as string,
            netAmount: parseFloat(
              (formData.get("net_amount_debit") as string) || "0"
            ),
          },
        },
      },
    });

    if (payment.consultationId) {
      await prisma.consultation.update({
        where: { id: payment.consultationId },
        data: { status: "APPROVED" },
      });
    }

    return NextResponse.redirect(`${baseUrl}/payment/success`);
  } catch (error) {
    console.error("Payment success handler error:", error);
    return NextResponse.redirect(
      `${baseUrl}/payment/error?reason=processing_failed`
    );
  }
}
