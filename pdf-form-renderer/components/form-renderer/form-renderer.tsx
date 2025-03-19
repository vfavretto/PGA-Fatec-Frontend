import type { FormData } from "@/lib/pdf-parser"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ActionProjectSection from "./action-project-section"
import IdentificationSection from "./identification-section"
import ProblemSituationsSection from "./problem-situations-section"

interface FormRendererProps {
  formData: FormData
}

export default function FormRenderer({ formData }: FormRendererProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">{formData.title}</h2>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <IdentificationSection
            unitCode={formData.unitCode}
            unitName="Fatec Votorantim"
            director={formData.director}
          />

          <ProblemSituationsSection
            problems={formData.sections.find((s) => s.id === "problem-situations")?.content || []}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6">
            {formData.actionProjects.map((project) => (
              <ActionProjectSection key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Lista de Equipamentos Necessários</h3>
            <p className="text-gray-500 italic">
              Esta seção exibiria a lista de equipamentos do Anexo 1 do documento. Para implementação completa, seria
              necessário extrair esses dados do PDF.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

