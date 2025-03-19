import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import FormRenderer from "@/components/form-renderer/form-renderer"
import { getPdfFormData } from "@/lib/pdf-parser"

export default function DashboardPage() {
  // In a real application, this would be a server-side check
  const isAuthenticated = true // Mock authentication check

  if (!isAuthenticated) {
    redirect("/")
  }

  // In a real application, this would parse the PDF and extract form data
  const formData = getPdfFormData()

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Plano de Gestão Anual - PGA 2025</h1>
            <FormRenderer formData={formData} />
          </div>
        </main>
      </div>
    </div>
  )
}

