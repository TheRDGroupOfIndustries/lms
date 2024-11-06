import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { PAYU_CONFIG, generatePayuHash } from "@/utils/payuConfig";
import { z } from 'zod';

type AuthenticatedRequest = NextRequest & {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
};

const initiatePaymentSchema = z.object({
  courseId: z.string().cuid().optional(),
  consultationId: z.string().cuid().optional(),
}).refine((data) => data.courseId || data.consultationId, {
  message: "Either courseId or consultationId must be provided",
});

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = req.user;

  try {
    const body = await req.json();
    const validatedData = initiatePaymentSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
    }

    const { courseId, consultationId } = validatedData.data;

    let amount: number;
    let productinfo: string;

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }
      amount = course.price;
      productinfo = `Course: ${course.title}`;
    } else if (consultationId) {
      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: { instructor: { include: { user: true } } },
      });
      if (!consultation) {
        return NextResponse.json(
          { error: "Consultation not found" },
          { status: 404 }
        );
      }
      amount = consultation.price;
      productinfo = `Consultation with ${
        consultation.instructor.user.name
      } on ${consultation.scheduledAt.toISOString()}`;
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const txnid = `TXN_${Date.now()}`;
    const hash = generatePayuHash(
      txnid,
      amount,
      productinfo,
      user.name,
      user.email
    );

    try {
      await prisma.payment.create({
        data: {
          amount,
          currency: "INR",
          status: "INITIATED",
          paymentMethod: "PAYU",
          transactionId: txnid,
          userId: user.id,
          courseId,
          consultationId,
          payuTransaction: {
            create: {
              txnid,
              amount,
              productinfo,
              firstname: user.name,
              email: user.email,
              phone: user.phone,
              status: "INITIATED",
              hash,
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to create payment record:", error);
      return NextResponse.json(
        { error: "Failed to initiate payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paymentUrl: PAYU_CONFIG.payuBaseUrl,
      params: {
        key: PAYU_CONFIG.merchantKey,
        txnid,
        amount,
        productinfo,
        firstname: user.name,
        email: user.email,
        phone: user.phone || "",
        surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/success`,
        furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/failure`,
        hash,
      },
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

export const POST = authenticate(handler);