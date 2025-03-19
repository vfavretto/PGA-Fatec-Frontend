import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Problem {
  id: string
  description: string
}

interface ProblemSituationsSectionProps {
  problems: Problem[]
}

export default function ProblemSituationsSection({ problems }: ProblemSituationsSectionProps) {
  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <CardTitle>APONTAMENTO DE SITUAÇÕES-PROBLEMA MAIS RELEVANTES</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((problem) => (
            <div key={problem.id} className="flex items-start gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {problem.id.split(".").pop()}
              </Badge>
              <span>{problem.description}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

