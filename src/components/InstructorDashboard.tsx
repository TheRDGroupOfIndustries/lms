import { Suspense } from "react"
import { Sidebar } from "./InstructorSidebar"
import { Navbar } from "./Navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Profile from "./InstructorDashboardComponents/Profile"
import ConsultationsPage from "./InstructorDashboardComponents/Consultations"
import CoursesPage from "./InstructorDashboardComponents/Courses"

export default function InstructorDashboard() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="w-64 border-r bg-white p-4">
                <Sidebar />
            </div>
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
                <header className="border-b bg-white p-4">
                    <Navbar />
                </header>
                <main className="flex w-full flex-col overflow-hidden mt-10">
                    <Suspense>
                        <div className="flex flex-col gap-8 p-8">
                            <Tabs defaultValue="profile" className="w-full">
                                <TabsList className="flex w-1/2 gap-4 bg-white p-1 rounded-full">
                                    <TabsTrigger
                                        value="profile"
                                        className="flex-1 inline-block shadow-md hover:shadow-lg px-4 py-2 text-sm sm:text-base rounded-full border border-green-500 text-green-500 hover:text-white hover:bg-[#1AA34A] transition data-[state=active]:text-white data-[state=active]:bg-[#1AA34A]"
                                    >
                                        Profile
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="consultations"
                                        className="flex-1 inline-block shadow-md hover:shadow-lg px-4 py-2 text-sm sm:text-base rounded-full border border-green-500 text-green-500 hover:text-white hover:bg-[#1AA34A] transition data-[state=active]:text-white data-[state=active]:bg-[#1AA34A]"
                                    >
                                        Consultations
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="courses"
                                        className="flex-1 inline-block shadow-md hover:shadow-lg px-4 py-2 text-sm sm:text-base rounded-full border border-green-500 text-green-500 hover:text-white hover:bg-[#1AA34A] transition data-[state=active]:text-white data-[state=active]:bg-[#1AA34A]"
                                    >
                                        Courses
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="profile" className="mt-6">
                                    <Profile />
                                </TabsContent>
                                <TabsContent value="consultations" className="mt-6">
                                    <ConsultationsPage />
                                </TabsContent>
                                <TabsContent value="courses" className="mt-6">
                                    <CoursesPage />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </Suspense>
                </main>
            </div>
        </div>
    )
}