// This is a mock implementation of a PDF parser
// In a real application, this would use a library like pdf.js to extract data from PDFs

export interface FormSection {
  id: string
  title: string
  type: "text" | "table" | "list" | "action-project"
  content: any
}

export interface ActionProject {
  id: string
  theme: string
  origin: string
  whatWillBeDone: string
  whyWillBeDone: string
  responsible: string
  collaborators: string[]
  executionPeriod: {
    startDate: string
    endDate: string
  }
  processSteps: {
    step: string
    startDate: string
    endDate: string
  }[]
  cost: string
  resourceSources: string
  problemSituation: string[]
}

export interface FormData {
  title: string
  unitCode: string
  director: string
  sections: FormSection[]
  actionProjects: ActionProject[]
}

export function getPdfFormData(): FormData {
  // This would normally parse a PDF file
  // For this example, we'll return mock data based on the PDF content

  return {
    title: "PLANO DE GESTÃO ANUAL - PGA 2025",
    unitCode: "F301",
    director: "Prof. Dr. Mauro Tomazela",
    sections: [
      {
        id: "identification",
        title: "IDENTIFICAÇÃO DA UNIDADE",
        type: "text",
        content: {
          unitCode: "F301",
          unitName: "Fatec Votorantim",
          director: "Prof. Dr. Mauro Tomazela",
        },
      },
      {
        id: "scenario-analysis",
        title: "ANÁLISE DO CENÁRIO",
        type: "text",
        content: {
          description:
            "Votorantim, um município da região metropolitana de Sorocaba, no interior de São Paulo, inaugurou em 2022 a Fatec Votorantim, que ofereceu à comunidade 80 vagas semestrais, distribuídas entre os seguintes cursos: Controle de Obras: 40 vagas (noturno), Desenvolvimento de Software Multiplataforma: 40 vagas (noturno). A partir do segundo semestre de 2023, ambos os cursos reduziram sua oferta para 35 vagas cada. Essa mudança foi necessária devido às limitações de capacidade física das salas de aula e laboratórios.",
        },
      },
      {
        id: "problem-situations",
        title: "APONTAMENTO DE SITUAÇÕES-PROBLEMA MAIS RELEVANTES",
        type: "list",
        content: [
          { id: "0.1.01", description: "Metodologia de ensino, desempenho de alunos, evasão" },
          { id: "0.1.02", description: "Manutenção e conservação predial" },
          { id: "0.1.04", description: "Infraestrutura laboratorial e ambientes de ensino" },
          { id: "0.1.05", description: "Materiais, equipamentos e mobiliários" },
          { id: "0.1.07", description: "Comunicação com a comunidade acadêmica" },
          { id: "0.1.08", description: "Participação da comunidade e sociedade" },
          { id: "0.1.11", description: "Segurança pessoal e patrimonial" },
          { id: "0.1.99", description: "Internet deficitária" },
        ],
      },
    ],
    actionProjects: [
      {
        id: "101",
        theme: "Biblioteca Ativa e aquisição de bibliografias",
        origin: "3-Gestão Tática - CPA (RADE, RCEE, RLAB, RWebSAI, RAAI)",
        whatWillBeDone:
          "Planejamento/ organização/ instalação de infraestrutura e mobiliários / organização de acesso lógico ao acervo/ compra e catalogação.",
        whyWillBeDone: "Para incentivar o uso da biblioteca da unidade e atendimento de demandas legais",
        responsible: "Júlia Cristina Gütschow Sampaio",
        collaborators: [],
        executionPeriod: {
          startDate: "17/02/2025",
          endDate: "19/12/2025",
        },
        processSteps: [
          { step: "Planejamento e levantamento das ações a serem desenvolvidas", startDate: "17/02", endDate: "19/12" },
          {
            step: "Definição da lista dos livros de acordo com o PPC dos cursos",
            startDate: "24/02",
            endDate: "14/03",
          },
          { step: "Envio da lista de livros para compra na CESU", startDate: "17/03", endDate: "28/03" },
          { step: "Aquisição da bibliografia básica e complementar", startDate: "17/02", endDate: "19/12" },
          { step: "Promover ações para incentivo ao uso da biblioteca", startDate: "17/02", endDate: "19/12" },
          { step: "Digitação do acervo da biblioteca recebido", startDate: "17/02", endDate: "19/12" },
        ],
        cost: "A ser definido",
        resourceSources: "Centro Paula Souza (Licitação)",
        problemSituation: [
          "cat 0.1.01 - Metodologia de ensino, desempenho de alunos, evasão",
          "cat 0.1.03 - Infraestrutura predial (espaços, sistemas)",
        ],
      },
      {
        id: "102",
        theme:
          "Ações pedagógicas: visitas técnicas, projetos integradores/interdisciplinares, dias de campo, feira das profissões, cursos extracurriculares para alunos.",
        origin: "3-Gestão Tática - CPA (RADE, RCEE, RLAB, RWebSAI, RAAI)",
        whatWillBeDone: "Participação em visitas técnicas a empresas locais e presença em feiras de profissões.",
        whyWillBeDone:
          "Os estudantes terão a oportunidade de adquirir conhecimentos práticos aplicados, enquanto também contribuem para a divulgação da FATEC Votorantim e de seus cursos. Isso não apenas permite que os alunos se familiarizem com o mercado, mas também facilita sua visibilidade junto às empresas locais.",
        responsible: "Dilermano Piva Júnior",
        collaborators: ["Neusa Maria de Camargo", "Nelson Moro da Costa"],
        executionPeriod: {
          startDate: "03/02/2025",
          endDate: "19/12/2025",
        },
        processSteps: [
          {
            step: "Consultar os professores sobre a viabilidade de visitas técnicas",
            startDate: "03/02",
            endDate: "19/12",
          },
          {
            step: "Fazer o contato e levantamento de empresas regionais para visita",
            startDate: "03/02",
            endDate: "19/12",
          },
          { step: "Confirmar os professores encarregados das visitas técnicas", startDate: "03/02", endDate: "19/12" },
          { step: "Realizar agendamento com as empresas", startDate: "03/02", endDate: "19/12" },
          {
            step: "Verificar datas de feiras de profissões presenciais e on-line",
            startDate: "03/02",
            endDate: "19/12",
          },
          { step: "Realizar visitas técnicas", startDate: "03/02", endDate: "19/12" },
          { step: "Participar de feiras de profissões presenciais e online", startDate: "03/02", endDate: "19/12" },
        ],
        cost: "Não haverá custos",
        resourceSources: "Não haverá custos",
        problemSituation: [
          "cat 0.1.01 - Metodologia de ensino, desempenho de alunos, evasão",
          "cat 0.1.08 - Participação da comunidade e sociedade",
        ],
      },
    ],
  }
}

