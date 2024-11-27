"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface Instructor {
    id: string
    user: {
        name: string
    }
    hourlyRate: number
}

export default function Book() {
    const [date, setDate] = useState<Date>()
    const [selectedTime, setSelectedTime] = useState<string>()
    const [selectedInstructor, setSelectedInstructor] = useState<string>()
    const [selectedDuration, setSelectedDuration] = useState<number>(1)
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [instructors, setInstructors] = useState<Instructor[]>([])

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await fetch('/api/consultations/instructors');
                if (response.ok) {
                    const data = await response.json();
                    setInstructors(data);
                } else {
                    console.error('Failed to fetch instructors');
                    toast({
                        title: "Error",
                        description: "Failed to fetch instructors. Please try again.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error('Error fetching instructors:', error);
                toast({
                    title: "Error",
                    description: "An error occurred while fetching instructors.",
                    variant: "destructive",
                });
            }
        };

        fetchInstructors();
    }, []);

    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00", "13:00",
        "14:00", "15:00", "16:00", "17:00"
    ]

    const handleBookConsultation = async () => {
        if (!selectedInstructor || !date || !selectedTime) return

        setIsLoading(true)
        try {
            const scheduledAt = new Date(`${format(date, "yyyy-MM-dd")}T${selectedTime}`);
            const response = await fetch("/api/consultations/book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    instructorId: selectedInstructor,
                    scheduledAt: scheduledAt.toISOString(),
                    duration: selectedDuration,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Consultation booked successfully. Awaiting instructor approval.",
                });
                setIsBookingModalOpen(false);
            } else {
                throw new Error(data.error || "Failed to book consultation");
            }
        } catch (error) {
            console.error("Booking error:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An error occurred while booking the consultation.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="flex-1 space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-2">Book a Consultation</h1>
                <p className="text-muted-foreground">
                    Select an expert, date, and time for your consultation.
                </p>
            </div>

            <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Select Consultant</label>
                    <Select onValueChange={setSelectedInstructor}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose an Expert" />
                        </SelectTrigger>
                        <SelectContent>
                            {instructors.map((instructor) => (
                                <SelectItem key={instructor.id} value={instructor.id}>
                                    {instructor.user.name} - ₹{instructor.hourlyRate}/hr
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Select Date</label>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="border rounded-md"
                        components={{
                            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                            IconRight: () => <ChevronRight className="h-4 w-4" />,
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Select Time</label>
                    <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                            <Button
                                key={time}
                                variant="outline"
                                className={cn(
                                    "w-full",
                                    selectedTime === time && "border-primary bg-primary/10"
                                )}
                                onClick={() => setSelectedTime(time)}
                            >
                                {time}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Select Duration (hours)</label>
                    <Select onValueChange={(value) => setSelectedDuration(parseInt(value))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose Duration" />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                                <SelectItem key={hours} value={hours.toString()}>
                                    {hours} {hours === 1 ? 'hour' : 'hours'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setIsBookingModalOpen(true)}
                    disabled={!selectedInstructor || !date || !selectedTime || !selectedDuration}
                >
                    Book Consultation
                </Button>
            </div>

            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Consultation Booking</DialogTitle>
                        <DialogDescription>
                            Please review your consultation details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p><strong>Consultant:</strong> {instructors.find(i => i.id === selectedInstructor)?.user.name}</p>
                        <p><strong>Date:</strong> {date ? format(date, "PPP") : "Not selected"}</p>
                        <p><strong>Time:</strong> {selectedTime || "Not selected"}</p>
                        <p><strong>Duration:</strong> {selectedDuration} {selectedDuration === 1 ? 'hour' : 'hours'}</p>
                        <p><strong>Price:</strong> ₹{(instructors.find(i => i.id === selectedInstructor)?.hourlyRate || 0) * selectedDuration}</p>
                    </div>
                    <Button
                        onClick={handleBookConsultation}
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isLoading ? "Processing..." : "Confirm Booking and Pay"}
                    </Button>
                </DialogContent>
            </Dialog>
        </main>
    )
}

