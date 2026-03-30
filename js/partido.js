const partidoBox = document.getElementById("partidoBox");
const listaParlamentaresPartidoEl = document.getElementById("listaParlamentaresPartido");
const buscaVotacaoPartidoEl = document.getElementById("buscaVotacaoPartido");
const ordenacaoVotacoesPartidoEl = document.getElementById("ordenacaoVotacoesPartido");
const resumoListaVotacoesPartidoEl = document.getElementById("resumoListaVotacoesPartido");
const listaVotacoesPartidoEl = document.getElementById("listaVotacoesPartido");

let partidoAtual = null;

function getIdDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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
  if (percentual >= 70) return "Apoio alto";
  if (percentual >= 40) return "Apoio intermediário";
  return "Apoio baixo";
}

function calcularPartidos(parlamentares, votos, votacoes) {
  const mapaVotacoes = new Map(votacoes.map(v => [String(v.id), v]));
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

  return [...mapaPartidos.values()].map(partido => {
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
      parlamentares: [...partido.parlamentares].sort((a, b) => {
        if (Number(b.nota || 0) !== Number(a.nota || 0)) return Number(b.nota || 0) - Number(a.nota || 0);
        return (a.nome || "").localeCompare((b.nome || ""), "pt-BR");
      }),
      votacoes: votacoesCalculadas
    };
  });
}

function montarResumoPartido(partido) {
  const percentual = Number(partido.media_apoio || 0);

  const maiorApoio = partido.votacoes.length > 0
    ? [...partido.votacoes].sort((a, b) => b.percentual_apoio - a.percentual_apoio)[0]
    : null;

  const menorApoio = partido.votacoes.length > 0
    ? [...partido.votacoes].sort((a, b) => a.percentual_apoio - b.percentual_apoio)[0]
    : null;

  partidoBox.innerHTML = `
    <section class="perfil-hero card perfil-${classePercentual(percentual)}">
      <div class="perfil-hero-topo">
        <div>
          <span class="perfil-casa-tag">Partido político</span>
          <h2 class="perfil-nome partido-nome-grande">${partido.sigla}</h2>
          <p class="perfil-meta">
            Média de apoio aos trabalhadores calculada a partir da média do partido em cada votação.
          </p>
        </div>

        <div class="caixa-nota">
          <div class="caixa-nota-rotulo">Apoio médio</div>
          <div class="caixa-nota-valor">${formatarPercentual(percentual)}</div>
          <div class="caixa-nota-texto">${textoPercentual(percentual)}</div>
        </div>
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
          <span class="metrica-rotulo">Parlamentares na base</span>
          <strong class="metrica-valor">${partido.total_parlamentares}</strong>
        </div>
        <div class="metrica">
          <span class="metrica-rotulo">Votações consideradas</span>
          <strong class="metrica-valor">${partido.total_votacoes}</strong>
        </div>
        <div class="metrica">
          <span class="metrica-rotulo">Média de nota individual</span>
          <strong class="metrica-valor">${Number(partido.media_nota_parlamentares || 0).toFixed(2)}</strong>
        </div>
      </div>

      <div class="partido-destaques-grid">
        <div class="mini-info">
          <span class="rotulo">Maior apoio</span>
          <strong>${maiorApoio ? formatarPercentual(maiorApoio.percentual_apoio) : "-"}</strong>
          <p class="mini-info-texto">${maiorApoio ? maiorApoio.votacao : "Sem dados"}</p>
        </div>
        <div class="mini-info">
          <span class="rotulo">Menor apoio</span>
          <strong>${menorApoio ? formatarPercentual(menorApoio.percentual_apoio) : "-"}</strong>
          <p class="mini-info-texto">${menorApoio ? menorApoio.votacao : "Sem dados"}</p>
        </div>
      </div>
    </section>
  `;
}

function criarCardParlamentar(partidoParlamentar) {
  const nota = Number(partidoParlamentar.nota || 0);

  return `
    <a class="card card-link parlamentar-voto-card" href="parlamentar.html?id=${encodeURIComponent(String(partidoParlamentar.id))}">
      <div class="card-parlamentar-topo">
        <span class="perfil-casa-tag">${partidoParlamentar.casa || "Casa não informada"}</span>
        <span class="badge badge-${nota >= 8 ? "alto" : nota >= 5 ? "medio" : "baixo"}">
          ${nota >= 8 ? "Alto alinhamento" : nota >= 5 ? "Alinhamento intermediário" : "Baixo alinhamento"}
        </span>
      </div>

      <h3>${partidoParlamentar.nome}</h3>

      <div class="card-parlamentar-meta">
        <span><strong>UF:</strong> ${partidoParlamentar.uf || "Não informado"}</span>
        <span><strong>Nota:</strong> ${nota.toFixed(2)}</span>
      </div>

      <div class="card-parlamentar-grid">
        <div class="mini-info">
          <span class="rotulo">Votações</span>
          <strong>${Number(partidoParlamentar.total_votacoes || 0)}</strong>
        </div>
        <div class="mini-info">
          <span class="rotulo">Alinhados</span>
          <strong>${Number(partidoParlamentar.votos_alinhados || 0)}</strong>
        </div>
        <div class="mini-info">
          <span class="rotulo">Partido</span>
          <strong>${partidoParlamentar.partido || "-"}</strong>
        </div>
      </div>
    </a>
  `;
}

