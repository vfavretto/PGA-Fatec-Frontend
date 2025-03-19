"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollText, FileText, Settings, ChevronLeft, ChevronRight } from "lucide-react"

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`bg-black text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } h-screen flex flex-col`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!collapsed && <h2 className="text-lg font-bold">PGA 2025</h2>}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-800"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          <li>
            <Link href="/dashboard" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-white hover:bg-gray-800 ${collapsed ? "px-2" : "px-4"}`}
              >
                <ScrollText className="h-5 w-5 mr-2" />
                {!collapsed && <span>Visão Geral</span>}
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/projects" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-white hover:bg-gray-800 ${collapsed ? "px-2" : "px-4"}`}
              >
                <FileText className="h-5 w-5 mr-2" />
                {!collapsed && <span>Projetos</span>}
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/settings" passHref>
              <Button
                variant="ghost"
                className={`w-full justify-start text-white hover:bg-gray-800 ${collapsed ? "px-2" : "px-4"}`}
              >
                <Settings className="h-5 w-5 mr-2" />
                {!collapsed && <span>Configurações</span>}
              </Button>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

