import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  alternates: { canonical: "/politica-de-trocas-e-devolucoes" },
  title: "Política de Trocas e Devoluções — Almara",
  description: "Prazos e procedimentos de troca, devolução, arrependimento, cancelamento e reembolso das compras na loja Almara.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "Resumo dos prazos",
    blocks: [
      {
        t: "table",
        head: ["Situação", "Prazo para o consumidor solicitar", "Quem paga o frete de devolução"],
        rows: [
          ["Arrependimento (compra online, sem justificativa)", "**7 dias corridos** do recebimento", "Almara"],
          ["Produto com vício ou defeito aparente", "**30 dias** do recebimento", "Almara"],
          ["Produto avariado no transporte", "Assim que identificado, dentro de 30 dias", "Almara"],
          ["Produto diferente do pedido ou item faltante", "Assim que identificado, dentro de 30 dias", "Almara"],
          ["Cancelamento antes do envio", "Antes do despacho do pedido", "Não aplicável"],
          ["Troca por preferência pessoal", "Após o prazo legal, não realizada", "—"],
        ],
      },
      { t: "p", text: "Prazos de resposta e de reembolso da Almara estão nas seções 9 e 10." },
    ],
  },
  {
    title: "Direito de arrependimento — compras online",
    blocks: [
      { t: "p", text: "Por se tratar de compra realizada fora do estabelecimento comercial, o consumidor pode desistir da compra no prazo de **7 (sete) dias corridos**, contado da data do recebimento do produto, nos termos do **artigo 49 do Código de Defesa do Consumidor**." },
      { t: "strong", text: "Não é necessário apresentar justificativa." },
      { t: "h3", text: "Como solicitar" },
      { t: "p", text: "Entre em contato pelo e-mail **ola@almara.com.br** ou pelo WhatsApp **(19) 99030-6995**, informando o número do pedido e os dados utilizados na compra. Em seguida, enviaremos as orientações e o código de postagem para a devolução." },
      { t: "h3", text: "Condições" },
      { t: "li", text: "**Os custos de devolução são integralmente suportados pela Almara.** O consumidor não arca com frete de retorno no exercício regular do direito de arrependimento." },
      { t: "li", text: "Pedimos, sempre que possível, que o produto seja devolvido em sua embalagem original. Por se tratar de alimento, produtos abertos não podem retornar ao estoque — ainda assim, isso não é condição para o exercício do direito nem motivo para recusa da restituição." },
      { t: "li", text: "O valor restituído corresponde ao total efetivamente pago pelo consumidor, **incluindo o frete da compra original**." },
    ],
  },
  {
    title: "Produto com vício, defeito ou irregularidade",
    blocks: [
      { t: "p", text: "Se o seu pedido chegar com algum problema, entre em contato assim que identificar a situação." },
      { t: "p", text: "Por se tratar de produto **não durável**, o prazo para reclamar de vício aparente ou de fácil constatação é de **30 (trinta) dias**, conforme o **artigo 26, inciso I, do Código de Defesa do Consumidor**. Em caso de vício oculto, o prazo começa a contar a partir do momento em que o defeito ficar evidenciado." },
      { t: "h3", text: "Situações que devem ser comunicadas" },
      { t: "li", text: "embalagem danificada ou avariada durante o transporte" },
      { t: "li", text: "embalagem com sinais de violação" },
      { t: "li", text: "produto deteriorado ou impróprio para consumo" },
      { t: "li", text: "produto com prazo de validade vencido" },
      { t: "li", text: "produto diferente daquele adquirido" },
      { t: "li", text: "quantidade recebida diferente da comprada" },
      { t: "li", text: "ausência de algum item do pedido; ou" },
      { t: "li", text: "qualquer outro defeito ou irregularidade relacionada ao produto." },
      { t: "h3", text: "O que informar" },
      { t: "li", text: "número do pedido" },
      { t: "li", text: "nome do comprador" },
      { t: "li", text: "descrição do ocorrido; e" },
      { t: "li", text: "fotos do produto e da embalagem, quando disponíveis." },
      { t: "p", text: "As imagens ajudam a agilizar o atendimento, mas **não são condição para o exercício dos direitos assegurados pela legislação**." },
      { t: "h3", text: "Como resolvemos" },
      { t: "p", text: "Após a análise, adotaremos a solução adequada, que poderá incluir a substituição do produto ou a restituição do valor pago." },
      { t: "p", text: "Caso o vício não seja sanado no prazo de **30 (trinta) dias**, o consumidor poderá optar, à sua escolha, pela substituição do produto, pela restituição imediata do valor pago com correção monetária ou pelo abatimento proporcional do preço, conforme o **artigo 18, §1º, do Código de Defesa do Consumidor**." },
      { t: "p", text: "**Todos os custos de devolução e reenvio são de responsabilidade da Almara** nas hipóteses desta seção." },
    ],
  },
  {
    title: "Produto diferente do pedido ou item faltante",
    blocks: [
      { t: "p", text: "Caso você receba um produto diferente do adquirido, em quantidade divergente ou com item faltante, entre em contato pelos canais de atendimento." },
      { t: "p", text: "Após a confirmação, providenciaremos a regularização do pedido **sem qualquer custo adicional para o consumidor** — seja pelo envio do produto correto, pelo complemento do item faltante ou pela restituição do valor, conforme sua preferência." },
      { t: "p", text: "Recomendamos não consumir o produto recebido incorretamente antes do contato conosco, para que possamos avaliar a melhor solução." },
    ],
  },
  {
    title: "Pedido danificado durante o transporte",
    blocks: [
      { t: "p", text: "Caso perceba danos evidentes na embalagem no momento da entrega, recomendamos, sempre que possível, recusar o recebimento ou registrar a situação com fotos e comunicar a transportadora." },
      { t: "p", text: "Se o problema for percebido somente após o recebimento, entre em contato com nosso atendimento enviando as informações e imagens disponíveis." },
      { t: "p", text: "Em ambos os casos, a solução será providenciada pela Almara sem custo para o consumidor. A responsabilidade pelo transporte perante o consumidor é da Almara, independentemente de eventual apuração junto à transportadora." },
    ],
  },
  {
    title: "Cancelamento antes do envio",
    blocks: [
      { t: "p", text: "Caso deseje cancelar um pedido que ainda não tenha sido enviado, entre em contato o mais rapidamente possível." },
      { t: "p", text: "Se o cancelamento operacional ainda for possível, providenciaremos o cancelamento e o respectivo reembolso integral." },
      { t: "p", text: "Caso o pedido já tenha sido despachado, serão fornecidas as orientações aplicáveis à devolução, respeitando-se o direito de arrependimento e os demais direitos previstos em lei." },
    ],
  },
  {
    title: "Trocas por preferência pessoal",
    blocks: [
      { t: "p", text: "Fora das hipóteses previstas em lei, a Almara **não realiza trocas por preferência pessoal** — como escolha de outro sabor, aroma ou variedade — após o encerramento do prazo legal de arrependimento." },
      { t: "p", text: "Essa regra **não limita** os direitos do consumidor relacionados a produtos com vício, defeito, avaria, divergência em relação ao pedido ou qualquer outra situação protegida pela legislação." },
    ],
  },
  {
    title: "Produtos alimentícios: conservação",
    blocks: [
      { t: "p", text: "Por se tratar de produtos destinados ao consumo, recomendamos que os chás sejam armazenados e utilizados conforme as instruções presentes na embalagem — em local seco, arejado, ao abrigo da luz e do calor, com a embalagem devidamente fechada após a abertura." },
      { t: "p", text: "Problemas decorrentes de armazenamento inadequado, utilização em desacordo com as orientações fornecidas ou situações ocorridas após a entrega e não relacionadas à qualidade original do produto serão avaliados individualmente." },
      { t: "p", text: "Essa disposição **não afasta** a responsabilidade da Almara por vícios ou defeitos existentes no produto no momento do fornecimento." },
    ],
  },
  {
    title: "Reembolsos",
    blocks: [
      { t: "p", text: "Quando houver direito ao reembolso, a restituição será realizada pela **mesma forma de pagamento utilizada na compra**." },
      {
        t: "table",
        head: ["Forma de pagamento", "Prazo para processamento pela Almara", "Observação"],
        rows: [
          ["Cartão de crédito", "Até 5 dias úteis após o recebimento do produto ou a confirmação do cancelamento", "O estorno aparece na fatura conforme os prazos da administradora do cartão, podendo ocorrer na fatura seguinte"],
          ["Pix", "Até 5 dias úteis", "Depósito na conta informada pelo consumidor"],
          ["Boleto", "Até 5 dias úteis", "Depósito na conta informada pelo consumidor"],
        ],
      },
      { t: "p", text: "Nos casos de cancelamento antes do envio e de exercício do direito de arrependimento, a restituição abrange o **valor integral pago, incluindo o frete**." },
    ],
  },
  {
    title: "Prazos de atendimento da Almara",
    blocks: [
      { t: "p", text: "Para dar previsibilidade ao consumidor, assumimos os seguintes prazos:" },
      { t: "li", text: "**Confirmação de recebimento da solicitação:** até 1 dia útil" },
      { t: "li", text: "**Retorno com a análise e as orientações:** até 3 dias úteis" },
      { t: "li", text: "**Envio do código de postagem para devolução:** até 2 dias úteis após a confirmação" },
      { t: "li", text: "**Processamento do reembolso ou envio do produto substituto:** até 5 dias úteis após o recebimento do produto devolvido." },
      { t: "p", text: "Esses prazos são compromissos de atendimento da Almara e não substituem nem reduzem os prazos legais previstos no Código de Defesa do Consumidor." },
    ],
  },
  {
    title: "Como solicitar — passo a passo",
    blocks: [
      { t: "p", text: "1. Entre em contato pelo e-mail **ola@almara.com.br** ou pelo WhatsApp **(19) 99030-6995**." },
      { t: "p", text: "2. Informe o número do pedido, o nome do comprador e a descrição da situação." },
      { t: "p", text: "3. Envie fotos do produto e da embalagem, quando aplicável." },
      { t: "p", text: "4. Aguarde nosso retorno com a análise e as orientações." },
      { t: "p", text: "5. Realize a postagem com o código enviado pela Almara, quando for o caso." },
      { t: "p", text: "6. Acompanhe a confirmação do recebimento e o processamento da solução escolhida." },
      { t: "strong", text: "Canais de atendimento" },
      { t: "kv", k: "E-mail", v: "ola@almara.com.br" },
      { t: "kv", k: "WhatsApp", v: "(19) 99030-6995" },
      { t: "kv", k: "Horário de atendimento", v: "Segunda a sexta, das 8h às 18h" },
    ],
  },
  {
    title: "Disposições finais",
    blocks: [
      { t: "p", text: "Esta Política **não limita nem exclui** quaisquer direitos assegurados ao consumidor pela legislação brasileira." },
      { t: "p", text: "Caso exista conflito entre alguma disposição desta Política e uma norma legal aplicável, prevalecerá a legislação vigente." },
      { t: "p", text: "A Almara poderá atualizar esta Política para adequá-la a alterações legais, operacionais ou relacionadas aos serviços oferecidos. A versão vigente na data da compra é a aplicável ao respectivo pedido." },
      { t: "kv", k: "Documentos relacionados", v: "Termos de Uso · Política de Privacidade e Cookies" },
    ],
  },
];

const INTRO = [
  "Na Almara, queremos que sua experiência seja positiva desde a escolha do seu chá até o momento em que ele chega à sua casa.",
  "Esta Política estabelece as condições aplicáveis às compras realizadas em nossa loja virtual, em conformidade com o **Código de Defesa do Consumidor (Lei nº 8.078/1990)** e com o **Decreto nº 7.962/2013**.",
  "Esta Política integra os **Termos de Uso** da Almara e deve ser lida em conjunto com eles e com a **Política de Privacidade e Cookies**. Ela se aplica exclusivamente às compras de produtos físicos realizadas no site; o uso do aplicativo Almara+ é regido por termos próprios, disponíveis no próprio aplicativo.",
];

const RELATED = [
  { href: "/termos-de-uso", label: "Termos de Uso" },
  { href: "/politica-de-privacidade", label: "Política de Privacidade e Cookies" },
  { href: "/suporte", label: "Suporte" },
];

export default function Page() {
  return (
    <LegalPage
      title={"Política de Trocas e Devoluções"}
      updated={"setembro de 2026"}
      intro={INTRO}
      sections={SECTIONS}
      related={RELATED}
    />
  );
}
