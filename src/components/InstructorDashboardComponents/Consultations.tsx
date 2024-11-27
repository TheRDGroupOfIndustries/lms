"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { ExternalLink, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"

interface Consultation {
  id: string
  student: string
  date: string
  time: string
  status: string
  meetLink?: string
  paymentStatus: string
  duration: number
  price: number
  notes?: string
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchConsultations()
  }, [])

  async function fetchConsultations() {
    try {
      const response = await fetch('/api/instructor/consultations');
      const data = await response.json();
      if (Array.isArray(data.consultations)) {
        setConsultations(data.consultations);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch consultations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (consultationId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/consultations/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consultationId }),
      })
  
      const data = await response.json()
  
      if (response.status === 401 && data.authUrl) {
        // Redirect to Google auth
        window.location.href = data.authUrl
      } else if (!response.ok) {
        throw new Error(data.error || 'Failed to approve consultation')
      } else {
        toast({
          title: "Success",
          description: "Consultation approved successfully.",
        })
        fetchConsultations() // Refresh the consultations list
      }
    } catch (error) {
      console.error('Error approving consultation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve consultation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (consultationId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/consultations/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consultationId }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject consultation')
      } else {
        toast({
          title: "Success",
          description: "Consultation rejected successfully.",
        })
        fetchConsultations() // Refresh the consultations list
      }
    } catch (error) {
      console.error('Error rejecting consultation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject consultation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = consultations.filter(consultation =>
    (consultation.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.status.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeTab === "all" || consultation.status.toLowerCase() === activeTab)
  )

  const renderConsultationTable = (consultations: Consultation[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[#B2B2B2]">Student</TableHead>
          <TableHead className="text-[#B2B2B2]">Date</TableHead>
          <TableHead className="text-[#B2B2B2]">Time</TableHead>
          <TableHead className="text-[#B2B2B2]">Duration</TableHead>
          <TableHead className="text-[#B2B2B2]">Price</TableHead>
          <TableHead className="text-[#B2B2B2]">Status</TableHead>
          <TableHead className="text-[#B2B2B2]">Payment</TableHead>
          <TableHead className="text-[#B2B2B2]">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {consultations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              No consultations found.
            </TableCell>
          </TableRow>
        ) : (
          consultations.map((consultation) => (
            <TableRow key={consultation.id}>
              <TableCell>{consultation.student}</TableCell>
              <TableCell>{consultation.date}</TableCell>
              <TableCell>{consultation.time}</TableCell>
              <TableCell>{consultation.duration} hour(s)</TableCell>
              <TableCell>₹{consultation.price.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    consultation.status === 'PENDING'
                      ? 'outline'
                      : consultation.status === 'APPROVED'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {consultation.status.toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {consultation.paymentStatus.toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {consultation.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(consultation.id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(consultation.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {consultation.status === 'APPROVED' && consultation.meetLink && (
                    <Button size="sm" variant="outline" onClick={() => window.open(consultation.meetLink, '_blank')}>
                      Start Meeting
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-[13px]">
        <h1 className="text-2xl font-bold tracking-tight">Consultation Requests</h1>
        <p className="text-[#858585]">
          Manage your upcoming consultation requests
        </p>
      </div>
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Consultations</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search consultations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <TabsContent value="all" className="mt-4">
            {renderConsultationTable(filteredConsultations)}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}