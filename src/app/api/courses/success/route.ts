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
    String(amount),
    productinfo,
    firstname,
    email
  );
  if (calculatedHash !== hash) {
    return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
  }

  try {
    const updatedPayment = await prisma.payment.update({
      where: { transactionId: txnid },
      data: {
        status: "COMPLETED",
        payuTransaction: {
          update: {
            status,
            unmappedstatus: formData.get("unmappedstatus") as string,
            mode: formData.get("mode") as string,
            netAmount: parseFloat(formData.get("net_amount_debit") as string),
          },
        },
      },
      include: { course: true },
    });

    if (updatedPayment.courseId) {
      await prisma.courseEnrollment.create({
        data: {
          userId: updatedPayment.userId,
          courseId: updatedPayment.courseId,
        },
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?courseId=${updatedPayment.courseId}`
    );
  } catch (error) {
    console.error("Payment success error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error`
    );
  }
}