const votacaoBox = document.getElementById("votacaoBox");
const guiaRapidoVotacaoEl = document.getElementById("guiaRapidoVotacao");
const listaParlamentaresVotacao = document.getElementById("listaParlamentaresVotacao");
const resumoListaParlamentares = document.getElementById("resumoListaParlamentares");
const buscaParlamentarEl = document.getElementById("buscaParlamentar");
const botoesFiltro = document.querySelectorAll(".btn-filtro");

let parlamentaresDaVotacao = [];
let filtroAtual = "todos";

function getIdDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function classePercentual(percentual) {
  if (percentual >= 70) return "alto";
  if (percentual >= 40) return "medio";
  return "baixo";
}

function textoPercentual(percentual) {
  if (percentual >= 70) return "Alinhamento alto";
  if (percentual >= 40) return "Alinhamento intermediário";
  return "Alinhamento baixo";
}

function formatarPercentual(valor) {
  return `${Number(valor || 0).toFixed(1)}%`;
}

function obterStatusRegistro(registro) {
  const alinhado = Number(registro.pontuacao) === 1;

  return {
    chave: alinhado ? "alinhado" : "nao_alinhado",
    titulo: alinhado ? "Alinhado" : "Não alinhado",
    classe: alinhado ? "status-alinhado" : "status-nao-alinhado"
  };
}

