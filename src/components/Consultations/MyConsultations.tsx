'use client'

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar, Clock, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface Consultation {
  id: string
  instructorName: string
  formattedDate: string
  formattedTime: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS'
  meetLink?: string
  price?: number
  startTime?: string
  payment?: boolean
}

export default function Component() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = await fetch('/api/consultations/user')
        if (!response.ok) throw new Error('Failed to fetch consultations')
        const data = await response.json()
        setConsultations(data)
      } catch (err) {
        setError('Failed to load consultations')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchConsultations()

    // Set up SSE listener
    const eventSource = new EventSource('/api/sse');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'consultation_updated') {
        setConsultations(prevConsultations =>
          prevConsultations.map(consultation =>
            consultation.id === data.data.id ? { ...consultation, ...data.data } : consultation
          )
        );
      } else if (data.type === 'consultation_booked') {
        setConsultations(prevConsultations => [...prevConsultations, data.data]);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [])

  const getStatusBadge = (status: Consultation['status']) => {
    const variants: Record<Consultation['status'], { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      APPROVED: { variant: "default", label: "Approved" },
      PENDING: { variant: "secondary", label: "Pending" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      COMPLETED: { variant: "outline", label: "Completed" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
      IN_PROGRESS: { variant: "default", label: "In Progress" }
    }

    const { variant, label } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  const handlePayment = async (consultationId: string) => {
    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consultationId,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Create and submit form to PayU
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.paymentUrl;
  
        // Ensure all required parameters are present
        Object.entries(data.params).forEach(([key, value]) => {
          if (value) {  // Only add parameter if value exists
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          }
        });
  
        // Append form to body and submit
        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while initiating the payment.",
        variant: "destructive",
      });
    }
  };

  const handleStartMeeting = async (consultationId: string, meetLink: string) => {
    try {
      const startTime = new Date().toISOString();
      const response = await fetch(`/api/consultations/${consultationId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startTime }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start meeting');
      }

      const data = await response.json();

      // Open Google Meet link in a new tab
      window.open(meetLink, '_blank');

      // Update local state
      setConsultations(prevConsultations =>
        prevConsultations.map(consultation =>
          consultation.id === consultationId
            ? { ...consultation, startTime, status: 'COMPLETED' as Consultation['status'] }
            : consultation
        )
      );

      toast({
        title: "Success",
        description: data.message || "Meeting started successfully.",
      });
    } catch (error) {
      console.error('Error starting meeting:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start the meeting. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">My Scheduled Consultations</h2>
        <p className="text-sm text-muted-foreground">
          View and manage your upcoming consultations
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Consultant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No consultations scheduled
                </TableCell>
              </TableRow>
            ) : (
              consultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell>{consultation.instructorName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {consultation.formattedDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {consultation.formattedTime}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(consultation.status)}</TableCell>
                  <TableCell>₹{consultation.price?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>
                    {consultation.status === 'APPROVED' && !consultation.payment && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePayment(consultation.id)}
                      >
                        Pay Now
                      </Button>
                    )}
                    {consultation.status === 'APPROVED' && consultation.payment && consultation.meetLink && !consultation.startTime && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartMeeting(consultation.id, consultation.meetLink!)}
                      >
                        Start Meeting
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    {(consultation.status === 'PENDING' || consultation.status === 'REJECTED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                      >
                        {consultation.status === 'PENDING' ? 'Awaiting Approval' : 'Rejected'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
</div>
  )
}