import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { PAYU_CONFIG, generatePayuHash } from "@/utils/payuConfig";
import { z } from 'zod';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

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

  try {
    const body = await req.json();
    const validatedData = initiatePaymentSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
    }

    const { courseId, consultationId } = validatedData.data;
    const user = req.user;

    let amount: number;
    let productinfo: string;
    let paymentType: 'COURSE' | 'CONSULTATION';

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { instructor: { include: { user: true } } },
      });
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      amount = course.price;
      productinfo = `Course: ${course.title}`;
      paymentType = 'COURSE';
    } else if (consultationId) {
      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: { instructor: { include: { user: true } } },
      });
      if (!consultation) {
        return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
      }
      if (consultation.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      amount = consultation.price;
      productinfo = `Consultation with ${consultation.instructor.user.name} on ${consultation.scheduledAt.toLocaleString()}`;
      paymentType = 'CONSULTATION';
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const txnid = `${paymentType}_${Date.now()}`;
    const hash = generatePayuHash(
      txnid,
      amount.toFixed(2),
      productinfo,
      user.name,
      user.email
    );

    const paymentData = {
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
          status: "INITIATED",
          hash,
        },
      },
    };

    const payment = await prisma.payment.create({ data: paymentData });

    if (consultationId) {
      await prisma.consultation.update({
        where: { id: consultationId },
        data: { payment: { connect: { id: payment.id } } },
      });
    }

    return NextResponse.json({
      paymentUrl: PAYU_CONFIG.payuBaseUrl,
      params: {
        key: PAYU_CONFIG.merchantKey,
        txnid,
        amount: amount.toFixed(2),
        productinfo,
        firstname: user.name,
        email: user.email,
        surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/success`,
        furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/failure`,
        hash,
      },
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}

export const POST = authenticate(handler);