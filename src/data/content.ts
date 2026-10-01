/**
 * Textos da home. Todo o conteúdo editorial fica aqui para facilitar ajustes
 * sem mexer nos componentes.
 */

export const hero = {
  eyebrow: "Automação de processos e dashboards para PMEs",
  title: "Menos trabalho manual.",
  titleAccent: "Mais controle da operação.",
  subtitle:
    "Automatizo as rotinas repetitivas da sua equipe e organizo os dados que hoje estão espalhados em planilhas e sistemas. O resultado: relatórios que ficam prontos sozinhos e indicadores que o gestor consulta sem precisar perguntar para ninguém.",
  primaryCta: "Quero entender o que posso automatizar",
  secondaryCta: "Ver projetos",
  proof: ["Diagnóstico antes de qualquer código", "Usa os sistemas que você já tem", "Começa com um projeto pequeno"],
};

export const audience = [
  "Administradoras de condomínios",
  "Imobiliárias",
  "Escritórios administrativos",
  "Distribuidoras",
  "Empresas de serviços",
  "PMEs que vivem no Excel",
];

export const problemsIntro = {
  eyebrow: "Problemas que resolvo",
  title: "Se alguma dessas frases descreve sua empresa, tem trabalho que pode ser automatizado.",
  lead:
    "Se alguém da sua equipe precisa baixar arquivos, copiar informações, atualizar planilhas e montar o mesmo relatório toda semana, provavelmente existe algo que pode ser automatizado.",
};

export type Problem = { id: string; quote: string; cost: string; icon: string };

export const problems: Problem[] = [
  {
    id: "juntar-planilhas",
    quote: "Todo mês alguém precisa juntar várias planilhas.",
    cost: "Horas de copiar e colar, com risco de linha duplicada ou esquecida.",
    icon: "layers",
  },
  {
    id: "pessoa-especifica",
    quote: "Os relatórios dependem de uma pessoa específica.",
    cost: "Se ela sai de férias, o relatório não sai. Se sai da empresa, o conhecimento vai junto.",
    icon: "user",
  },
  {
    id: "copiar-sistemas",
    quote: "Informações precisam ser copiadas de um sistema para outro.",
    cost: "Retrabalho diário e erros de digitação que só aparecem depois.",
    icon: "copy",
  },
  {
    id: "perguntar-equipe",
    quote: "O gestor precisa perguntar para a equipe como está a operação.",
    cost: "Decisão atrasada e interrupção constante de quem está executando.",
    icon: "message",
  },
  {
    id: "relatorio-horas",
    quote: "Relatórios levam horas para ficar prontos.",
    cost: "Quando o número chega, já está desatualizado.",
    icon: "clock",
  },
  {
    id: "versoes-excel",
    quote: "Existem várias versões do mesmo Excel.",
    cost: "Cada área tem um número diferente e a reunião vira discussão sobre qual está certo.",
    icon: "files",
  },
  {
    id: "indicadores-espalhados",
    quote: "Os indicadores ficam espalhados.",
    cost: "Financeiro num lugar, operação em outro, e ninguém enxerga o todo.",
    icon: "scatter",
  },
  {
    id: "tarefas-repetitivas",
    quote: "Processos repetitivos consomem horas da equipe.",
    cost: "Gente qualificada fazendo trabalho que uma rotina automática faria sem errar.",
    icon: "repeat",
  },
];

export type Service = {
  id: string;
  title: string;
  summary: string;
  inPractice: string;
  examples: string[];
  deliverable: string;
  cta: string;
};

