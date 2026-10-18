import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  alternates: { canonical: "/politica-de-privacidade" },
  title: "Política de Privacidade e Cookies — Almara",
  description: "Como a Almara trata dados pessoais no site e no aplicativo Almara+, quais são seus direitos e como exercê-los.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "Escopo desta política",
    blocks: [
      { t: "p", text: "Esta Política aplica-se ao **site, à loja virtual e ao aplicativo Almara+**." },
      { t: "p", text: "O aplicativo possui Termos de Uso próprios, disponíveis dentro dele. O tratamento de dados pessoais em ambos os ambientes segue esta Política, com as informações específicas do aplicativo descritas nas seções 3-A e 3-B." },
    ],
  },
  {
    title: "Quem somos",
    blocks: [
      { t: "p", text: "Para fins desta Política, a **controladora** dos dados pessoais relacionados ao site e ao e-commerce é:" },
      { t: "kv", k: "Razão social", v: "ALMARA PRODUTOS NATURAIS LTDA" },
      { t: "kv", k: "Nome fantasia", v: "Almara" },
      { t: "kv", k: "CNPJ", v: "69.611.850/0001-22" },
      { t: "kv", k: "Endereço", v: "Rua Heraclito Graça, 124, apto 33, Casa Verde Média — São Paulo/SP — CEP 02530-030" },
      { t: "kv", k: "E-mail para assuntos de privacidade", v: "kezia.borges@almara.com.br" },
      { t: "h3", text: "Encarregado pelo Tratamento de Dados Pessoais (DPO)" },
      { t: "p", text: "Nos termos do **artigo 41 da LGPD**, a Almara indica como Encarregado(a):" },
      { t: "kv", k: "Nome", v: "Kezia Borges de Oliveira" },
      { t: "kv", k: "E-mail", v: "kezia.borges@almara.com.br" },
      { t: "p", text: "O Encarregado é o canal de comunicação entre a Almara, os titulares de dados e a Autoridade Nacional de Proteção de Dados (ANPD)." },
    ],
  },
  {
    title: "Quais dados podemos coletar",
    blocks: [
      { t: "p", text: "Os dados coletados dependem da forma como você utiliza nosso site." },
      { t: "h3", text: "3.1. Dados de cadastro e conta" },
      { t: "p", text: "Nome, e-mail, senha (armazenada de forma criptografada), preferências de comunicação e, quando aplicável, telefone e data de nascimento." },
      { t: "h3", text: "3.2. Dados fornecidos por você" },
      { t: "p", text: "Ao realizar uma compra, preencher um formulário ou entrar em contato conosco, poderemos coletar:" },
      { t: "li", text: "nome completo" },
      { t: "li", text: "CPF, quando necessário para emissão de documentos fiscais ou cumprimento de obrigações legais" },
      { t: "li", text: "endereço de entrega e cobrança e CEP" },
      { t: "li", text: "e-mail e telefone" },
      { t: "li", text: "informações relacionadas ao pedido" },
      { t: "li", text: "informações fornecidas voluntariamente durante o atendimento; e" },
      { t: "li", text: "preferências relacionadas às comunicações da Almara." },
      { t: "h3", text: "3.3. Dados relacionados às compras" },
      { t: "p", text: "Produtos adquiridos, quantidade, valor, data e horário do pedido, status e forma de pagamento, status e informações de entrega, histórico de pedidos e solicitações de troca, devolução ou atendimento." },
      { t: "h3", text: "3.4. Dados de pagamento" },
      { t: "p", text: "Os pagamentos são processados por empresas especializadas integradas ao nosso site." },
      { t: "p", text: "A Almara recebe apenas as informações relacionadas ao status e à identificação da transação necessárias para processar e administrar o pedido." },
      { t: "p", text: "**Dados completos do meio de pagamento — como o número integral do cartão e o código de segurança — não são coletados nem armazenados pela Almara**, sendo tratados diretamente pelo provedor de pagamentos, de acordo com suas próprias políticas." },
      { t: "h3", text: "3.5. Respostas a quizzes e preferências de bem-estar" },
      { t: "p", text: "Alguns recursos do site, como o quiz de recomendação de chás, sem vínculo entre um chá específico e uma jornada do aplicativo, coletam respostas fornecidas voluntariamente pelo usuário sobre preferências, hábitos e momentos de consumo." },
      { t: "p", text: "Essas informações são utilizadas para **sugerir produtos e conteúdos**, não constituem avaliação de saúde e não geram diagnóstico de qualquer natureza, conforme a seção 7 dos Termos de Uso." },
      { t: "p", text: "O tratamento dessas respostas está detalhado na seção 4 desta Política." },
      { t: "h3", text: "3.6. Dados coletados automaticamente" },
      { t: "p", text: "Durante a navegação, poderão ser coletadas automaticamente informações técnicas como endereço IP, tipo de dispositivo, sistema operacional, navegador, páginas acessadas, data e horário de acesso, tempo de permanência, origem do acesso, interações realizadas no site e identificadores relacionados a cookies e tecnologias semelhantes." },
      { t: "p", text: "Essas informações são utilizadas para segurança, funcionamento do site, análise de desempenho, melhoria da experiência e, quando autorizado, atividades de publicidade e marketing." },
    ],
  },
  {
    title: "Dados tratados no aplicativo Almara+",
    blocks: [
      { t: "h3", text: "3-A.1. Conta" },
      { t: "p", text: "Nome, e-mail, senha (armazenada de forma criptografada) e, quando o usuário optar por comprar produtos pelo aplicativo, endereço de entrega." },
      { t: "h3", text: "3-A.2. Uso das funcionalidades" },
      { t: "p", text: "Jornada escolhida, dia atual, lições concluídas, hábitos cadastrados, tarefas, progresso do jardim e registro de uso das ferramentas." },
      { t: "h3", text: "3-A.3. Diário e check-in de humor" },
      { t: "p", text: "O aplicativo permite registrar humor e escrever textos livres no diário e nos check-ins." },
      { t: "p", text: "Esse conteúdo é escrito pelo usuário, para o usuário. Ele fica armazenado na conta, é acessível apenas por ela, **não é lido por pessoas da Almara, não é utilizado para publicidade e não é compartilhado com terceiros**." },
      { t: "p", text: "O usuário pode excluir entradas individualmente, e a exclusão da conta remove todo esse conteúdo." },
      { t: "h3", text: "3-A.4. Conversas com a Mara" },
      { t: "p", text: "A Mara é um assistente virtual. Para gerar as respostas, o aplicativo utiliza um serviço de inteligência artificial fornecido por terceiro, com servidores localizados fora do Brasil." },
      { t: "kv", k: "O que é enviado a esse fornecedor", v: "o texto da mensagem enviada pelo usuário, até dez mensagens anteriores da mesma conversa, o nome da jornada em andamento e o tema da lição do dia." },
      { t: "kv", k: "O que não é enviado", v: "nome, e-mail, endereço, identificador de usuário, conteúdo do diário, check-ins de humor e histórico de pedidos. As requisições são transmitidas **sem qualquer identificador que permita vincular a conversa a uma pessoa**." },
      { t: "kv", k: "Verificação antes do envio", v: "antes de a mensagem ser enviada ao fornecedor de inteligência artificial, o aplicativo verifica automaticamente se ela contém indicações de sofrimento grave ou risco. Essa verificação é feita por comparação com uma lista de expressões, dentro da própria infraestrutura da Almara e sem intervenção humana." },
      { t: "p", text: "Quando a verificação identifica esse tipo de conteúdo, a mensagem **não é enviada ao fornecedor de inteligência artificial** e o aplicativo apresenta informações de apoio, incluindo o telefone do Centro de Valorização da Vida." },
      { t: "p", text: "Nesse caso, o aplicativo registra na conta do usuário apenas a data e a hora do acionamento, **sem armazenar a mensagem nem qualquer parte dela**. Esse registro existe para que, nas 24 horas seguintes, as mensagens do usuário não fiquem sujeitas a limite de uso ou a exigência de assinatura. Ele é eliminado automaticamente após 24 horas e também na exclusão da conta." },
      { t: "p", text: "As conversas também ficam armazenadas na conta do usuário dentro do aplicativo, para que ele possa consultá-las. São dois tratamentos distintos: o armazenamento na conta e a transmissão do conteúdo ao fornecedor de inteligência artificial." },
      { t: "p", text: "O usuário pode apagar suas conversas, e a exclusão da conta remove todas elas." },
      { t: "h3", text: "3-A.5. Assinatura" },
      { t: "p", text: "O aplicativo utiliza os sistemas de pagamento das lojas de aplicativos e um serviço intermediário de gestão de assinaturas. A Almara recebe a informação de que a assinatura está ativa, seu plano e sua validade. **Dados de cartão não são coletados nem armazenados pela Almara.**" },
    ],
  },
  {
    title: "Informações de bem-estar",
    blocks: [
      { t: "p", text: "Alguns recursos do aplicativo registram informações sobre disposição, humor e hábitos, além de textos livres escritos pelo próprio usuário." },
      { t: "p", text: "Esses registros são tratados como conteúdo pessoal do usuário, com a finalidade única de permitir que ele acompanhe a própria rotina. Eles **não são utilizados para publicidade, não são compartilhados com terceiros, não geram avaliação de saúde e não produzem qualquer diagnóstico**." },
      { t: "p", text: "O Almara+ **não é serviço de saúde, não é serviço de emergência e não substitui acompanhamento profissional**." },
    ],
  },
  {
    title: "Dados pessoais sensíveis",
    blocks: [
      { t: "p", text: "A LGPD classifica como **dado pessoal sensível**, entre outros, o dado referente à saúde de uma pessoa natural (artigo 5º, inciso II)." },
      { t: "p", text: "A Almara **procura não coletar dados sensíveis** e estrutura seus questionários e formulários em torno de **preferências de consumo** — sabores, aromas, momentos do dia, rituais e objetivos de bem-estar — e não de condições, sintomas ou históricos de saúde." },
      { t: "p", text: "Caso alguma funcionalidade venha a coletar informações que possam ser caracterizadas como dados de saúde:" },
      { t: "li", text: "a coleta será precedida de **consentimento específico e destacado**, apresentado de forma separada das demais autorizações, nos termos do **artigo 11, inciso I, da LGPD**" },
      { t: "li", text: "a finalidade será informada de maneira clara antes da coleta" },
      { t: "li", text: "o consentimento poderá ser revogado a qualquer momento, sem prejuízo do uso das demais funcionalidades; e" },
      { t: "li", text: "esses dados não serão utilizados para publicidade direcionada nem compartilhados com plataformas de marketing." },
      { t: "p", text: "Informações eventualmente enviadas de forma espontânea pelo usuário durante o atendimento serão utilizadas apenas para responder à solicitação correspondente." },
    ],
  },
  {
    title: "Para que utilizamos seus dados",
    blocks: [
      { t: "h3", text: "Processar suas compras" },
      { t: "p", text: "Registrar e processar pedidos, confirmar pagamentos, emitir documentos fiscais, preparar e enviar produtos, acompanhar entregas, comunicar informações do pedido e realizar trocas, devoluções e reembolsos." },
      { t: "h3", text: "Gerenciar sua conta" },
      { t: "p", text: "Criar e manter seu cadastro, autenticar o acesso, exibir histórico de pedidos e permitir a gestão de preferências." },
      { t: "h3", text: "Prestar atendimento" },
      { t: "p", text: "Responder dúvidas, solicitações, reclamações e demais comunicações realizadas pelos nossos canais." },
      { t: "h3", text: "Recomendar produtos" },
      { t: "p", text: "Utilizar as respostas fornecidas em quizzes e as preferências informadas para sugerir chás e conteúdos compatíveis com o interesse do usuário." },
      { t: "h3", text: "Cumprir obrigações legais" },
      { t: "p", text: "Manter e utilizar informações para cumprimento de obrigações legais, regulatórias, fiscais e contábeis, bem como para a defesa de direitos." },
      { t: "h3", text: "Prevenir fraudes e garantir segurança" },
      { t: "p", text: "Proteger nossos clientes, nosso site e nossa operação contra fraudes, acessos indevidos, atividades suspeitas e incidentes de segurança." },
      { t: "h3", text: "Melhorar o site e a experiência" },
      { t: "p", text: "Analisar informações sobre a utilização do site para compreender seu desempenho, identificar problemas e aprimorar funcionalidades." },
      { t: "h3", text: "Enviar comunicações e novidades" },
      { t: "p", text: "Enviar novidades, conteúdos, lançamentos e promoções. Quando o envio depender de consentimento, ele poderá ser retirado a qualquer momento, e todas as comunicações promocionais por e-mail conterão link para cancelamento da inscrição." },
      { t: "h3", text: "Personalizar publicidade" },
      { t: "p", text: "Caso a Almara utilize ferramentas de publicidade ou remarketing e exista base legal adequada, informações de navegação poderão ser utilizadas para mensuração de campanhas e apresentação de anúncios mais relevantes. O uso de cookies não necessários para essa finalidade depende das escolhas realizadas pelo usuário no painel de cookies." },
    ],
  },
  {
    title: "Bases legais para o tratamento",
    blocks: [
      { t: "p", text: "A Almara trata dados pessoais somente quando há fundamento jurídico adequado. As bases legais mais frequentes em nossa operação são:" },
      {
        t: "table",
        head: ["Finalidade", "Base legal (LGPD)"],
        rows: [
          ["Processar pedidos, pagamentos e entregas", "Execução de contrato (art. 7º, V)"],
          ["Gerenciar conta e cadastro", "Execução de contrato (art. 7º, V)"],
          ["Emitir notas fiscais e cumprir obrigações fiscais", "Obrigação legal ou regulatória (art. 7º, II)"],
          ["Atendimento ao consumidor", "Execução de contrato e exercício regular de direitos (art. 7º, V e VI)"],
          ["Prevenção a fraudes e segurança", "Legítimo interesse e proteção do crédito (art. 7º, IX e X)"],
          ["Melhoria do site e análise de desempenho", "Legítimo interesse (art. 7º, IX)"],
          ["Recomendação de produtos por quiz", "Consentimento ou legítimo interesse, conforme o caso (art. 7º, I e IX)"],
          ["Comunicações de marketing", "Consentimento (art. 7º, I)"],
          ["Cookies não necessários e publicidade", "Consentimento (art. 7º, I)"],
          ["Eventuais dados sensíveis", "Consentimento específico e destacado (art. 11, I)"],
          ["Defesa em processos judiciais ou administrativos", "Exercício regular de direitos (art. 7º, VI)"],
        ],
      },
      { t: "p", text: "Nos tratamentos baseados em legítimo interesse, a Almara considera as legítimas expectativas do titular e adota medidas para preservar seus direitos e liberdades fundamentais." },
    ],
  },
  {
    title: "Com quem podemos compartilhar dados",
    blocks: [
      { t: "p", text: "Para operar nosso e-commerce, poderá ser necessário compartilhar determinados dados pessoais com fornecedores e parceiros, incluindo:" },
      { t: "li", text: "plataformas de hospedagem, infraestrutura e banco de dados" },
      { t: "li", text: "plataformas de e-commerce" },
      { t: "li", text: "empresas de processamento de pagamentos e instituições financeiras" },
      { t: "li", text: "transportadoras, Correios e operadores logísticos" },
      { t: "li", text: "fornecedores de emissão fiscal e serviços contábeis" },
      { t: "li", text: "ferramentas de atendimento ao cliente e automação de mensagens" },
      { t: "li", text: "fornecedores de tecnologia e segurança" },
      { t: "li", text: "ferramentas de análise de desempenho" },
      { t: "li", text: "plataformas de marketing e publicidade, quando utilizadas; e" },
      { t: "li", text: "fornecedor de inteligência artificial responsável pelo funcionamento do assistente virtual do aplicativo" },
      { t: "li", text: "serviço de gestão de assinaturas e lojas de aplicativos" },
      { t: "li", text: "autoridades públicas, judiciais ou administrativas, quando houver obrigação legal ou determinação válida." },
      { t: "p", text: "O compartilhamento é realizado **na medida necessária** para cada finalidade, mediante instrumentos contratuais adequados." },
      { t: "strong", text: "A Almara não comercializa dados pessoais de seus clientes." },
    ],
  },
  {
    title: "Transferência internacional de dados",
    blocks: [
      { t: "p", text: "Alguns fornecedores de tecnologia utilizados pela Almara — como serviços de hospedagem, infraestrutura em nuvem, análise de dados e ferramentas de marketing — armazenam ou processam informações em servidores localizados **fora do Brasil**, incluindo os Estados Unidos e países da União Europeia." },
      { t: "p", text: "Nessas hipóteses, a Almara adota os mecanismos previstos no **Capítulo V da LGPD**, incluindo cláusulas contratuais específicas e a contratação de fornecedores que ofereçam grau de proteção compatível com a legislação brasileira." },
      { t: "p", text: "Isso inclui o serviço de inteligência artificial utilizado pelo assistente virtual do aplicativo, ao qual o conteúdo das conversas é transmitido sem identificador pessoal, conforme descrito na seção 3-A.4." },
    ],
  },
  {
    title: "Por quanto tempo guardamos seus dados",
    blocks: [
      { t: "p", text: "Os dados pessoais são mantidos pelo período necessário ao cumprimento das finalidades para as quais foram coletados. A título indicativo:" },
      {
        t: "table",
        head: ["Tipo de dado", "Prazo de retenção"],
        rows: [
          ["Dados de pedidos e notas fiscais", "Pelo prazo exigido pela legislação fiscal e contábil"],
          ["Dados de cadastro e conta", "Enquanto a conta estiver ativa, e por prazo adicional para defesa de direitos"],
          ["Registros de acesso à aplicação", "6 meses, nos termos do Marco Civil da Internet"],
          ["Diário, check-ins de humor e conversas com a Mara", "Enquanto a conta estiver ativa; eliminados na exclusão da conta"],
          ["Progresso de jornadas e jardim", "Enquanto a conta estiver ativa"],
          ["Dados de atendimento", "Pelo prazo necessário à resolução da solicitação e à defesa de direitos"],
          ["Dados tratados com base em consentimento", "Até a revogação do consentimento, observadas as hipóteses legais de conservação"],
        ],
      },
      { t: "p", text: "Quando os dados deixarem de ser necessários e não houver fundamento jurídico para sua conservação, serão eliminados ou anonimizados." },
    ],
  },
  {
    title: "Como protegemos seus dados",
    blocks: [
      { t: "p", text: "A Almara adota medidas técnicas e administrativas para proteger os dados pessoais contra acesso não autorizado, perda, alteração, destruição, divulgação ou utilização inadequada, incluindo criptografia em trânsito, controle de acesso, armazenamento seguro de credenciais e seleção criteriosa de fornecedores." },
      { t: "p", text: "Nenhum sistema eletrônico é completamente imune a riscos. Por isso, nossos procedimentos de segurança são periodicamente avaliados e aprimorados." },
      { t: "p", text: "Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, a Almara comunicará a ANPD e os titulares afetados, nos termos do **artigo 48 da LGPD**." },
    ],
  },
  {
    title: "Seus direitos",
    blocks: [
      { t: "p", text: "Nos termos da LGPD, o titular pode solicitar:" },
      { t: "li", text: "confirmação da existência de tratamento" },
      { t: "li", text: "acesso aos dados" },
      { t: "li", text: "correção de dados incompletos, inexatos ou desatualizados" },
      { t: "li", text: "anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade" },
      { t: "li", text: "portabilidade dos dados, observada a regulamentação" },
      { t: "li", text: "eliminação dos dados tratados com base no consentimento" },
      { t: "li", text: "informação sobre as entidades com as quais seus dados foram compartilhados" },
      { t: "li", text: "informação sobre a possibilidade de não fornecer consentimento e suas consequências" },
      { t: "li", text: "revogação do consentimento" },
      { t: "li", text: "oposição a tratamento realizado com base em uma das hipóteses de dispensa de consentimento; e" },
      { t: "li", text: "revisão de decisões automatizadas, quando aplicável." },
      { t: "h3", text: "Como exercer" },
      { t: "p", text: "Envie sua solicitação para **kezia.borges@almara.com.br** ou para o(a) Encarregado(a) indicado(a) na seção 2." },
      { t: "p", text: "Responderemos em até **15 (quinze) dias** nas hipóteses previstas no artigo 19, §3º, da LGPD, e nos demais casos no menor prazo possível." },
      { t: "h3", text: "Exclusão de conta" },
      { t: "p", text: "A exclusão da conta do aplicativo pode ser solicitada diretamente no Almara+, em **Perfil → Excluir conta**, com efeito imediato, ou pela página **almara.com.br/excluir-conta**, para quem não tem mais o aplicativo instalado." },
      { t: "p", text: "No pedido feito pela página, confirmamos o recebimento em até **1 dia útil** e concluímos a exclusão em até **7 dias corridos** após a confirmação por e-mail do titular." },
      { t: "p", text: "A exclusão remove os dados de conta, diário, humor, conversas com a Mara e progresso das jornadas. Informações de pedidos já realizados são mantidas de forma anonimizada, pelo prazo exigido pela legislação fiscal, conforme o artigo 18, VI, da LGPD." },
      { t: "p", text: "Poderemos solicitar informações adicionais para confirmar sua identidade antes de atender determinadas solicitações, como medida de proteção contra pedidos fraudulentos." },
    ],
  },
  {
    title: "Cookies",
    blocks: [
      { t: "p", text: "Cookies são pequenos arquivos armazenados no dispositivo utilizado para acessar um site. Eles permitem o funcionamento de determinadas funcionalidades, lembram preferências e fornecem informações sobre a forma como o site é utilizado." },
      { t: "p", text: "A Almara poderá utilizar cookies próprios e cookies disponibilizados por terceiros." },
      { t: "h3", text: "12.1. Categorias de cookies" },
      { t: "p", text: "**Cookies necessários** — permitem funções essenciais do site e do e-commerce, como funcionamento das páginas, segurança, manutenção da sessão, autenticação, carrinho de compras e processamento do checkout. Sua desativação compromete o funcionamento do site." },
      { t: "p", text: "**Cookies de funcionalidade** — lembram escolhas e preferências do usuário para proporcionar uma experiência mais personalizada." },
      { t: "p", text: "**Cookies analíticos ou de desempenho** — ajudam a compreender como os visitantes utilizam o site: páginas mais acessadas, tempo de permanência, origem dos acessos, interações com produtos e eventuais erros de navegação." },
      { t: "p", text: "**Cookies de publicidade e marketing** — quando utilizados, permitem mensurar campanhas, compreender interações com anúncios, limitar a repetição de anúncios, realizar remarketing e apresentar publicidade relacionada aos interesses do usuário." },
      { t: "h3", text: "12.2. Cookies de terceiros" },
      { t: "p", text: "Algumas funcionalidades utilizam serviços fornecidos por terceiros, o que pode incluir plataforma de e-commerce, gateway de pagamento, serviços de análise de tráfego, plataformas de publicidade, ferramentas de atendimento, automação de marketing e integrações com redes sociais." },
      { t: "p", text: "Esses fornecedores utilizam tecnologias próprias, de acordo com suas respectivas políticas de privacidade. A lista específica de cookies em uso está disponível no painel de gerenciamento de cookies do site." },
      { t: "h3", text: "12.3. Como gerenciar" },
      { t: "p", text: "Ao acessar o site pela primeira vez, você visualizará um aviso sobre o uso de cookies, no qual poderá **aceitar**, **rejeitar os cookies não necessários** ou **personalizar suas preferências por categoria**." },
      { t: "p", text: "Os cookies estritamente necessários permanecem ativos por serem indispensáveis ao funcionamento do site." },
      { t: "p", text: "As preferências podem ser alteradas a qualquer momento pelo painel de gerenciamento de cookies disponível no site. Você também pode configurar seu navegador para bloquear ou excluir cookies, observando que determinadas configurações podem afetar o funcionamento de algumas funcionalidades." },
    ],
  },
  {
    title: "Dados de crianças e adolescentes",
    blocks: [
      { t: "p", text: "O site e a loja virtual da Almara **não são direcionados a crianças** e não devem ser utilizados por menores de 18 anos sem a assistência de seus pais ou responsáveis legais." },
      { t: "p", text: "Caso seja identificado tratamento de dados pessoais de crianças ou adolescentes, a Almara observará as regras e salvaguardas específicas do **artigo 14 da LGPD**, considerando sempre o melhor interesse desse público, e poderá eliminar os dados coletados sem o consentimento adequado." },
    ],
  },
  {
    title: "Links para outros sites",
    blocks: [
      { t: "p", text: "Nosso site pode conter links para sites, redes sociais ou serviços administrados por terceiros, sobre cujas práticas de privacidade a Almara não exerce controle." },
      { t: "p", text: "Recomendamos consultar as respectivas políticas de privacidade ao acessar esses ambientes." },
    ],
  },
  {
    title: "Alterações desta política",
    blocks: [
      { t: "p", text: "Esta Política poderá ser atualizada para refletir mudanças na operação da Almara, nas tecnologias utilizadas ou na legislação aplicável." },
      { t: "p", text: "A versão mais recente permanecerá disponível no site com a indicação da data da última atualização. Quando uma alteração relevante exigir nova manifestação ou consentimento, adotaremos as medidas cabíveis para comunicá-la." },
    ],
  },
  {
    title: "Contato",
    blocks: [
      { t: "kv", k: "E-mail para assuntos de privacidade", v: "kezia.borges@almara.com.br" },
      { t: "kv", k: "Encarregado(a) pelo Tratamento de Dados Pessoais", v: "Kezia Borges de Oliveira — kezia.borges@almara.com.br" },
      { t: "kv", k: "WhatsApp", v: "(19) 99030-6995" },
      { t: "kv", k: "Endereço", v: "Rua Heraclito Graça, 124, apto 33, Casa Verde Média — São Paulo/SP — CEP 02530-030" },
      { t: "kv", k: "Documentos relacionados", v: "Termos de Uso · Política de Trocas e Devoluções" },
    ],
  },
];

const INTRO = [
  "A sua privacidade é importante para a Almara.",
  "Esta Política explica como coletamos, utilizamos, armazenamos, compartilhamos e protegemos dados pessoais quando você acessa nosso site, cria uma conta, realiza uma compra, responde a um quiz, entra em contato conosco ou se cadastra para receber comunicações.",
  "O tratamento de dados pessoais realizado pela Almara observa a legislação brasileira aplicável, especialmente a **Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD)**.",
  "Esta Política integra os **Termos de Uso** da Almara e deve ser lida em conjunto com eles e com a **Política de Trocas e Devoluções**.",
];

const RELATED = [
  { href: "/termos-de-uso", label: "Termos de Uso" },
  { href: "/politica-de-trocas-e-devolucoes", label: "Política de Trocas e Devoluções" },
  { href: "/excluir-conta", label: "Excluir conta" },
  { href: "/suporte", label: "Suporte" },
];

export default function Page() {
  return (
    <LegalPage
      title={"Política de Privacidade e Cookies"}
      updated={"setembro de 2026"}
      intro={INTRO}
      sections={SECTIONS}
      related={RELATED}
    />
  );
}
