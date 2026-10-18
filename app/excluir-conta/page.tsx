import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { FormularioExclusao } from "@/components/legal/FormularioExclusao";

export const metadata: Metadata = {
  alternates: { canonical: "/excluir-conta" },
  title: "Excluir sua conta Almara+",
  description:
    "Como excluir sua conta Almara+ e os dados associados a ela, pelo aplicativo ou por esta página, sem precisar fazer login.",
  // a página é exigida pelo Google Play e precisa abrir para qualquer pessoa
  robots: { index: true, follow: true },
};

const SECTIONS: LegalSection[] = [
  {
    title: "O que é excluído",
    blocks: [
      { t: "li", text: "Dados da sua conta: nome, e-mail e endereço" },
      { t: "li", text: "Todo o conteúdo do diário e os registros de humor" },
      { t: "li", text: "As conversas com a Mara" },
      { t: "li", text: "O progresso das jornadas, o jardim, hábitos e tarefas" },
      { t: "li", text: "Preferências e configurações" },
      { t: "p", text: "Isso é apagado por completo e não pode ser recuperado." },
    ],
  },
  {
    title: "O que é mantido",
    blocks: [
      {
        t: "p",
        text: "Informações de pedidos de produtos já realizados são mantidas **de forma anonimizada**, sem vínculo com você, pelo prazo exigido pela legislação fiscal. Isso está previsto no artigo 18, VI, da LGPD, que ressalva a conservação de dados para cumprimento de obrigação legal.",
      },
      { t: "p", text: "Nenhum desses registros permite identificar você depois da exclusão." },
    ],
  },
  {
    title: "Sobre a assinatura",
    blocks: [
      {
        t: "strong",
        text: "Excluir a conta não cancela automaticamente a assinatura do Almara+, porque ela é gerenciada pela loja de aplicativos. Cancele antes, ou logo em seguida:",
      },
      { t: "li", text: "**iPhone:** Ajustes → seu nome → Assinaturas" },
      { t: "li", text: "**Android:** Google Play Store → Pagamentos e assinaturas" },
    ],
  },
  {
    title: "Dúvidas",
    blocks: [
      { t: "kv", k: "E-mail", v: "ola@almara.com.br" },
      { t: "kv", k: "WhatsApp", v: "(19) 99030-6995" },
    ],
  },
];

const RELATED = [
  { href: "/politica-de-privacidade", label: "Política de Privacidade e Cookies" },
  { href: "/suporte", label: "Suporte" },
];

export default function Page() {
  return (
    <LegalPage
      eyebrow="Sua conta"
      title="Excluir sua conta Almara+"
      intro={["Você pode excluir sua conta e seus dados a qualquer momento, sem precisar falar com ninguém."]}
      sections={SECTIONS}
      related={RELATED}
    >
      <section className="mt-8">
        <h2 className="font-display text-2xl text-verde-escuro">Pelo aplicativo</h2>
        <p className="mt-3 leading-relaxed text-tinta/80">
          Abra o Almara+, vá em <strong className="font-medium text-verde-escuro">Perfil → Excluir conta</strong> e
          confirme. A exclusão acontece na hora.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl text-verde-escuro">Por esta página</h2>
        <p className="mt-3 leading-relaxed text-tinta/80">
          Se você não tem mais o aplicativo instalado, preencha o formulário abaixo com o e-mail cadastrado na sua
          conta. Enviaremos uma confirmação para esse endereço antes de excluir qualquer coisa — é assim que
          garantimos que só o titular consegue pedir a exclusão.
        </p>

        <FormularioExclusao />

        <p className="mt-4 leading-relaxed text-tinta/80">
          <strong className="font-medium text-verde-escuro">Prazo:</strong> confirmamos o recebimento em até 1 dia
          útil e concluímos a exclusão em até 7 dias corridos após a confirmação por e-mail.
        </p>
      </section>
    </LegalPage>
  );
}