export const services: Service[] = [
  {
    id: "automacao",
    title: "Automação de processos",
    summary: "Tiro da mão da equipe as tarefas que se repetem todo dia, toda semana ou todo mês.",
    inPractice:
      "Uma rotina roda sozinha no horário definido: busca os arquivos, trata os dados, consolida e entrega o resultado pronto — em planilha, relatório ou mensagem.",
    examples: [
      "Processamento automático de arquivos e extratos",
      "Consolidação de planilhas de várias áreas ou unidades",
      "Geração e envio de relatórios recorrentes",
      "Alertas quando um número sai do esperado",
      "Integração entre sistemas que não conversam",
      "Tarefas administrativas repetitivas",
    ],
    deliverable: "Rotina automatizada, documentada e monitorada.",
    cta: "Tenho um processo que quero automatizar",
  },
  {
    id: "dashboards",
    title: "Dashboards gerenciais",
    summary: "Um lugar só para acompanhar a operação, com os números que importam para decidir.",
    inPractice:
      "Indicadores atualizados automaticamente, com filtros por período, unidade, equipe ou cliente — e destaque para o que está fora do normal.",
    examples: [
      "Indicadores operacionais e de produtividade",
      "Financeiro: receita, despesa, orçado x realizado",
      "Inadimplência e contas a receber",
      "Metas, SLA e prazos",
      "Vendas por vendedor, cliente e região",
      "Visão executiva para a diretoria",
    ],
    deliverable: "Dashboard publicado, com acesso controlado por perfil.",
    cta: "Quero organizar meus indicadores",
  },
  {
    id: "dados",
    title: "Dados e integração",
    summary: "Organizo as fontes para que todo relatório parta da mesma base confiável.",
    inPractice:
      "Mapeio de onde vem cada informação, padronizo, corrijo inconsistências e crio uma base central que alimenta relatórios e dashboards.",
    examples: [
      "Levantamento e organização das fontes de dados",
      "Tratamento e padronização (datas, nomes, códigos)",
      "Integração entre ERP, planilhas e outros sistemas",
      "Modelagem pensada para análise",
      "Base centralizada e histórica",
    ],
    deliverable: "Base única, atualizada automaticamente e documentada.",
    cta: "Quero centralizar meus dados",
  },
];

export const benefits = [
  {
    title: "Relatório pronto antes do expediente",
    text: "A rotina roda de madrugada. Quando a equipe chega, os números já estão atualizados.",
  },
  {
    title: "O processo deixa de depender de uma pessoa",
    text: "A lógica fica documentada e automatizada, não na cabeça de quem montava a planilha.",
  },
  {
    title: "Um número oficial para cada indicador",
    text: "Todas as áreas consultam a mesma base. Acaba a discussão sobre qual planilha está certa.",
  },
  {
    title: "Problemas aparecem antes de virar urgência",
    text: "Alertas avisam quando um prazo, um cliente ou um fornecedor sai do padrão.",
  },
  {
    title: "Menos erro de digitação e cópia",
    text: "Dados que passam de sistema para sistema sem intervenção manual não são digitados errado.",
  },
  {
    title: "A equipe volta para o trabalho que importa",
    text: "As horas gastas copiando e colando passam a ser usadas em análise, atendimento e venda.",
  },
];

export const processSteps = [
  {
    title: "Diagnóstico",
    text: "Conversa para entender a operação, onde está o esforço manual e o que o gestor precisa enxergar.",
  },
  {
    title: "Mapeamento do processo",
    text: "Desenho como o processo funciona hoje, passo a passo, com tempo gasto e pontos de erro.",
  },
  {
    title: "Levantamento das fontes",
    text: "Identifico sistemas, planilhas e arquivos envolvidos, e como acessar cada um.",
  },
  {
    title: "Protótipo",
    text: "Mostro uma primeira versão com dados reais para validar se é isso que você precisa.",
  },
  {
    title: "Desenvolvimento",
    text: "Construo a automação e o dashboard com base no que foi validado.",
  },
  {
    title: "Validação",
    text: "Comparamos os resultados com o processo atual até os números baterem.",
  },
  {
    title: "Implantação",
    text: "Coloco em produção, com agendamento, monitoramento e acesso para quem precisa.",
  },
  {
    title: "Treinamento",
    text: "Sua equipe aprende a usar, interpretar os indicadores e saber o que fazer se algo mudar.",
  },
  {
    title: "Sustentação",
    text: "Opcional: acompanhamento mensal para ajustes, novas fontes e evolução dos indicadores.",
    optional: true,
  },
];

export const engagement = [
  {
    title: "Conversa inicial",
    tag: "Sem custo · 30 min",
    text: "Você me conta como o processo funciona hoje. Eu digo, com franqueza, se faz sentido automatizar e por onde começar.",
  },
  {
    title: "Projeto piloto",
    tag: "Escopo fechado",
    text: "Um processo ou um dashboard, com entrega em poucas semanas. Ideal para validar o ganho antes de ampliar.",
  },
  {
    title: "Projeto completo",
    tag: "Por etapas",
    text: "Automação, base de dados e dashboards de uma área inteira, entregues em fases com validação a cada etapa.",
  },
  {
    title: "Sustentação mensal",
    tag: "Opcional",
    text: "Monitoramento das rotinas, ajustes quando um sistema muda e evolução contínua dos indicadores.",
  },
];

