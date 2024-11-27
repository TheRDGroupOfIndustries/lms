import { Suspense } from "react"
import { Sidebar } from "./UserSidebar"
import { Navbar } from "./Navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Book from "./Consultations/Book"
import MyConsultations from "./Consultations/MyConsultations"

const Consultations = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="w-64 border-r bg-white p-4">
                <Sidebar />
            </div>
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
                <header className="border-b bg-white p-4">
                    <Navbar />
                </header>
                <main className="flex w-full flex-col overflow-hidden mt-14">
                    <Suspense>
                        <div className="flex flex-col gap-8 p-8">
                            <Tabs defaultValue="book" className="w-full">
                                <TabsList className="flex w-1/2 gap-4 bg-white p-1 rounded-full">
                                    <TabsTrigger
                                        value="book"
                                        className="flex-1 inline-block shadow-md hover:shadow-lg px-4 py-2 text-sm sm:text-base rounded-full border border-green-500 text-green-500 hover:text-white hover:bg-[#1AA34A] transition data-[state=active]:text-white data-[state=active]:bg-[#1AA34A]"
                                    >
                                        Book Consultation
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="consultations"
                                        className="flex-1 inline-block shadow-md hover:shadow-lg px-4 py-2 text-sm sm:text-base rounded-full border border-green-500 text-green-500 hover:text-white hover:bg-[#1AA34A] transition data-[state=active]:text-white data-[state=active]:bg-[#1AA34A]"
                                    >
                                        My Consultations
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="book" className="mt-6">
                                    <Book />
                                </TabsContent>
                                <TabsContent value="consultations" className="mt-6">
                                    <MyConsultations />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </Suspense>
                </main>
            </div>
        </div>
    )
}

export default Consultations