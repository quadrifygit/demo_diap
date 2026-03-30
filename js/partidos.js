const listaPartidosEl = document.getElementById("listaPartidos");
const buscaPartidoEl = document.getElementById("buscaPartido");
const filtroOrdenacaoPartidosEl = document.getElementById("filtroOrdenacaoPartidos");
const resultadoInfoPartidosEl = document.getElementById("resultadoInfoPartidos");
const resumoPartidosEl = document.getElementById("resumoPartidos");

let partidosBase = [];

function formatarPercentual(valor) {
  return `${Number(valor || 0).toFixed(1)}%`;
}

function classePercentual(percentual) {
  if (percentual >= 70) return "alto";
  if (percentual >= 40) return "medio";
  return "baixo";
}

function textoPercentual(percentual) {
  if (percentual >= 70) return "Apoio alto";
  if (percentual >= 40) return "Apoio intermediário";
  return "Apoio baixo";
}

function calcularPartidos(parlamentares, votos, votacoes) {
  const mapaVotacoes = new Map(votacoes.map(v => [String(v.id), v]));
  const mapaParlamentares = new Map(parlamentares.map(p => [String(p.id), p]));
  const mapaPartidos = new Map();

  parlamentares.forEach(parlamentar => {
    const sigla = (parlamentar.partido || "").trim();
    if (!sigla) return;

    if (!mapaPartidos.has(sigla)) {
      mapaPartidos.set(sigla, {
        sigla,
        parlamentares: [],
        votosPorVotacao: new Map()
      });
    }

    mapaPartidos.get(sigla).parlamentares.push(parlamentar);
  });

  votos.forEach(voto => {
    const sigla = (voto.partido || "").trim();
    if (!sigla) return;

    if (!mapaPartidos.has(sigla)) {
      mapaPartidos.set(sigla, {
        sigla,
        parlamentares: [],
        votosPorVotacao: new Map()
      });
    }

    const partido = mapaPartidos.get(sigla);
    const votacaoId = String(voto.votacao_id);
    const votacaoInfo = mapaVotacoes.get(votacaoId);

    if (!partido.votosPorVotacao.has(votacaoId)) {
      partido.votosPorVotacao.set(votacaoId, {
        id: votacaoId,
        votacao: votacaoInfo?.votacao || voto.votacao || "Votação não informada",
        casa: votacaoInfo?.casa || voto.casa || "Casa não informada",
        posicao_ods: votacaoInfo?.posicao_ods || voto.posicao_ods || "Não informado",
        total: 0,
        alinhados: 0,
        nao_alinhados: 0
      });
    }

    const registro = partido.votosPorVotacao.get(votacaoId);
    registro.total += 1;

    if (Number(voto.pontuacao) === 1) {
      registro.alinhados += 1;
    } else {
      registro.nao_alinhados += 1;
    }
  });

  const partidos = [...mapaPartidos.values()].map(partido => {
    const votacoesCalculadas = [...partido.votosPorVotacao.values()].map(v => ({
      ...v,
      percentual_apoio: v.total > 0 ? (v.alinhados / v.total) * 100 : 0
    }));

    const mediaApoio =
      votacoesCalculadas.length > 0
        ? votacoesCalculadas.reduce((acc, v) => acc + v.percentual_apoio, 0) / votacoesCalculadas.length
        : 0;

    const mediaNotaParlamentares =
      partido.parlamentares.length > 0
        ? partido.parlamentares.reduce((acc, p) => acc + Number(p.nota || 0), 0) / partido.parlamentares.length
        : 0;

    return {
      sigla: partido.sigla,
      media_apoio: mediaApoio,
      media_nota_parlamentares: mediaNotaParlamentares,
      total_parlamentares: partido.parlamentares.length,
      total_votacoes: votacoesCalculadas.length,
      votacoes: votacoesCalculadas
    };
  });

  return partidos.sort((a, b) => {
    if (b.media_apoio !== a.media_apoio) return b.media_apoio - a.media_apoio;
    return a.sigla.localeCompare(b.sigla, "pt-BR");
  });
}

