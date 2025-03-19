import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export default function Home() {
  // If user is already authenticated, redirect to dashboard
  const isAuthenticated = false // This would be a server-side check in a real app

  if (isAuthenticated) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black">FATEC Votorantim</h1>
          <p className="text-gray-600 mt-2">Plano de Gestão Anual - PGA 2025</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

