<br id="topo">
<div align="center">
  
![banner](https://github.com/julinhaarte/PGA-Mobile/blob/main/assets/images/PGA.png)

</div>

<div align="center">

[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](https://github.com/vfavretto/PGA-Fatec-Frontend/releases) 
[![Language](https://img.shields.io/badge/Language-TypeScript%20%7C%20React-yellow.svg)](https://www.typescriptlang.org/) 
[![Linting](https://img.shields.io/badge/Linting-eslint%20%7C%20prettier-green.svg)](https://eslint.org/) 
[![Build Tool](https://img.shields.io/badge/Build%20Tool-Vite-blueviolet)](https://vitejs.dev/) 
[![Framework](https://img.shields.io/badge/Framework-React-teal)](https://react.dev/) 
[![CSS Framework](https://img.shields.io/badge/CSS%20Framework-Tailwind%20CSS-indigo)](https://tailwindcss.com/) 

</div>

<p align="center">
    <a href="#sobre">Sobre</a>  |  
    <a href="#mer">MER & Requisitos</a>  |  
    <a href="#tecnologias">Tecnologias</a>  |  
    <a href="#equipe">Equipe</a>
</p>

<span id="sobre">
  
## :page_facing_up: Sobre o Projeto
  Projeto de plataforma digital que centraliza e facilita o Planejamento de Gestão Anual (PGA) das Faculdades de Tecnologia (Fatecs), promovendo uma gestão mais eficiente, organizada e colaborativa. A plataforma permite que as equipes gestoras registrem, monitorem e avaliem ações e projetos estratégicos, alinhando-os às prioridades institucionais do Centro Paula Souza e às demandas locais da unidade. A inclusão de diferentes atores, como coordenadores, docentes e parceiros, amplia o alcance do projeto, transformando-o em um hub abrangente para a integração de esforços em prol da excelência acadêmica, inovação e responsabilidade social. O PGA Digital não apenas simplifica processos, mas aspira a ser um catalisador para transformações positivas no ecossistema educacional, unindo diversos agentes para enfrentar os desafios contemporâneos de maneira colaborativa e inovadora.

### :link: Documentação disponível para visualização em [Plano de Gestão Anual Fatec](https://docs.google.com/document/d/1CrhBWIOPThfBXkwcjoDVkheMd6tgXGGg/edit?usp=sharing&ouid=114413335327908348110&rtpof=true&sd=true).

→ [Voltar ao topo](#topo)

<span id="mer">
  
## :bookmark_tabs: MER e Requisitos

<details>
   <summary>Clique aqui para visualizar o MER</summary>
    <br>
    <div align="center">
    <img src="https://i.imgur.com/aW09a8m.png" alt="MER">
    </div>
</details>

<details>
   <summary>Clique aqui para visualizar os Requisitos Funcionais</summary>

## 🎯 Requisitos Funcionais
 
### RF001 - Gerenciamento de Usuários:
O sistema permite o ciclo de vida completo dos perfis, incluindo cadastro, atualização e exclusão, além de autenticação segura via JWT. 

 
### RF002 - Gerenciamento de Unidades:
Cadastro das unidades Fatec utilizando o código único, registro de diretores e vinculação de cursos.  
 
### RF003 - Gerenciamento de PGA:
Controle do ciclo de vida do Plano de Gestão Anual, incluindo controle de versões, análise de cenário e status de acompanhamento.
 
### RF004 - Gerenciamento de Situações Problema:
Registro detalhado de problemas institucionais que justificam a criação de ações dentro do PGA.  
 
### RF005 - Gerenciamento de Eixos Temáticos:
Organização hierárquica do plano em eixos numerados e temas específicos para estruturar o planejamento.  
 
### RF006 - Gerenciamento de Prioridades:
Classificação de urgência e tipo de gestão para cada ação ou projeto cadastrado.  
 
### RF007 - Gerenciamento de Ações e Projetos:
Planejamento detalhado com sistema de anexos para documentação comprobatória.  
 
### RF008 - Gerenciamento de Equipes de Projeto:
Vinculação de pessoas aos projetos, definição de papéis e controle de carga horária (HAE).  
 
### RF009 - Gerenciamento de Etapas e Entregas:
Controle de entregáveis com links para documentos no SEI e status de verificação (Pendente, Em Andamento, Concluído).  
 
### RF010 - Gerenciamento de Aquisições:
Registro de materiais permanentes ou de consumo necessários, com justificativas e estimativas de valores.  
 
### RF011 - Gerenciamento de Ações CPA:
Espaço específico para as demandas da Comissão Própria de Avaliação vinculadas ao PGA.  
 
### RF012 - Sistema de Autenticação e Autorização: 
Controle rigoroso de acesso onde cada rota é protegida por roles (papéis), garantindo que apenas usuários autorizados realizem operações críticas.

</details>

<details>
   <summary>Clique aqui para visualizar os Requisitos Não Funcionais</summary>
  
## 🔧 Requisitos Não Funcionais
 
### RNF001 - Segurança: 
Implementação de JWT para sessões, criptografia bcrypt para senhas, uso de Helmet para proteção de headers HTTP e validação rigorosa de dados na entrada.  
 
### RNF002 - Confiabilidade:
Meta de disponibilidade de 99%, com rotinas de backup automático do PostgreSQL e logs detalhados para fins de auditoria.  
 
### RNF003 - Usabilidade:
API seguindo os padrões RESTful, garantindo que os endpoints sejam intuitivos, documentados e versionados para futuras integrações.
 
### RNF004 - Portabilidade:
Aplicação totalmente containerizada com Docker e Docker Compose, facilitando o deploy em diferentes ambientes (Dev, Teste, Produção).  
 
### RNF005 - Manutenção:
Arquitetura modular baseada em NestJS, utilizando padrões de projeto como Repository e Service, além de tipagem estática para evitar erros em tempo de execução.  
 
### RNF006 - Desenvolvimento:
Uso de ferramentas modernas como Prisma ORM para abstração do banco de dados e Swagger/OpenAPI para documentação automática da API.  
 
### RNF007 - Qualidade de Código:
Padronização de pipelines de CI/CD para integração contínua. 
</details>

→ [Voltar ao topo](#topo)

<span id="prototipos">

## 💻 Protótipo de Alta Fidelidade

![Protótipo alta fidelidade](https://i.imgur.com/vqTm6Yx.png)

#### Encontre o protótipo no [Figma](https://www.figma.com/design/fGjaMNQejB1JcliVylMCJf/PGA?node-id=7-5&t=uPFd3fqHqdSqladm-0)

→ [Voltar ao topo](#topo)

<span id="tecnologias">

## :open_file_folder: Tecnologias

|    Front-End     |     Back-End     | 
| :-----------: | :------------------------------------: | 
|![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)|![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)|
|![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)|![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)|
|![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)|![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)|
|  | ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)| 
|  | ![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white) | 
|  |![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) | 


→ [Voltar ao topo](#topo)

<span id="equipe">

## :busts_in_silhouette: Equipe

|    Função     | Nome                                  |                                                                                                                                                      LinkedIn & GitHub                                                                                                                                                      |
| :-----------: | :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Scrum Master | Victor Favretto           |     [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](-) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://www.github.com/vfavretto)              |
| Product Owner  | Júlia Soares |      [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/julia-soares/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://www.github.com/julinhaarte)     |
|   Dev Team    | Ana Laura Lazdenas               |         [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/ana-lazdenas/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/alazde) |
|   Dev Team    | Felipe Rodrigues                  |         [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](x) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/felipe6san)        |
|   Dev Team    | Murilo Rodrigues                |   [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](x) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/Zan-Kir)   |

→ [Voltar ao topo](#topo)
