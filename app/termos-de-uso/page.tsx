import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  alternates: { canonical: "/termos-de-uso" },
  title: "Termos de Uso — Almara",
  description: "Termos de Uso do site e da loja virtual da Almara: compras, entrega, conta, propriedade intelectual e legislação aplicável.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "Sobre a Almara",
    blocks: [
      { t: "p", text: "A Almara é uma marca dedicada à comercialização de chás e produtos relacionados ao ritual e à experiência de consumo de chá." },
      { t: "kv", k: "Razão social", v: "ALMARA PRODUTOS NATURAIS LTDA" },
      { t: "kv", k: "Nome fantasia", v: "Almara" },
      { t: "kv", k: "CNPJ", v: "69.611.850/0001-22" },
      { t: "kv", k: "Endereço", v: "Rua Heraclito Graça, 124, apto 33, Casa Verde Média — São Paulo/SP — CEP 02530-030" },
      { t: "kv", k: "E-mail de atendimento", v: "ola@almara.com.br" },
      { t: "kv", k: "WhatsApp", v: "(19) 99030-6995" },
      { t: "kv", k: "Horário de atendimento", v: "Segunda a sexta, das 8h às 18h" },
    ],
  },
  {
    title: "Definições",
    blocks: [
      { t: "p", text: "Para facilitar a leitura destes Termos:" },
      { t: "li", text: "**Site:** o site da Almara, incluindo todas as suas páginas e a loja virtual." },
      { t: "li", text: "**Usuário:** qualquer pessoa que acesse ou navegue pelo site." },
      { t: "li", text: "**Consumidor:** o usuário que realiza uma compra na loja virtual." },
      { t: "li", text: "**Conta:** o cadastro criado pelo usuário no site, quando aplicável." },
      { t: "li", text: "**Produtos:** os chás e demais itens comercializados pela Almara." },
      { t: "li", text: "**Aplicativo Almara+:** o aplicativo móvel da Almara, que possui termos próprios, conforme a seção 3.2." },
    ],
  },
  {
    title: "Escopo e documentos relacionados",
    blocks: [
      { t: "h3", text: "3.1. O que estes Termos cobrem" },
      { t: "p", text: "Estes Termos aplicam-se exclusivamente ao **site e à loja virtual** da Almara, e devem ser lidos em conjunto com:" },
      { t: "li", text: "a **Política de Trocas e Devoluções**, que detalha prazos e procedimentos de troca, devolução, arrependimento, cancelamento e reembolso; e" },
      { t: "li", text: "a **Política de Privacidade e Cookies**, que descreve como os dados pessoais são tratados." },
      { t: "p", text: "Esses documentos são complementares e integram estes Termos. Em caso de divergência entre eles sobre um mesmo assunto, prevalecerá o documento específico sobre a matéria — a Política de Trocas e Devoluções nos temas de troca, devolução e reembolso, e a Política de Privacidade e Cookies nos temas de tratamento de dados pessoais." },
      { t: "p", text: "Em qualquer hipótese, prevalecerá a legislação brasileira sobre qualquer disposição destes Termos ou das políticas relacionadas." },
      { t: "h3", text: "3.2. O que estes Termos não cobrem" },
      { t: "p", text: "O **aplicativo Almara+** possui **Termos de Uso próprios**, disponibilizados dentro do próprio aplicativo, que regulam funcionalidades como conta, progresso, jornadas, conteúdos e demais recursos ali oferecidos." },
      { t: "p", text: "Quando o usuário utilizar uma mesma conta ou vincular a compra realizada na loja virtual a funcionalidades do aplicativo:" },
      { t: "li", text: "a **compra, entrega, troca, devolução e reembolso** dos produtos físicos regem-se por estes Termos e pela Política de Trocas e Devoluções; e" },
      { t: "li", text: "o **uso do aplicativo e de suas funcionalidades** rege-se pelos Termos de Uso do Almara+." },
      { t: "p", text: "O tratamento de dados pessoais em ambos os ambientes observa a Política de Privacidade e Cookies da Almara, complementada pelas informações específicas do aplicativo, quando aplicável." },
    ],
  },
  {
    title: "Uso do site",
    blocks: [
      { t: "p", text: "O usuário compromete-se a utilizar o site de maneira lícita e adequada, respeitando estes Termos e a legislação brasileira." },
      { t: "p", text: "Não é permitido utilizar o site para:" },
      { t: "li", text: "práticas fraudulentas ou atividades ilícitas" },
      { t: "li", text: "tentativas de acesso não autorizado a sistemas, contas ou dados" },
      { t: "li", text: "reprodução, extração ou raspagem indevida de conteúdos" },
      { t: "li", text: "introdução de códigos maliciosos ou qualquer conduta que comprometa a segurança ou o funcionamento do site; ou" },
      { t: "li", text: "qualquer atividade que possa prejudicar a Almara, seus clientes ou terceiros." },
      { t: "p", text: "A Almara poderá realizar atualizações, alterações ou manutenções no site sempre que necessário." },
    ],
  },
  {
    title: "Cadastro e conta",
    blocks: [
      { t: "p", text: "Algumas funcionalidades do site podem exigir a criação de uma conta." },
      { t: "p", text: "Ao se cadastrar, o usuário compromete-se a:" },
      { t: "li", text: "fornecer informações verdadeiras, completas e atualizadas" },
      { t: "li", text: "manter seus dados de acesso em sigilo, não os compartilhando com terceiros; e" },
      { t: "li", text: "comunicar a Almara imediatamente em caso de suspeita de uso não autorizado da conta." },
      { t: "p", text: "A conta é pessoal e intransferível. As ações realizadas por meio dela presumem-se praticadas pelo titular, salvo comprovação em contrário." },
      { t: "p", text: "A Almara poderá suspender ou encerrar contas em caso de violação destes Termos, indício de fraude ou determinação legal, sem prejuízo dos pedidos já confirmados e dos direitos do consumidor relacionados a eles." },
      { t: "p", text: "O usuário poderá solicitar o encerramento de sua conta a qualquer momento pelos canais de atendimento. O encerramento não afasta a conservação de dados nas hipóteses legais previstas na Política de Privacidade e Cookies." },
    ],
  },
  {
    title: "Informações sobre os produtos",
    blocks: [
      { t: "p", text: "Buscamos apresentar informações claras e atualizadas sobre nossos produtos, incluindo características, ingredientes, quantidade, modo de preparo e demais informações relevantes." },
      { t: "p", text: "As imagens do site possuem caráter ilustrativo e podem apresentar pequenas diferenças de cor ou aparência em razão de iluminação, fotografia, tela utilizada ou características naturais do próprio produto." },
      { t: "p", text: "O consumidor deve sempre consultar as informações presentes na embalagem, observando ingredientes, orientações de conservação, prazo de validade e eventuais advertências antes do consumo." },
      { t: "p", text: "Erros evidentes de digitação, preço ou descrição poderão ser corrigidos pela Almara, que comunicará o consumidor e apresentará as alternativas cabíveis, incluindo o cancelamento do pedido com reembolso integral quando for o caso." },
    ],
  },
  {
    title: "Informações de bem-estar e saúde",
    blocks: [
      { t: "p", text: "Os conteúdos disponibilizados pela Almara sobre chás, ingredientes, hábitos, rituais, autocuidado ou bem-estar — incluindo textos, quizzes, recomendações de jornada e materiais educativos — possuem **caráter exclusivamente informativo** e **não substituem orientação médica, nutricional ou de outro profissional de saúde habilitado**." },
      { t: "p", text: "A Almara não realiza diagnósticos, não prescreve tratamentos e não recomenda que seus conteúdos ou produtos sejam utilizados como substitutos de tratamentos, medicamentos ou acompanhamento profissional." },
      { t: "p", text: "Nossos produtos são **alimentos** e não possuem finalidade medicamentosa ou terapêutica." },
      { t: "p", text: "Pessoas com condições específicas de saúde, gestantes, lactantes, crianças, idosos ou pessoas que utilizem medicamentos devem buscar orientação profissional antes do consumo de determinados ingredientes." },
      { t: "p", text: "Eventuais sugestões personalizadas apresentadas no site, inclusive as decorrentes de quizzes ou questionários, são baseadas nas informações fornecidas voluntariamente pelo próprio usuário e têm finalidade de recomendação de produto, não de avaliação de saúde." },
    ],
  },
  {
    title: "Preços e disponibilidade",
    blocks: [
      { t: "p", text: "Os preços são informados em reais (R$) e poderão ser alterados sem aviso prévio, respeitando-se sempre o valor apresentado e confirmado no momento da conclusão da compra." },
      { t: "p", text: "O frete é calculado a partir do CEP de entrega, com base no peso e nas dimensões do pedido, e apresentado ao consumidor, com valor e prazo, antes da finalização. Pedidos com produtos a partir de R$ 100,00 têm frete grátis. Eventuais outros custos também serão informados antes da finalização do pedido." },
      { t: "p", text: "Os produtos estão sujeitos à disponibilidade de estoque." },
      { t: "p", text: "Caso, excepcionalmente, um produto adquirido fique indisponível após a confirmação do pedido, a Almara entrará em contato para apresentar as alternativas cabíveis, incluindo a substituição mediante concordância do consumidor ou o reembolso integral do valor pago." },
    ],
  },
  {
    title: "Cupons, descontos e ações promocionais",
    blocks: [
      { t: "p", text: "A Almara poderá disponibilizar cupons de desconto, promoções, brindes, frete promocional ou outras ações." },
      { t: "p", text: "Salvo indicação expressa em contrário na respectiva ação:" },
      { t: "li", text: "cada cupom possui prazo de validade, condições de uso e eventuais restrições, informados no momento da divulgação" },
      { t: "li", text: "cupons e promoções não são cumulativos entre si" },
      { t: "li", text: "cupons são pessoais, intransferíveis e não conversíveis em dinheiro; e" },
      { t: "li", text: "em caso de cancelamento, devolução ou arrependimento, o reembolso corresponderá ao valor efetivamente pago pelo consumidor." },
      { t: "p", text: "A Almara poderá encerrar ou alterar ações promocionais a qualquer momento, preservando as condições dos pedidos já concluídos." },
      { t: "p", text: "Cupons obtidos por meio de fraude, uso indevido ou automação poderão ser cancelados." },
    ],
  },
  {
    title: "Pedidos e pagamentos",
    blocks: [
      { t: "p", text: "O pedido será considerado concluído após a finalização da compra e estará sujeito à confirmação do pagamento." },
      { t: "p", text: "A Almara utiliza empresas terceirizadas especializadas para o processamento de pagamentos. Os dados completos do meio de pagamento são tratados diretamente por esses fornecedores, conforme descrito na Política de Privacidade e Cookies." },
      { t: "p", text: "Em determinadas situações, uma compra poderá passar por procedimentos de segurança e validação destinados à prevenção de fraudes." },
      { t: "p", text: "Caso o pagamento não seja aprovado, o pedido poderá ser cancelado, o que será comunicado ao consumidor." },
    ],
  },
  {
    title: "Entrega",
    blocks: [
      { t: "p", text: "O prazo estimado e o valor da entrega serão apresentados durante o processo de compra, considerando fatores como endereço informado, modalidade de envio e disponibilidade do produto." },
      { t: "p", text: "O prazo de entrega passa a contar a partir da confirmação do pagamento e não inclui o prazo de separação e postagem do pedido, que será informado no site." },
      { t: "p", text: "É responsabilidade do consumidor fornecer corretamente os dados necessários para entrega. Custos decorrentes de reenvio por endereço incorreto ou ausência de recebimento após as tentativas realizadas pela transportadora poderão ser cobrados, hipótese em que o consumidor será previamente informado." },
      { t: "p", text: "Eventuais atrasos decorrentes de situações excepcionais serão comunicados ao consumidor e tratados de acordo com a legislação aplicável e as circunstâncias de cada pedido." },
    ],
  },
  {
    title: "Recebimento dos produtos",
    blocks: [
      { t: "p", text: "Ao receber o pedido, recomendamos que o consumidor verifique as condições da embalagem e dos produtos." },
      { t: "p", text: "Caso sejam identificados sinais de avaria, violação, produto incorreto, ausência de itens ou qualquer outra irregularidade, o consumidor deverá entrar em contato com a Almara pelos canais indicados na seção 1." },
      { t: "p", text: "Por se tratar de produto alimentício, recomendamos não consumir produtos que apresentem sinais de avaria, violação, deterioração ou validade vencida." },
    ],
  },
  {
    title: "Trocas, devoluções e direito de arrependimento",
    blocks: [
      { t: "p", text: "Nas compras realizadas pelo site, o consumidor poderá exercer o **direito de arrependimento no prazo de 7 (sete) dias corridos**, contado do recebimento do produto, nos termos do artigo 49 do Código de Defesa do Consumidor, sem necessidade de justificativa." },
      { t: "p", text: "Para produtos com vício ou defeito, aplica-se o prazo de **30 (trinta) dias** previsto no artigo 26, inciso I, do Código de Defesa do Consumidor, por se tratar de produto não durável." },
      { t: "p", text: "As condições, prazos e procedimentos completos — incluindo troca, devolução, cancelamento e reembolso — estão descritos na **Política de Trocas e Devoluções** da Almara, que integra estes Termos." },
    ],
  },
  {
    title: "Propriedade intelectual",
    blocks: [
      { t: "p", text: "O nome Almara, sua identidade visual, logotipos, fotografias, ilustrações, textos, vídeos, embalagens, elementos gráficos, personagens, interfaces e demais conteúdos produzidos ou disponibilizados pela marca são protegidos pela legislação aplicável." },
      { t: "p", text: "Não é permitida sua reprodução, distribuição, modificação ou utilização comercial sem autorização prévia e expressa da Almara, salvo nas hipóteses permitidas por lei." },
      { t: "p", text: "Caso o usuário envie conteúdos à Almara — como avaliações, fotos, comentários ou sugestões — declara possuir os direitos necessários sobre esse material e autoriza a Almara a utilizá-lo em seus canais para divulgação da marca e dos produtos, podendo solicitar a interrupção dessa utilização a qualquer momento pelos canais de atendimento." },
    ],
  },
  {
    title: "Links e serviços de terceiros",
    blocks: [
      { t: "p", text: "O site poderá utilizar ou disponibilizar integrações com serviços de terceiros, incluindo plataformas de pagamento, transportadoras, redes sociais, ferramentas de atendimento e outras soluções necessárias ao funcionamento da operação." },
      { t: "p", text: "A utilização desses serviços poderá estar sujeita também aos respectivos termos e políticas das empresas responsáveis, sobre os quais a Almara não exerce controle." },
    ],
  },
  {
    title: "Proteção de dados pessoais",
    blocks: [
      { t: "p", text: "O tratamento de dados pessoais realizado pela Almara observa a legislação brasileira aplicável, especialmente a **Lei nº 13.709/2018 (LGPD)**." },
      { t: "p", text: "Informações sobre coleta, utilização, armazenamento, compartilhamento, direitos do titular e uso de cookies estão descritas na **Política de Privacidade e Cookies** da Almara." },
    ],
  },
  {
    title: "Responsabilidades",
    blocks: [
      { t: "p", text: "A Almara busca manter as informações e funcionalidades do site disponíveis, corretas e atualizadas." },
      { t: "p", text: "Poderão ocorrer indisponibilidades temporárias decorrentes de manutenção, problemas técnicos, falhas de terceiros ou situações fora de seu controle razoável, hipóteses em que a Almara envidará esforços para restabelecer o serviço com a maior brevidade possível." },
      { t: "strong", text: "Nenhuma disposição destes Termos deverá ser interpretada de forma a excluir, limitar ou dificultar o exercício de direitos garantidos ao consumidor pela legislação brasileira." },
    ],
  },
  {
    title: "Alterações destes termos",
    blocks: [
      { t: "p", text: "A Almara poderá atualizar estes Termos sempre que necessário para refletir alterações em seus serviços, produtos, tecnologias ou requisitos legais." },
      { t: "p", text: "A versão atualizada permanecerá disponível no site com a indicação da data da última atualização, e aplicar-se-á aos acessos e compras realizados a partir de sua publicação. Os pedidos já concluídos permanecem regidos pela versão vigente na data da compra." },
    ],
  },
  {
    title: "Legislação aplicável",
    blocks: [
      { t: "p", text: "Estes Termos são regidos pela legislação brasileira, especialmente pelo Código de Defesa do Consumidor (Lei nº 8.078/1990), pelo Decreto nº 7.962/2013 (Comércio Eletrônico), pelo Marco Civil da Internet (Lei nº 12.965/2014) e pela Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)." },
      { t: "p", text: "Ficam preservados todos os direitos do consumidor relativos ao foro competente previstos na legislação brasileira." },
    ],
  },
  {
    title: "Contato",
    blocks: [
      { t: "p", text: "Em caso de dúvidas sobre estes Termos ou sobre uma compra realizada na Almara:" },
      { t: "kv", k: "E-mail", v: "ola@almara.com.br" },
      { t: "kv", k: "WhatsApp", v: "(19) 99030-6995" },
      { t: "kv", k: "Horário de atendimento", v: "Segunda a sexta, das 8h às 18h" },
      { t: "kv", k: "Documentos relacionados", v: "Política de Trocas e Devoluções · Política de Privacidade e Cookies" },
    ],
  },
];

const INTRO = [
  "Bem-vindo(a) à Almara.",
  "Estes Termos de Uso regulam o acesso e a utilização do site da **Almara** e a compra dos produtos disponibilizados em nossa loja virtual.",
  "Ao acessar o site, navegar por suas páginas, criar uma conta ou realizar uma compra, você declara estar ciente destes Termos e concorda em respeitá-los, juntamente com os demais documentos indicados na seção 3.",
];

const RELATED = [
  { href: "/politica-de-trocas-e-devolucoes", label: "Política de Trocas e Devoluções" },
  { href: "/politica-de-privacidade", label: "Política de Privacidade e Cookies" },
  { href: "/suporte", label: "Suporte" },
];

export default function Page() {
  return (
    <LegalPage
      title={"Termos de Uso"}
      updated={"setembro de 2026"}
      intro={INTRO}
      sections={SECTIONS}
      related={RELATED}
    />
  );
}