function normalizarTexto(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function identificarTipoDaMateria(titulo) {
  const texto = (titulo || "").trim().toUpperCase();

  if (texto.startsWith("PEC")) {
    return {
      titulo: "PEC",
      explicacao: "Proposta de Emenda à Constituição. Em termos simples, é uma proposta para mudar a Constituição, que é a regra mais importante do país."
    };
  }

  if (texto.startsWith("MP")) {
    return {
      titulo: "MP",
      explicacao: "Medida Provisória. Em termos simples, é uma norma editada pelo governo que já começa valendo, mas depois precisa ser confirmada pelo Congresso."
    };
  }

  if (texto.startsWith("PLP")) {
    return {
      titulo: "PLP",
      explicacao: "Projeto de Lei Complementar. Em termos simples, é um tipo de projeto usado em temas que exigem regras mais específicas previstas na Constituição."
    };
  }

  if (texto.startsWith("PL")) {
    return {
      titulo: "PL",
      explicacao: "Projeto de Lei. Em termos simples, é uma proposta para criar ou mudar uma lei comum."
    };
  }

  if (texto.startsWith("VETO")) {
    return {
      titulo: "Veto",
      explicacao: "Veto é quando o governo barra total ou parcialmente uma proposta aprovada pelo Congresso, e os parlamentares depois decidem se mantêm ou derrubam essa decisão."
    };
  }

  return {
    titulo: "Matéria legislativa",
    explicacao: "Trata-se de uma proposta ou decisão legislativa analisada pelo Congresso."
  };
}

function classificarTema(votacao) {
  const texto = normalizarTexto(votacao?.votacao || "");

  const regras = [
    {
      tema: "Meio ambiente",
      palavras: [
        "agrotoxico", "ambient", "climatic", "carbono", "amazonia", "grilagem",
        "indigena", "terras indigenas", "economia circular", "desastre", "desmonte ambiental"
      ]
    },
    {
      tema: "Economia e tributação",
      palavras: [
        "tributaria", "tributario", "fiscal", "cashback", "regime fiscal",
        "investimentos", "mercado", "tarifa", "agua e esgoto"
      ]
    },
    {
      tema: "Direitos sociais",
      palavras: [
        "cotas", "quilombolas", "criancas", "adolescentes", "eca", "social",
        "baixa renda", "inclusao social", "direitos"
      ]
    },
    {
      tema: "Trabalho e renda",
      palavras: [
        "trabalh", "emprego", "renda", "producao", "consumo", "transicao energetica", "paten"
      ]
    },
    {
      tema: "Democracia e instituições",
      palavras: [
        "fake news", "campanhas eleitorais", "blindagem parlamentar", "tecnologias digitais",
        "eleitoral", "parlamentar", "democracia"
      ]
    }
  ];

  for (const regra of regras) {
    if (regra.palavras.some(palavra => texto.includes(palavra))) {
      return regra.tema;
    }
  }

  return "Outros temas";
}

function explicarImpactoPratico(votacao) {
  const texto = normalizarTexto(votacao?.votacao || "");
  const tema = classificarTema(votacao);

  if (texto.includes("regime fiscal")) {
    return "Na prática, isso pode afetar a capacidade do governo de investir em políticas públicas e programas sociais.";
  }

  if (texto.includes("fake news")) {
    return "Na prática, isso pode influenciar as regras de proteção da eleição e da circulação de desinformação nas campanhas.";
  }

  if (texto.includes("reforma tributaria") || texto.includes("tributaria") || texto.includes("cashback")) {
    return "Na prática, isso pode mudar quem paga mais impostos, quem paga menos e como benefícios chegam à população.";
  }

  if (texto.includes("marco temporal") || texto.includes("terras indigenas")) {
    return "Na prática, isso pode afetar diretamente os direitos territoriais dos povos indígenas e conflitos sobre posse da terra.";
  }

  if (texto.includes("agrotoxico")) {
    return "Na prática, isso pode alterar o nível de controle sobre substâncias que afetam saúde, produção agrícola e meio ambiente.";
  }

  if (texto.includes("amazonia") || texto.includes("grilagem")) {
    return "Na prática, isso pode impactar o uso da terra, a proteção ambiental e a regularização de ocupações.";
  }

  if (texto.includes("carbono")) {
    return "Na prática, isso pode criar regras para atividades econômicas ligadas à redução de emissões e à agenda climática.";
  }

  if (texto.includes("tarifa social de agua e esgoto")) {
    return "Na prática, isso pode ampliar ou limitar o acesso da população de baixa renda a serviços básicos com custo reduzido.";
  }

  if (texto.includes("transicao energetica")) {
    return "Na prática, isso pode influenciar investimentos, empregos e incentivos ligados à mudança da matriz energética.";
  }

  if (texto.includes("desastres climaticos")) {
    return "Na prática, isso pode mudar a capacidade do poder público de prevenir e responder a enchentes, secas e eventos extremos.";
  }

  if (texto.includes("tecnologias digitais")) {
    return "Na prática, isso pode afetar regras de uso, proteção e responsabilidade no ambiente digital.";
  }

  if (texto.includes("cotas") || texto.includes("quilombolas")) {
    return "Na prática, isso pode ampliar ou reduzir políticas de inclusão no acesso a oportunidades públicas.";
  }

  if (texto.includes("eca ambiental")) {
    return "Na prática, isso pode fortalecer ou enfraquecer a proteção de crianças e adolescentes diante de riscos ambientais.";
  }

  if (tema === "Meio ambiente") {
    return "Na prática, isso pode afetar proteção ambiental, uso da terra e regras sobre clima e recursos naturais.";
  }

  if (tema === "Economia e tributação") {
    return "Na prática, isso pode mexer no bolso da população, nas contas públicas e no ambiente econômico.";
  }

  if (tema === "Direitos sociais") {
    return "Na prática, isso pode ampliar ou reduzir garantias de acesso a direitos e políticas de proteção social.";
  }

  if (tema === "Trabalho e renda") {
    return "Na prática, isso pode afetar emprego, renda e condições de desenvolvimento econômico.";
  }

  if (tema === "Democracia e instituições") {
    return "Na prática, isso pode mudar regras do funcionamento institucional e da vida democrática.";
  }

  return "Na prática, esta votação pode gerar efeitos concretos sobre regras públicas, prioridades do Estado e direitos da população.";
}

function montarGuiaRapido(votacao) {
  const tipo = identificarTipoDaMateria(votacao?.votacao || "");
  const tema = classificarTema(votacao);
  const impacto = explicarImpactoPratico(votacao);

  guiaRapidoVotacaoEl.innerHTML = `
    <section class="card guia-rapido-card">
      <div class="guia-rapido-topo">
        <div>
          <h2>Guia rápido</h2>
          <p class="secao-explicacao">
            Um resumo em linguagem simples para facilitar a leitura desta votação.
          </p>
        </div>
      </div>

      <div class="glossario-grid">
        <article class="glossario-item">
          <h3>${tipo.titulo}</h3>
          <p>${tipo.explicacao}</p>
        </article>

        <article class="glossario-item">
          <h3>Tema principal</h3>
          <p>${tema}</p>
        </article>

        <article class="glossario-item glossario-item-destaque">
          <h3>O que isso significa na prática?</h3>
          <p>${impacto}</p>
        </article>

        <article class="glossario-item">
          <h3>Abstenção e ausência</h3>
          <p><strong>Abstenção:</strong> o parlamentar participa, mas não vota nem “sim” nem “não”.</p>
          <p><strong>Ausência:</strong> o parlamentar não registra voto naquela decisão.</p>
        </article>
      </div>
    </section>
  `;
}

function montarResumoVotacao(votacao, registros) {
  const total = registros.length;
  const alinhados = registros.filter(r => Number(r.pontuacao) === 1).length;
  const naoAlinhados = total - alinhados;
  const percentual = total > 0 ? (alinhados / total) * 100 : 0;
  const tema = classificarTema(votacao);
  const impacto = explicarImpactoPratico(votacao);

  votacaoBox.innerHTML = `
    <section class="perfil-hero card perfil-${classePercentual(percentual)}">
      <div class="perfil-hero-topo">
        <div>
          <span class="perfil-casa-tag">${votacao.casa || "Casa não informada"}</span>
          <h2 class="perfil-nome votacao-nome">${votacao.votacao}</h2>
          <p class="perfil-meta">
            Posição de referência: <strong>${votacao.posicao_ods || "Não informado"}</strong>
          </p>
          <div class="votacao-meta-extra">
            <span class="tema-pill">${tema}</span>
          </div>
        </div>

        <div class="caixa-nota">
          <div class="caixa-nota-rotulo">Percentual alinhado</div>
          <div class="caixa-nota-valor">${formatarPercentual(percentual)}</div>
          <div class="caixa-nota-texto">${textoPercentual(percentual)}</div>
        </div>
      </div>

      <div class="impacto-pratico-box">
        <span class="impacto-rotulo">O que isso significa na prática?</span>
        <p>${impacto}</p>
      </div>

      <div class="termometro-box">
        <div class="termometro-legenda">
          <span>0%</span>
          <span>Escala de 0% a 100%</span>
          <span>100%</span>
        </div>
        <div class="termometro-trilho">
          <div class="termometro-preenchimento ${classePercentual(percentual)}" style="width: ${percentual}%;"></div>
        </div>
      </div>

      <div class="perfil-metricas">
        <div class="metrica">
          <span class="metrica-rotulo">Total de parlamentares avaliados</span>
          <strong class="metrica-valor">${total}</strong>
        </div>
        <div class="metrica">
          <span class="metrica-rotulo">Alinhados</span>
          <strong class="metrica-valor">${alinhados}</strong>
        </div>
        <div class="metrica">
          <span class="metrica-rotulo">Não alinhados</span>
          <strong class="metrica-valor">${naoAlinhados}</strong>
        </div>
      </div>
    </section>
  `;
}

function criarCardParlamentar(registro) {
  const status = obterStatusRegistro(registro);

  return `
    <a class="card card-link parlamentar-voto-card" href="parlamentar.html?id=${encodeURIComponent(String(registro.parlamentar_id))}">
      <div class="voto-card-topo">
        <span class="status-pill ${status.classe}">${status.titulo}</span>
        <span class="voto-casa">${registro.casa || "Casa não informada"}</span>
      </div>

      <h3 class="voto-titulo">${registro.parlamentar}</h3>

      <div class="parlamentar-voto-subinfo">
        <span><strong>Partido:</strong> ${registro.partido || "Não informado"}</span>
        <span><strong>UF:</strong> ${registro.uf || "Não informado"}</span>
      </div>

      <div class="voto-grid-info voto-grid-info-2">
        <div class="voto-info-item">
          <span class="rotulo">Voto registrado</span>
          <strong>${registro.voto || "Não informado"}</strong>
        </div>
        <div class="voto-info-item">
          <span class="rotulo">Posição de referência</span>
          <strong>${registro.posicao_ods || "Não informado"}</strong>
        </div>
      </div>
    </a>
  `;
}

function aplicarFiltros() {
  const termo = buscaParlamentarEl.value.trim().toLowerCase();

  const filtrados = parlamentaresDaVotacao
    .filter(registro => {
      const nome = (registro.parlamentar || "").toLowerCase();
      const partido = (registro.partido || "").toLowerCase();
      const uf = (registro.uf || "").toLowerCase();
      const status = obterStatusRegistro(registro).chave;

      const bateBusca =
        nome.includes(termo) ||
        partido.includes(termo) ||
        uf.includes(termo);

      const bateFiltro =
        filtroAtual === "todos" ||
        (filtroAtual === "alinhado" && status === "alinhado") ||
        (filtroAtual === "nao_alinhado" && status === "nao_alinhado");

      return bateBusca && bateFiltro;
    })
    .sort((a, b) => {
      const aPont = Number(a.pontuacao || 0);
      const bPont = Number(b.pontuacao || 0);

      if (aPont !== bPont) return aPont - bPont;
      return (a.parlamentar || "").localeCompare((b.parlamentar || ""), "pt-BR");
    });

  resumoListaParlamentares.textContent = `${filtrados.length} parlamentar(es) encontrado(s)`;

  if (filtrados.length === 0) {
    listaParlamentaresVotacao.innerHTML = `
      <div class="card estado-vazio">
        <p>Nenhum parlamentar encontrado com esse filtro.</p>
      </div>
    `;
    return;
  }

  listaParlamentaresVotacao.innerHTML = filtrados.map(criarCardParlamentar).join("");
}

function ativarEventosFiltro() {
  buscaParlamentarEl.addEventListener("input", aplicarFiltros);

  botoesFiltro.forEach(btn => {
    btn.addEventListener("click", () => {
      botoesFiltro.forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      filtroAtual = btn.dataset.filtro;
      aplicarFiltros();
    });
  });
}

async function carregarVotacao() {
  const id = getIdDaUrl();

  try {
    const [respVotacoes, respVotos, respParlamentares] = await Promise.all([
      fetch("./data/votacoes.json"),
      fetch("./data/votos.json"),
      fetch("./data/parlamentares.json")
    ]);

    const votacoes = await respVotacoes.json();
    const votos = await respVotos.json();
    const parlamentares = await respParlamentares.json();

    if (!id) {
      votacaoBox.innerHTML = `
        <div class="card estado-vazio">
          <p>ID da votação não foi informado na URL.</p>
          <p><a href="votacoes.html" class="link-acao">Voltar para votações</a></p>
        </div>
      `;
      return;
    }

    const votacao = votacoes.find(v => String(v.id) === String(id));

    if (!votacao) {
      votacaoBox.innerHTML = `
        <div class="card estado-vazio">
          <p>Votação não encontrada.</p>
          <p><a href="votacoes.html" class="link-acao">Voltar para votações</a></p>
        </div>
      `;
      return;
    }

    document.title = `${votacao.votacao} | Quem Foi Quem no Congresso`;

    const mapaParlamentares = new Map(
      parlamentares.map(p => [String(p.id), p])
    );

    parlamentaresDaVotacao = votos
      .filter(v => String(v.votacao_id) === String(id))
      .map(v => {
        const parlamentar = mapaParlamentares.get(String(v.parlamentar_id));

        return {
          ...v,
          parlamentar: parlamentar?.nome || v.parlamentar,
          partido: parlamentar?.partido || v.partido,
          uf: parlamentar?.uf || v.uf,
          casa: parlamentar?.casa || v.casa,
          posicao_ods: votacao?.posicao_ods || v.posicao_ods
        };
      });

    montarResumoVotacao(votacao, parlamentaresDaVotacao);
    montarGuiaRapido(votacao);
    aplicarFiltros();
    ativarEventosFiltro();
  } catch (erro) {
    console.error("Erro ao carregar votação:", erro);
    votacaoBox.innerHTML = `
      <div class="card estado-vazio">
        <p>Erro ao carregar a votação.</p>
      </div>
    `;
  }
}

carregarVotacao();