import type { Metadata } from "next";
import type { Agent } from "@/app/lib/types/database";
import Image from "next/image";
import { getAgentsForTeam } from "@/app/lib/supabase/agents";

const roleMaps: Record<string, Record<string, string>> = {
  male: {
    broker: "Corretor de Imóveis",
    dev: "Programador",
    owner: "Sócio",
    captor: "Captador",
    admin: "Administrativo",
  },
  female: {
    broker: "Corretora de Imóveis",
    dev: "Programadora",
    owner: "Sócia",
    captor: "Captadora",
    admin: "Administrativa",
  },
};

function getGender(agent: Agent): "male" | "female" {
  if (agent.gender === "male" || agent.gender === "female") return agent.gender;
  // Infer from name ending in 'a' (heuristic)
  return agent.name.trim().toLowerCase().endsWith("a") ? "female" : "male";
}

function formatRoles(agent: Agent): string {
  const roles = agent.roles;
  if (!roles || roles.length === 0) return "";

  const gender = getGender(agent);
  const map = roleMaps[gender];

  // Sort roles: put 'broker' last, others alphabetical or keep order
  // We want 'broker' to supply the 'last' position if present.
  const sortedRoles = [...roles].sort((a, b) => {
    if (a === "broker") return 1;
    if (b === "broker") return -1;
    return 0;
  });

  const translatedRoles = sortedRoles.map((r) => map[r] || r);

  if (translatedRoles.length === 1) return translatedRoles[0];

  const lastRole = translatedRoles.pop();
  return `${translatedRoles.join(", ")} e ${lastRole}`;
}

export const metadata: Metadata = {
  title: "Sobre Nós - Renata Imóveis",
  description: "Conheça a história e os valores da Renata Imóveis, sua imobiliária de confiança.",
};

export default async function Sobre() {
  const agents = await getAgentsForTeam();

  /*
    Sorting Logic:
    1. Owners ("owner" in roles) come first.
    2. Then sort by number of roles (descending).
    3. Then alphabetical by name (optional, but good for consistency).
  */
  const sortedAgents = [...agents].sort((a, b) => {
    const aIsOwner = a.roles?.includes("owner");
    const bIsOwner = b.roles?.includes("owner");

    // 1. Owners first
    if (aIsOwner && !bIsOwner) return -1;
    if (!aIsOwner && bIsOwner) return 1;

    // 2. Number of roles (descending)
    const aRolesCount = a.roles?.length || 0;
    const bRolesCount = b.roles?.length || 0;
    if (aRolesCount !== bRolesCount) {
      return bRolesCount - aRolesCount;
    }

    // 3. Alphabetical fallback
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="text-[#1e1e1e] pt-16 pb-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sobre a Renata Imóveis</h1>
          <p className="text-xl text-[#4f4f4f] max-w-2xl">
            Sua imobiliária de confiança com anos de experiência no mercado
            imobiliário.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#1e1e1e]">
              Nossa História
            </h2>

            <p className="text-[#4f4f4f] mb-4 leading-relaxed">
              A Renata Imóveis nasceu em 2007 com a missão de transformar o sonho de
              encontrar o imóvel perfeito em realidade. Com anos de experiência
              no mercado imobiliário do Rio de Janeiro, construímos uma
              reputação sólida baseada em transparência, honestidade e
              comprometimento com nossos clientes.
            </p>
            <p className="text-[#4f4f4f] mb-4 leading-relaxed">
              Nossa equipe é formada por profissionais altamente qualificados e
              dedicados, que entendem que cada cliente tem necessidades únicas.
              Por isso, oferecemos um atendimento personalizado e humanizado,
              sempre priorizando a satisfação e o bem-estar de quem confia em
              nossos serviços.
            </p>
            <p className="text-[#4f4f4f] leading-relaxed">
              Trabalhamos com os melhores imóveis da cidade, desde apartamentos
              modernos até casas de alto padrão, sempre com rigor na seleção e
              qualidade garantida.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-gradient-to-br from-[#960000] to-[#b30000] h-64 rounded-lg flex items-center justify-center">
              <span className="text-white text-6xl opacity-50">🏢</span>
            </div>
          </div>
        </div>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#1e1e1e]">
            Nossos Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="">
              <h3 className="text-xl font-semibold mb-3 text-[#1e1e1e]">
                Transparência
              </h3>
              <p className="text-[#4f4f4f]">
                Agimos com total transparência em todas as negociações,
                garantindo clareza e confiança.
              </p>
            </div>
            <div className="">

              <h3 className="text-xl font-semibold mb-3 text-[#1e1e1e]">
                Excelência
              </h3>
              <p className="text-[#4f4f4f]">
                Buscamos sempre a excelência em nossos serviços e na seleção
                dos imóveis.
              </p>
            </div>
            <div className="">
              <h3 className="text-xl font-semibold mb-3 text-[#1e1e1e]">
                Comprometimento
              </h3>
              <p className="text-[#4f4f4f]">
                Estamos comprometidos em realizar o sonho de cada cliente com
                dedicação e cuidado.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="flex justify-between bg-white rounded-2xl py-8 px-18 mb-16 border border-gray-outline">
          {/* Imóveis Vendidos, Clientes Satisfeitos, Anos de Experiência, Bairros Atendidos */}
          <div className="flex flex-col items-center">
            <p className="text-3xl font-bold">500+</p>
            <p>Imóveis vendidos</p>
          </div>
          <div className="w-1 h-12 bg-gray-outline" />
          <div className="flex flex-col items-center">
            <p className="text-3xl font-bold">500+</p>
            <p>Clientes Satisfeitos</p>
          </div>
          <div className="w-1 h-12 bg-gray-outline" />
          <div className="flex flex-col items-center">
            <p className="text-3xl font-bold">15+</p>
            <p>Anos de Experiência</p>
          </div>
          <div className="w-1 h-12 bg-gray-outline" />
          <div className="flex flex-col items-center">
            <p className="text-3xl font-bold">50+</p>
            <p>Bairros Atendidos</p>
          </div>
        </div>

        {/* Team */}
        <section>
          <h2 className="text-3xl font-bold mb-12 text-[#1e1e1e]">
            Nossa Equipe
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedAgents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={agent.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(agent.name) + "&background=random"}
                    alt={agent.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-[#1e1e1e]">{agent.name}</h3>
                  <p className="text-[#4f4f4f] text-sm">{formatRoles(agent)}</p>
                  {agent.creci && (
                    <p className="text-xs text-gray-500 mt-1">CRECI: {agent.creci}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

