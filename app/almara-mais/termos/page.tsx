import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

// Termos de Uso do APP Almara+, publicados no site (2026-11-05) pra ter um link público — o app mostra
// os mesmos termos por dentro (mobile/src/data/appTerms.ts, "Perfil → Termos"). O texto abaixo é
// cópia literal de lá: não editar aqui; mudou no app, gerar esta página de novo.

export const metadata: Metadata = {
  alternates: { canonical: "/almara-mais/termos" },
  title: "Termos de Uso do Almara+ — Almara",
  description: "Termos de Uso do aplicativo Almara+: conta, conteúdo, ferramentas, assinatura e privacidade.",
};

const TOPO = [
  { k: "Razão social", v: "ALMARA PRODUTOS NATURAIS LTDA" },
  { k: "CNPJ", v: "69.611.850/0001-22" },
];

const INTRO = [
  "Boas-vindas ao Almara+.",
  "Estes Termos regulam o uso do aplicativo Almara+, incluindo a criação de conta, o acesso ao conteúdo, o uso das ferramentas e a assinatura.",
  "Ao criar uma conta ou utilizar o aplicativo, você declara estar ciente destes Termos e concorda com eles.",
];

const SECTIONS: LegalSection[] = [
  {
    title: "1. Quem oferece o Almara+",
    blocks: [
      { t: "kv", k: "Razão social", v: "ALMARA PRODUTOS NATURAIS LTDA" },
      { t: "kv", k: "Nome fantasia", v: "Almara" },
      { t: "kv", k: "CNPJ", v: "69.611.850/0001-22" },
      { t: "kv", k: "Endereço", v: "Rua Heráclito Graça, 124, apto 33 — Casa Verde Média — São Paulo/SP — CEP 02530-030" },
      { t: "kv", k: "E-mail", v: "ola@almara.com.br" },
      { t: "kv", k: "WhatsApp", v: "(19) 99030-6995" },
      { t: "kv", k: "Atendimento", v: "Segunda a sexta, das 8h às 18h" },
    ],
  },
  {
    title: "2. O que estes Termos cobrem",
    blocks: [
      { t: "p", text: "Estes Termos aplicam-se ao aplicativo Almara+ e à assinatura contratada dentro dele." },
      { t: "p", text: "A compra de produtos físicos — os chás da Almara — é regida pelos Termos de Uso do site, disponíveis em almara.com.br/termos-de-uso, e pela Política de Trocas e Devoluções. Isso vale mesmo quando a compra for iniciada dentro do aplicativo: entrega, troca, devolução, arrependimento e reembolso seguem aqueles documentos." },
      { t: "p", text: "O tratamento de dados pessoais em ambos os ambientes segue a Política de Privacidade e Cookies, disponível em almara.com.br/politica-de-privacidade." },
    ],
  },
  {
    title: "3. O que o Almara+ é — e o que não é",
    blocks: [
      { t: "p", text: "O Almara+ é um aplicativo de bem-estar e organização de rotina. Ele oferece jornadas de 21 dias com conteúdo diário, ferramentas de apoio ao hábito, um diário, registro de disposição, um jardim que acompanha seu progresso e uma assistente virtual chamada Mara." },
      { t: "p", text: "Todo o conteúdo tem caráter informativo e de apoio à rotina." },
      { t: "strong", text: "O Almara+ não é serviço de saúde. Ele não realiza diagnóstico, não prescreve tratamento e não substitui acompanhamento médico, psicológico, nutricional ou de qualquer outro profissional habilitado." },
      { t: "strong", text: "O Almara+ não é serviço de emergência. Ele não presta atendimento de urgência e não substitui os serviços públicos de emergência." },
      { t: "strong", text: "Se você estiver passando por um momento difícil ou em situação de risco, procure ajuda agora. O CVV atende 24 horas, gratuitamente, pelo telefone 188 e por chat em cvv.org.br. Em caso de emergência, ligue 192." },
      { t: "p", text: "Pessoas com condições específicas de saúde, gestantes, lactantes ou em uso de medicamentos devem procurar orientação profissional antes de adotar qualquer prática sugerida no aplicativo ou de consumir determinados ingredientes." },
    ],
  },
  {
    title: "4. Quem pode usar",
    blocks: [
      { t: "p", text: "O Almara+ é destinado a maiores de 18 anos. Menores de 18 anos só podem utilizá-lo com assistência de pais ou responsáveis legais, que serão responsáveis pelo uso e pelo aceite destes Termos." },
    ],
  },
  {
    title: "5. Conta",
    blocks: [
      { t: "p", text: "Para usar o aplicativo é necessário criar uma conta com e-mail e senha." },
      { t: "p", text: "Você se compromete a fornecer informações verdadeiras e atualizadas, manter sua senha em sigilo e comunicar imediatamente qualquer suspeita de uso não autorizado." },
      { t: "p", text: "A conta é pessoal e intransferível. As ações realizadas por meio dela presumem-se suas, salvo comprovação em contrário." },
      { t: "h3", text: "Exclusão de conta" },
      { t: "p", text: "Você pode excluir sua conta a qualquer momento em Perfil → Excluir conta, com efeito imediato, ou pela página almara.com.br/excluir-conta caso não tenha mais o aplicativo instalado." },
      { t: "p", text: "A exclusão remove seus dados de conta, o diário, os registros de disposição, as conversas com a Mara e o progresso das jornadas. Informações de pedidos já realizados são mantidas de forma anonimizada pelo prazo exigido pela legislação fiscal, conforme descrito na Política de Privacidade." },
      { t: "strong", text: "Excluir a conta não cancela a assinatura, que é gerenciada pela loja de aplicativos. Veja a seção 6." },
    ],
  },
  {
    title: "6. Assinatura",
    blocks: [
      { t: "h3", text: "Planos e período de teste" },
      { t: "p", text: "O Almara+ oferece um período de teste gratuito de 7 dias. O teste termina sem cobrança. Se você assinar, a cobrança começa no momento da assinatura, no plano escolhido, e se renova automaticamente até ser cancelada." },
      { t: "p", text: "Preço, periodicidade e condições vigentes são exibidos na tela de assinatura antes da contratação." },
      { t: "h3", text: "Renovação automática" },
      { t: "p", text: "A assinatura renova-se automaticamente ao fim de cada período, pelo preço vigente, até que seja cancelada." },
      { t: "h3", text: "Cancelamento" },
      { t: "p", text: "O cancelamento é feito diretamente na loja de aplicativos:" },
      { t: "li", text: "iPhone: Ajustes → seu nome → Assinaturas" },
      { t: "li", text: "Android: Google Play Store → Pagamentos e assinaturas" },
      { t: "p", text: "Para evitar a cobrança do período seguinte, o cancelamento deve ser feito com pelo menos 24 horas de antecedência em relação à data de renovação." },
      { t: "p", text: "O cancelamento encerra a renovação, e o acesso permanece disponível até o fim do período já pago." },
      { t: "h3", text: "Pagamento e reembolso" },
      { t: "p", text: "A cobrança é processada pela loja de aplicativos, conforme os termos e as políticas dela. A Almara não coleta nem armazena dados de cartão." },
      { t: "p", text: "Pedidos de reembolso da assinatura seguem as regras da respectiva loja. Isso não afasta os direitos assegurados pela legislação brasileira, incluindo o direito de arrependimento previsto no artigo 49 do Código de Defesa do Consumidor." },
      { t: "h3", text: "Mudanças de preço" },
      { t: "p", text: "Alterações de preço serão comunicadas com antecedência e só se aplicam aos períodos seguintes. Você poderá cancelar antes que a nova condição entre em vigor." },
    ],
  },
  {
    title: "7. Conteúdo gerado por você",
    blocks: [
      { t: "p", text: "O que você escreve no diário, nos registros de disposição e nas conversas com a Mara pertence a você." },
      { t: "p", text: "Esse conteúdo é armazenado na sua conta, não é lido por pessoas da Almara, não é usado para publicidade e não é compartilhado com terceiros — com a exceção descrita na seção 8 e detalhada na Política de Privacidade." },
    ],
  },
  {
    title: "8. A Mara",
    blocks: [
      { t: "p", text: "A Mara é uma assistente virtual, não uma pessoa e não um profissional de saúde. As respostas dela são geradas automaticamente e podem conter imprecisões — não devem ser tratadas como orientação profissional." },
      { t: "p", text: "Para gerar as respostas, o conteúdo da conversa é processado por um serviço de inteligência artificial fornecido por terceiro, sem qualquer identificador que vincule a conversa a você. O que é enviado e o que não é está descrito na seção 3-A.4 da Política de Privacidade." },
      { t: "p", text: "Antes do envio, as mensagens passam por uma verificação automática. Quando ela identifica indicação de sofrimento grave ou risco, a mensagem não é enviada ao fornecedor e o aplicativo apresenta informações de apoio." },
      { t: "p", text: "O uso da Mara pode estar sujeito a limite diário de mensagens, informado no próprio aplicativo." },
    ],
  },
  {
    title: "9. Uso adequado",
    blocks: [
      { t: "p", text: "Ao usar o Almara+, você se compromete a não:" },
      { t: "li", text: "utilizar o aplicativo para finalidade ilícita;" },
      { t: "li", text: "tentar acessar contas, sistemas ou dados de terceiros;" },
      { t: "li", text: "copiar, extrair, redistribuir ou explorar comercialmente o conteúdo das jornadas;" },
      { t: "li", text: "usar a Mara para gerar conteúdo ilegal, ofensivo ou que viole direitos de terceiros;" },
      { t: "li", text: "burlar limites de uso, do período de teste ou da assinatura." },
      { t: "p", text: "O descumprimento pode levar à suspensão ou ao encerramento da conta, preservados os direitos do consumidor relativos a valores já pagos." },
    ],
  },
  {
    title: "10. Propriedade intelectual",
    blocks: [
      { t: "p", text: "O conteúdo das jornadas, os textos, as ilustrações, a Mara, o jardim, a identidade visual e as demais partes do aplicativo pertencem à Almara ou são utilizados mediante autorização." },
      { t: "p", text: "Você recebe uma licença pessoal, limitada, revogável e intransferível para usar o aplicativo enquanto sua conta estiver ativa. Nada nestes Termos transfere titularidade." },
      { t: "p", text: "Conteúdos de terceiros utilizados sob licença estão creditados dentro do aplicativo, em Perfil → Configurações." },
    ],
  },
  {
    title: "11. Disponibilidade e alterações",
    blocks: [
      { t: "p", text: "Buscamos manter o aplicativo disponível e funcionando, mas podem ocorrer indisponibilidades por manutenção, falha técnica ou fatores fora do nosso controle razoável." },
      { t: "p", text: "Podemos alterar, incluir ou descontinuar funcionalidades ao longo do tempo. Alterações relevantes que afetem o que foi contratado serão comunicadas com antecedência, e você poderá cancelar a assinatura se não concordar." },
    ],
  },
  {
    title: "12. Responsabilidades",
    blocks: [
      { t: "strong", text: "Nenhuma disposição destes Termos deverá ser interpretada de forma a excluir, limitar ou dificultar o exercício de direitos garantidos ao consumidor pela legislação brasileira." },
      { t: "p", text: "As decisões que você toma a partir do conteúdo do aplicativo são suas. Como descrito na seção 3, o Almara+ não substitui acompanhamento profissional." },
    ],
  },
  {
    title: "13. Alterações destes Termos",
    blocks: [
      { t: "p", text: "Podemos atualizar estes Termos para refletir mudanças no aplicativo, nos serviços ou na legislação." },
      { t: "p", text: "A versão vigente fica sempre disponível dentro do aplicativo, com a data da última atualização. Quando a alteração for relevante, avisaremos antes que ela passe a valer." },
    ],
  },
  {
    title: "14. Legislação aplicável",
    blocks: [
      { t: "p", text: "Estes Termos são regidos pela legislação brasileira, especialmente pelo Código de Defesa do Consumidor, pelo Marco Civil da Internet e pela Lei Geral de Proteção de Dados Pessoais." },
      { t: "p", text: "Ficam preservados os direitos do consumidor relativos ao foro competente previstos na legislação brasileira." },
    ],
  },
  {
    title: "15. Contato",
    blocks: [
      { t: "kv", k: "E-mail", v: "ola@almara.com.br" },
      { t: "kv", k: "WhatsApp", v: "(19) 99030-6995" },
      { t: "kv", k: "Atendimento", v: "Segunda a sexta, das 8h às 18h" },
    ],
  },
];

const RELATED = [
  { href: "/almara-mais", label: "Conheça o Almara+" },
  { href: "/politica-de-privacidade", label: "Política de Privacidade e Cookies" },
  { href: "/excluir-conta", label: "Excluir conta" },
  { href: "/suporte", label: "Suporte" },
];

export default function Page() {
  return (
    <LegalPage
      title={"Termos de Uso do Almara+"}
      updated={"outubro de 2026"}
      topo={TOPO}
      intro={INTRO}
      sections={SECTIONS}
      related={RELATED}
    />
  );
}
