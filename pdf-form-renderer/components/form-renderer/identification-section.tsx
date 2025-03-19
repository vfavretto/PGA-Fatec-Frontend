import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IdentificationSectionProps {
  unitCode: string
  unitName: string
  director: string
}

export default function IdentificationSection({ unitCode, unitName, director }: IdentificationSectionProps) {
  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <CardTitle>IDENTIFICAÇÃO DA UNIDADE</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Unidade código</p>
            <p className="text-lg">{unitCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Unidade</p>
            <p className="text-lg">{unitName}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Diretor(a)</p>
            <p className="text-lg">{director}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