export const stack = [
  { name: "Python", note: "automações e tratamento de dados" },
  { name: "Pandas", note: "consolidação e limpeza" },
  { name: "SQL", note: "bases e consultas" },
  { name: "Power BI", note: "dashboards corporativos" },
  { name: "Power Query", note: "tratamento no ecossistema Microsoft" },
  { name: "Excel", note: "quando é a ferramenta certa" },
  { name: "APIs", note: "integração com sistemas" },
  { name: "Bancos de dados", note: "PostgreSQL, SQL Server" },
  { name: "Microsoft 365", note: "SharePoint, Teams, Outlook" },
  { name: "Cloud", note: "quando faz sentido" },
];

export const about = {
  eyebrow: "Sobre",
  title: "Olho para o processo antes de olhar para a ferramenta.",
  paragraphs: [
    "Sou Heitor. Trabalho com dados, automação e BI resolvendo problemas operacionais: a planilha que ninguém quer atualizar, o relatório que leva uma tarde inteira, o indicador que cada área calcula de um jeito.",
    "Minha experiência profissional passa por análise de dados, construção de dashboards, automação de rotinas, processos operacionais e definição de indicadores — com Python, Power BI, estatística e desenvolvimento como ferramentas do dia a dia.",
    "Gosto de entender como a operação realmente funciona, falar a língua de quem está no processo e entregar algo que a equipe usa de verdade. Tecnologia é o meio; o objetivo é sua empresa trabalhar com menos esforço manual e mais clareza.",
  ],
  highlights: [
    { label: "Análise de dados e estatística", detail: "Números que sustentam decisão, não só gráficos bonitos." },
    { label: "Automação e desenvolvimento", detail: "Rotinas confiáveis, com tratamento de erro e registro." },
    { label: "Processos e indicadores", detail: "Definição do que medir e de como cada número é calculado." },
  ],
};

export const faq = [
  {
    q: "Você trabalha apenas com Power BI?",
    a: "Não. Power BI é uma das ferramentas que uso, mas a escolha depende do que sua empresa já tem e do problema. Às vezes a melhor solução é uma automação em Python que entrega uma planilha pronta; às vezes é um dashboard; às vezes são os dois.",
  },
  {
    q: "Minha empresa precisa ter banco de dados?",
    a: "Não. Muitos projetos começam com planilhas e exportações de sistemas. Se fizer sentido criar uma base centralizada, eu estruturo isso como parte do projeto, no tamanho adequado à sua operação.",
  },
  {
    q: "É possível automatizar processos que utilizam Excel?",
    a: "Sim, e é um dos casos mais comuns. Consolidar planilhas, aplicar regras, cruzar informações e gerar relatórios a partir de arquivos Excel são tarefas que podem rodar sozinhas.",
  },
  {
    q: "Você consegue integrar sistemas?",
    a: "Na maioria dos casos, sim: via API, exportações agendadas, banco de dados ou leitura de arquivos. No diagnóstico eu verifico o que cada sistema permite e proponho o caminho mais estável.",
  },
  {
    q: "Quanto custa um projeto?",
    a: "Depende do escopo: quantidade de fontes de dados, complexidade das regras, número de indicadores e se haverá sustentação. Depois da conversa inicial eu envio uma proposta com escopo, prazo e valor fechados — sem surpresa no meio do caminho.",
  },
  {
    q: "Quanto tempo leva?",
    a: "Um projeto piloto (uma automação ou um dashboard) costuma levar de 2 a 4 semanas. Projetos maiores são divididos em etapas, com entregas utilizáveis ao fim de cada uma.",
  },
  {
    q: "É necessário alterar os sistemas que minha empresa já utiliza?",
    a: "Normalmente, não. A ideia é trabalhar em cima do que já existe: ERP, sistema administrativo, planilhas. A automação lê os dados de onde eles estão, sem exigir troca de sistema.",
  },
  {
    q: "É possível começar com um projeto pequeno?",
    a: "Sim, e é o que recomendo. Começar por um processo bem delimitado mostra o ganho rapidamente e ajuda a decidir, com segurança, o que vale automatizar depois.",
  },
  {
    q: "Como ficam a segurança e o acesso aos dados?",
    a: "Trabalho com acessos mínimos necessários, preferencialmente no ambiente da sua empresa. Os dashboards têm controle de acesso por perfil, e os dados não são usados para nenhuma outra finalidade.",
  },
];

export const finalCta = {
  title: "Qual processo da sua empresa consome mais horas hoje?",
  text: "Me conte como ele funciona. Em uma conversa de 30 minutos eu consigo dizer se dá para automatizar, o que você ganharia e por onde começar.",
  primary: "Vamos conversar sobre sua operação",
};