function preencherResumoPartidos() {
  const total = partidosBase.length;

  const mediaGeral =
    total > 0
      ? partidosBase.reduce((acc, p) => acc + Number(p.media_apoio || 0), 0) / total
      : 0;

  const melhor = total > 0 ? partidosBase[0] : null;
  const pior = total > 0 ? [...partidosBase].sort((a, b) => a.media_apoio - b.media_apoio)[0] : null;

  resumoPartidosEl.innerHTML = `
    <div class="resumo-card destaque-laranja">
      <span class="rotulo">Total de partidos</span>
      <span class="valor">${total}</span>
    </div>

    <div class="resumo-card">
      <span class="rotulo">Média geral dos partidos</span>
      <span class="valor">${formatarPercentual(mediaGeral)}</span>
    </div>

    <div class="resumo-card">
      <span class="rotulo">Maior apoio</span>
      <span class="valor">${melhor ? melhor.sigla : "-"}</span>
    </div>

    <div class="resumo-card">
      <span class="rotulo">Menor apoio</span>
      <span class="valor">${pior ? pior.sigla : "-"}</span>
    </div>
  `;
}

function criarCardPartido(partido) {
  const percentual = Number(partido.media_apoio || 0);
  const siglaSegura = encodeURIComponent(partido.sigla);

  return `
    <a class="card card-link votacao-card-link" href="partido.html?id=${siglaSegura}">
      <article class="votacao-card partido-card">
        <div class="votacao-card-topo">
          <span class="perfil-casa-tag">Partido</span>
          <span class="badge badge-${classePercentual(percentual)}">${textoPercentual(percentual)}</span>
        </div>

        <h3 class="votacao-card-titulo partido-sigla-card">${partido.sigla}</h3>

        <div class="votacao-card-grid">
          <div class="voto-info-item">
            <span class="rotulo">Apoio médio aos trabalhadores</span>
            <strong>${formatarPercentual(percentual)}</strong>
          </div>
          <div class="voto-info-item">
            <span class="rotulo">Parlamentares na base</span>
            <strong>${partido.total_parlamentares}</strong>
          </div>
          <div class="voto-info-item">
            <span class="rotulo">Votações consideradas</span>
            <strong>${partido.total_votacoes}</strong>
          </div>
          <div class="voto-info-item">
            <span class="rotulo">Média de nota individual</span>
            <strong>${Number(partido.media_nota_parlamentares || 0).toFixed(2)}</strong>
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

function ordenarPartidos(lista, criterio) {
  const copia = [...lista];

  if (criterio === "apoio_asc") {
    return copia.sort((a, b) => a.media_apoio - b.media_apoio);
  }

  if (criterio === "nome") {
    return copia.sort((a, b) => a.sigla.localeCompare(b.sigla, "pt-BR"));
  }

  if (criterio === "parlamentares_desc") {
    return copia.sort((a, b) => {
      if (b.total_parlamentares !== a.total_parlamentares) {
        return b.total_parlamentares - a.total_parlamentares;
      }
      return b.media_apoio - a.media_apoio;
    });
  }

  return copia.sort((a, b) => b.media_apoio - a.media_apoio);
}

function renderizarListaPartidos() {
  const termo = buscaPartidoEl.value.trim().toLowerCase();
  const criterio = filtroOrdenacaoPartidosEl.value;

  let filtrados = partidosBase.filter(partido =>
    (partido.sigla || "").toLowerCase().includes(termo)
  );

  filtrados = ordenarPartidos(filtrados, criterio);

  resultadoInfoPartidosEl.textContent = `${filtrados.length} partido(s) encontrado(s)`;

  if (filtrados.length === 0) {
    listaPartidosEl.innerHTML = `
      <div class="card estado-vazio">
        <p>Nenhum partido encontrado com esse filtro.</p>
      </div>
    `;
    return;
  }

  listaPartidosEl.innerHTML = filtrados.map(criarCardPartido).join("");
}

async function carregarPartidos() {
  try {
    const [respParlamentares, respVotos, respVotacoes] = await Promise.all([
      fetch("./data/parlamentares.json"),
      fetch("./data/votos.json"),
      fetch("./data/votacoes.json")
    ]);

    const parlamentares = await respParlamentares.json();
    const votos = await respVotos.json();
    const votacoes = await respVotacoes.json();

    partidosBase = calcularPartidos(parlamentares, votos, votacoes);
    preencherResumoPartidos();
    renderizarListaPartidos();

    buscaPartidoEl.addEventListener("input", renderizarListaPartidos);
    filtroOrdenacaoPartidosEl.addEventListener("change", renderizarListaPartidos);
  } catch (erro) {
    console.error("Erro ao carregar partidos:", erro);
    resultadoInfoPartidosEl.textContent = "Erro ao carregar os dados de partidos.";
  }
}

carregarPartidos();