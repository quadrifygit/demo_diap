const listaVotacoesEl = document.getElementById("listaVotacoes");
const buscaVotacaoEl = document.getElementById("buscaVotacao");
const filtroCasaEl = document.getElementById("filtroCasa");
const filtroTemaEl = document.getElementById("filtroTema");
const filtroPosicaoEl = document.getElementById("filtroPosicao");
const filtroOrdenacaoEl = document.getElementById("filtroOrdenacao");
const resultadoInfoEl = document.getElementById("resultadoInfo");
const resumoVotacoesEl = document.getElementById("resumoVotacoes");
const resumoTemasEl = document.getElementById("resumoTemas");

let votacoesBase = [];

function limparSelect(selectEl, textoPadrao) {
  selectEl.innerHTML = "";
  const option = document.createElement("option");
  option.value = "";
  option.textContent = textoPadrao;
  selectEl.appendChild(option);
}

function formatarPercentual(valor) {
  return `${Number(valor || 0).toFixed(1)}%`;
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

function normalizarTexto(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function classificarTema(votacao) {
  const texto = normalizarTexto(votacao?.votacao || "");

  const regras = [
    {
      tema: "Meio ambiente",
      palavras: [
        "agrotoxico",
        "ambient",
        "climatic",
        "carbono",
        "amazonia",
        "grilagem",
        "indigena",
        "terras indigenas",
        "economia circular",
        "desastre",
        "desmonte ambiental"
      ]
    },
    {
      tema: "Economia e tributação",
      palavras: [
        "tributaria",
        "tributario",
        "fiscal",
        "cashback",
        "regime fiscal",
        "investimentos",
        "mercado",
        "tarifa",
        "agua e esgoto"
      ]
    },
    {
      tema: "Direitos sociais",
      palavras: [
        "cotas",
        "quilombolas",
        "criancas",
        "adolescentes",
        "eca",
        "social",
        "baixa renda",
        "inclusao social",
        "direitos"
      ]
    },
    {
      tema: "Trabalho e renda",
      palavras: [
        "trabalh",
        "emprego",
        "renda",
        "producao",
        "consumo",
        "transicao energetica",
        "paten"
      ]
    },
    {
      tema: "Democracia e instituições",
      palavras: [
        "fake news",
        "campanhas eleitorais",
        "blindagem parlamentar",
        "tecnologias digitais",
        "eleitoral",
        "parlamentar",
        "democracia"
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

function preencherFiltroCasa(votacoes) {
  limparSelect(filtroCasaEl, "Todas as casas");

  const casas = [...new Set(votacoes.map(v => v.casa).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  casas.forEach(casa => {
    const option = document.createElement("option");
    option.value = casa;
    option.textContent = casa;
    filtroCasaEl.appendChild(option);
  });
}

function preencherFiltroTema(votacoes) {
  limparSelect(filtroTemaEl, "Todos os temas");

  const temas = [...new Set(votacoes.map(v => v.tema).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  temas.forEach(tema => {
    const option = document.createElement("option");
    option.value = tema;
    option.textContent = tema;
    filtroTemaEl.appendChild(option);
  });
}

function criarResumo(votacoes) {
  const total = votacoes.length;
  const mediaAlinhamento =
    total > 0
      ? votacoes.reduce((acc, v) => acc + Number(v.percentual_alinhado || 0), 0) / total
      : 0;

  const totalCamara = votacoes.filter(v => v.casa === "Câmara dos Deputados").length;
  const totalSenado = votacoes.filter(v => v.casa === "Senado Federal").length;

  resumoVotacoesEl.innerHTML = `
    <div class="resumo-card">
      <span class="rotulo">Total de matérias</span>
      <span class="valor">${total}</span>
    </div>
    <div class="resumo-card">
      <span class="rotulo">Média de alinhamento</span>
      <span class="valor">${formatarPercentual(mediaAlinhamento)}</span>
    </div>
    <div class="resumo-card">
      <span class="rotulo">Matérias na Câmara</span>
      <span class="valor">${totalCamara}</span>
    </div>
    <div class="resumo-card">
      <span class="rotulo">Matérias no Senado</span>
      <span class="valor">${totalSenado}</span>
    </div>
  `;
}

function criarResumoTemas(votacoes) {
  const agregados = new Map();

  votacoes.forEach(v => {
    const tema = v.tema || "Outros temas";
    if (!agregados.has(tema)) {
      agregados.set(tema, {
        tema,
        total: 0,
        somaAlinhamento: 0
      });
    }

    const item = agregados.get(tema);
    item.total += 1;
    item.somaAlinhamento += Number(v.percentual_alinhado || 0);
  });

  const lista = [...agregados.values()]
    .map(item => ({
      ...item,
      mediaAlinhamento: item.total > 0 ? item.somaAlinhamento / item.total : 0
    }))
    .sort((a, b) => b.total - a.total);

  resumoTemasEl.innerHTML = lista
    .slice(0, 5)
    .map(item => `
      <div class="resumo-card destaque-laranja">
        <span class="rotulo">${item.tema}</span>
        <span class="valor">${item.total}</span>
        <span class="resumo-card-subtexto">média de alinhamento ${formatarPercentual(item.mediaAlinhamento)}</span>
      </div>
    `)
    .join("");
}

function criarCardVotacao(votacao) {
  const percentual = Number(votacao.percentual_alinhado || 0);

  return `
    <a href="votacao.html?id=${encodeURIComponent(String(votacao.id))}" class="card-link votacao-card-link">
      <article class="card votacao-card">
        <div class="votacao-card-topo">
          <span class="perfil-casa-tag">${votacao.casa || "Casa não informada"}</span>
          <span class="badge badge-${classePercentual(percentual)}">
            ${textoPercentual(percentual)}
          </span>
        </div>

        <h3 class="votacao-card-titulo">${votacao.votacao}</h3>

        <div class="votacao-meta-extra">
          <span class="tema-pill">${votacao.tema}</span>
        </div>

        <p class="impacto-pratico-card">
          <strong>Na prática:</strong> ${votacao.impacto_pratico}
        </p>

        <div class="votacao-card-grid">
          <div class="voto-info-item">
            <span class="rotulo">Posição de referência</span>
            <strong>${votacao.posicao_ods || "Não informado"}</strong>
          </div>
          <div class="voto-info-item">
            <span class="rotulo">Percentual alinhado</span>
            <strong>${formatarPercentual(percentual)}</strong>
          </div>
          <div class="voto-info-item">
            <span class="rotulo">Alinhados</span>
            <strong>${Number(votacao.alinhados || 0)}</strong>
          </div>
          <div class="voto-info-item">
            <span class="rotulo">Não alinhados</span>
            <strong>${Number(votacao.nao_alinhados || 0)}</strong>
          </div>
        </div>

        <div class="termometro-box votacao-termometro">
          <div class="termometro-trilho">
            <div class="termometro-preenchimento ${classePercentual(percentual)}" style="width: ${percentual}%;"></div>
          </div>
        </div>
      </article>
    </a>
  `;
}

function ordenarVotacoes(votacoes) {
  const criterio = filtroOrdenacaoEl.value;

  return [...votacoes].sort((a, b) => {
    if (criterio === "mais_alinhados") {
      return Number(b.percentual_alinhado || 0) - Number(a.percentual_alinhado || 0);
    }

    if (criterio === "menos_alinhados") {
      return Number(a.percentual_alinhado || 0) - Number(b.percentual_alinhado || 0);
    }

    if (criterio === "mais_divididos") {
      const distA = Math.abs(50 - Number(a.percentual_alinhado || 0));
      const distB = Math.abs(50 - Number(b.percentual_alinhado || 0));
      return distA - distB;
    }

    return (a.votacao || "").localeCompare((b.votacao || ""), "pt-BR");
  });
}

function aplicarFiltros() {
  const termo = buscaVotacaoEl.value.trim().toLowerCase();
  const casa = filtroCasaEl.value;
  const tema = filtroTemaEl.value;
  const posicao = filtroPosicaoEl.value;

  let filtradas = votacoesBase.filter(v => {
    const bateBusca = (v.votacao || "").toLowerCase().includes(termo);
    const bateCasa = !casa || v.casa === casa;
    const bateTema = !tema || v.tema === tema;
    const batePosicao = !posicao || v.posicao_ods === posicao;

    return bateBusca && bateCasa && bateTema && batePosicao;
  });

  filtradas = ordenarVotacoes(filtradas);

  resultadoInfoEl.textContent = `${filtradas.length} votação(ões) encontrada(s)`;

  if (filtradas.length === 0) {
    listaVotacoesEl.innerHTML = `
      <div class="card estado-vazio">
        <p>Nenhuma votação encontrada com esses filtros.</p>
      </div>
    `;
    return;
  }

  listaVotacoesEl.innerHTML = filtradas.map(criarCardVotacao).join("");
}

async function carregarVotacoes() {
  try {
    const [respVotacoes, respVotos] = await Promise.all([
      fetch("./data/votacoes.json"),
      fetch("./data/votos.json")
    ]);

    const votacoes = await respVotacoes.json();
    const votos = await respVotos.json();

    const votosPorVotacao = new Map();

    votos.forEach(v => {
      const chave = String(v.votacao_id);

      if (!votosPorVotacao.has(chave)) {
        votosPorVotacao.set(chave, {
          total: 0,
          alinhados: 0
        });
      }

      const item = votosPorVotacao.get(chave);
      item.total += 1;
      if (Number(v.pontuacao) === 1) item.alinhados += 1;
    });

    votacoesBase = votacoes.map(v => {
      const resumo = votosPorVotacao.get(String(v.id)) || { total: 0, alinhados: 0 };
      const naoAlinhados = resumo.total - resumo.alinhados;
      const percentualAlinhado = resumo.total > 0 ? (resumo.alinhados / resumo.total) * 100 : 0;
      const tema = classificarTema(v);
      const impacto = explicarImpactoPratico(v);

      return {
        ...v,
        tema,
        impacto_pratico: impacto,
        total: resumo.total,
        alinhados: resumo.alinhados,
        nao_alinhados: naoAlinhados,
        percentual_alinhado: percentualAlinhado
      };
    });

    preencherFiltroCasa(votacoesBase);
    preencherFiltroTema(votacoesBase);
    criarResumo(votacoesBase);
    criarResumoTemas(votacoesBase);
    aplicarFiltros();

    buscaVotacaoEl.addEventListener("input", aplicarFiltros);
    filtroCasaEl.addEventListener("change", aplicarFiltros);
    filtroTemaEl.addEventListener("change", aplicarFiltros);
    filtroPosicaoEl.addEventListener("change", aplicarFiltros);
    filtroOrdenacaoEl.addEventListener("change", aplicarFiltros);
  } catch (erro) {
    console.error("Erro ao carregar votações:", erro);
    resultadoInfoEl.textContent = "Erro ao carregar os dados.";
  }
}

carregarVotacoes();