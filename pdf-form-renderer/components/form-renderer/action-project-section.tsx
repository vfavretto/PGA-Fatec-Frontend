import type { ActionProject } from "@/lib/pdf-parser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CalendarIcon, User2Icon, DollarSignIcon, ListChecksIcon } from "lucide-react"

interface ActionProjectSectionProps {
  project: ActionProject
}

export default function ActionProjectSection({ project }: ActionProjectSectionProps) {
  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <CardTitle className="text-lg">
            {project.id} - {project.theme}
          </CardTitle>
          <Badge variant="outline" className="bg-black text-white border-black self-start md:self-auto">
            {project.origin}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">O que será feito:</h4>
              <p className="text-gray-700">{project.whatWillBeDone}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Por que será feito:</h4>
              <p className="text-gray-700">{project.whyWillBeDone}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <User2Icon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Responsável</p>
                <p className="font-medium">{project.responsible}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Período de execução</p>
                <p className="font-medium">
                  {project.executionPeriod.startDate} a {project.executionPeriod.endDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Custo estimado</p>
                <p className="font-medium">{project.cost}</p>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="steps">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <ListChecksIcon className="h-4 w-4" />
                  Etapas do processo
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {project.processSteps.map((step, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 py-2 border-b border-gray-100 last:border-0"
                    >
                      <p className="text-sm">{step.step}</p>
                      <p className="text-sm text-gray-500">
                        {step.startDate} - {step.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="problems">
              <AccordionTrigger className="text-sm font-medium">
                Situações-problema a serem resolvidas/mitigadas
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {project.problemSituation.map((problem, index) => (
                    <div key={index} className="flex items-center gap-2 py-1">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {problem.split(" ")[0]}
                      </Badge>
                      <p className="text-sm">{problem.split("- ")[1]}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  )
}