function criarCardVotacaoPartido(votacao) {
  const percentual = Number(votacao.percentual_apoio || 0);

  return `
    <a class="card card-link votacao-card-link" href="votacao.html?id=${encodeURIComponent(String(votacao.id))}">
      <article class="votacao-card">
        <div class="votacao-card-topo">
          <span class="perfil-casa-tag">${votacao.casa}</span>
          <span class="badge badge-${classePercentual(percentual)}">${textoPercentual(percentual)}</span>
        </div>

        <h3 class="votacao-card-titulo">${votacao.votacao}</h3>

        <div class="votacao-card-grid">
          <div class="voto-info-item">
            <span class="rotulo">Posição de referência</span>
            <strong>${votacao.posicao_ods || "Não informado"}</strong>
          </div>
          <div class="voto-info-item">
            <span class="rotulo">Alinhados</span>
            <strong>${votacao.alinhados}</strong>
          </div>
          <div class="voto-info-item">
            <span class="rotulo">Não alinhados</span>
            <strong>${votacao.nao_alinhados}</strong>
          </div>
          <div class="voto-info-item">
            <span class="rotulo">Apoio do partido</span>
            <strong>${formatarPercentual(percentual)}</strong>
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

function ordenarVotacoes(lista, criterio) {
  const copia = [...lista];

  if (criterio === "apoio_asc") {
    return copia.sort((a, b) => a.percentual_apoio - b.percentual_apoio);
  }

  if (criterio === "nome") {
    return copia.sort((a, b) => a.votacao.localeCompare(b.votacao, "pt-BR"));
  }

  return copia.sort((a, b) => b.percentual_apoio - a.percentual_apoio);
}

function renderizarParlamentaresPartido() {
  if (!partidoAtual) return;

  if (partidoAtual.parlamentares.length === 0) {
    listaParlamentaresPartidoEl.innerHTML = `
      <div class="card estado-vazio">
        <p>Nenhum parlamentar encontrado para este partido.</p>
      </div>
    `;
    return;
  }

  listaParlamentaresPartidoEl.innerHTML = partidoAtual.parlamentares.map(criarCardParlamentar).join("");
}

function renderizarVotacoesPartido() {
  if (!partidoAtual) return;

  const termo = buscaVotacaoPartidoEl.value.trim().toLowerCase();
  const criterio = ordenacaoVotacoesPartidoEl.value;

  let filtradas = partidoAtual.votacoes.filter(v =>
    (v.votacao || "").toLowerCase().includes(termo)
  );

  filtradas = ordenarVotacoes(filtradas, criterio);

  resumoListaVotacoesPartidoEl.textContent = `${filtradas.length} votação(ões) encontrada(s)`;

  if (filtradas.length === 0) {
    listaVotacoesPartidoEl.innerHTML = `
      <div class="card estado-vazio">
        <p>Nenhuma votação encontrada com esse filtro.</p>
      </div>
    `;
    return;
  }

  listaVotacoesPartidoEl.innerHTML = filtradas.map(criarCardVotacaoPartido).join("");
}

async function carregarPartido() {
  const id = getIdDaUrl();

  try {
    const [respParlamentares, respVotos, respVotacoes] = await Promise.all([
      fetch("./data/parlamentares.json"),
      fetch("./data/votos.json"),
      fetch("./data/votacoes.json")
    ]);

    const parlamentares = await respParlamentares.json();
    const votos = await respVotos.json();
    const votacoes = await respVotacoes.json();

    const partidos = calcularPartidos(parlamentares, votos, votacoes);
    partidoAtual = partidos.find(p => String(p.sigla) === String(id));

    if (!partidoAtual) {
      partidoBox.innerHTML = `
        <div class="card estado-vazio">
          <p>Partido não encontrado.</p>
          <p><a href="partidos.html" class="link-acao">Voltar para partidos</a></p>
        </div>
      `;
      return;
    }

    document.title = `${partidoAtual.sigla} | Quem Foi Quem no Congresso`;

    montarResumoPartido(partidoAtual);
    renderizarParlamentaresPartido();
    renderizarVotacoesPartido();

    buscaVotacaoPartidoEl.addEventListener("input", renderizarVotacoesPartido);
    ordenacaoVotacoesPartidoEl.addEventListener("change", renderizarVotacoesPartido);
  } catch (erro) {
    console.error("Erro ao carregar partido:", erro);
    partidoBox.innerHTML = `
      <div class="card estado-vazio">
        <p>Erro ao carregar o partido.</p>
      </div>
    `;
  }
}

carregarPartido();