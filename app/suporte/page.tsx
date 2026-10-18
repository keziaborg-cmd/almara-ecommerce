import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  alternates: { canonical: "/suporte" },
  title: "Suporte — Almara",
  description:
    "Canais de atendimento da Almara e respostas para os assuntos mais comuns: pedidos, assinatura do Almara+, exclusão de conta e tratamento de dados.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "Canais",
    blocks: [
      { t: "kv", k: "E-mail", v: "ola@almara.com.br" },
      { t: "kv", k: "WhatsApp", v: "(19) 99030-6995" },
      { t: "kv", k: "Atendimento", v: "Segunda a sexta, das 8h às 18h" },
      { t: "p", text: "Respondemos em até 1 dia útil." },
    ],
  },
  {
    title: "Para agilizar",
    blocks: [
      {
        t: "p",
        text: "Se for sobre um pedido, tenha em mãos o número dele e o nome usado na compra. Se for sobre o aplicativo, informe o e-mail cadastrado na sua conta e o modelo do aparelho.",
      },
    ],
  },
  {
    title: "Assuntos comuns",
    blocks: [
      { t: "h3", text: "Meu pedido não chegou ou chegou com problema" },
      {
        t: "p",
        text: "Veja os prazos e o passo a passo na [Política de Trocas e Devoluções](/politica-de-trocas-e-devolucoes), ou fale com a gente pelos canais acima.",
      },
      { t: "h3", text: "Quero cancelar minha assinatura do Almara+" },
      {
        t: "p",
        text: "A assinatura é gerenciada pela loja de aplicativos. No iPhone, em Ajustes → seu nome → Assinaturas. No Android, na Google Play Store → Pagamentos e assinaturas. O cancelamento vale a partir do fim do período já pago.",
      },
      { t: "h3", text: "Quero excluir minha conta" },
      {
        t: "p",
        text: "Você pode fazer isso dentro do aplicativo, em Perfil, ou pela [página de exclusão de conta](/excluir-conta).",
      },
      { t: "h3", text: "Quero saber como meus dados são tratados" },
      {
        t: "p",
        text: "Está tudo na [Política de Privacidade e Cookies](/politica-de-privacidade). Para pedidos relacionados à LGPD, escreva para kezia.borges@almara.com.br.",
      },
    ],
  },
];

const RELATED = [
  { href: "/termos-de-uso", label: "Termos de Uso" },
  { href: "/politica-de-privacidade", label: "Política de Privacidade e Cookies" },
  { href: "/politica-de-trocas-e-devolucoes", label: "Política de Trocas e Devoluções" },
];

export default function Page() {
  return (
    <LegalPage
      eyebrow="Atendimento"
      title="Suporte Almara"
      intro={["Precisa de ajuda com um pedido, com a sua conta ou com o Almara+? Fala com a gente."]}
      sections={SECTIONS}
      related={RELATED}
    />
  );
}
