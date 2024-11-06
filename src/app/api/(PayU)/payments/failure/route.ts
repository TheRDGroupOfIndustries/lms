import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { generatePayuHash } from "@/utils/payuConfig";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const status = formData.get("status") as string;
  const txnid = formData.get("txnid") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const productinfo = formData.get("productinfo") as string;
  const firstname = formData.get("firstname") as string;
  const email = formData.get("email") as string;
  const hash = formData.get("hash") as string;

  // Verify the hash
  const calculatedHash = generatePayuHash(
    txnid,
    amount,
    productinfo,
    firstname,
    email
  );
  if (calculatedHash !== hash) {
    return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
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

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`
    );
  } catch (error) {
    console.error("Payment failure error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error`
    );
  }
}
