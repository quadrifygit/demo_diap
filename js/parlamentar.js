const perfilBox = document.getElementById("perfilBox");
const listaVotos = document.getElementById("listaVotos");
const resumoListaVotos = document.getElementById("resumoListaVotos");
const buscaVotacaoEl = document.getElementById("buscaVotacao");
const botoesFiltro = document.querySelectorAll(".btn-filtro");

let votosCarregados = [];
let filtroAtual = "todos";

function getIdDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

function formatarNota(nota) {
  return Number(nota || 0).toFixed(2);
}

function classeNota(nota) {
  if (nota >= 8) return "alto";
  if (nota >= 5) return "medio";
  return "baixo";
}

function textoNota(nota) {
  if (nota >= 8) return "Alto alinhamento";
  if (nota >= 5) return "Alinhamento intermediário";
  return "Baixo alinhamento";
}

function percentualBarra(nota) {
  const valor = Number(nota || 0) * 10;
  return Math.max(0, Math.min(100, valor));
}

function obterStatusVoto(voto) {
  const alinhado = Number(voto.pontuacao) === 1;

  return {
    chave: alinhado ? "alinhado" : "nao_alinhado",
    titulo: alinhado ? "Alinhado" : "Não alinhado",
    classe: alinhado ? "status-alinhado" : "status-nao-alinhado"
  };
}

function montarResumoPerfil(parlamentar) {
  const nota = Number(parlamentar.nota || 0);
  const total = Number(parlamentar.total_votacoes) || 0;
  const alinhados = Number(parlamentar.votos_alinhados) || 0;
  const naoAlinhados = Math.max(0, total - alinhados);
  const partidoSeguro = encodeURIComponent(parlamentar.partido || "");

  perfilBox.innerHTML = `
    <section class="perfil-hero card perfil-${classeNota(nota)}">
      <div class="perfil-hero-topo">
        <div>
          <span class="perfil-casa-tag">${parlamentar.casa || "Casa não informada"}</span>
          <h2 class="perfil-nome">${parlamentar.nome}</h2>
          <p class="perfil-meta">
            <a href="partido.html?id=${partidoSeguro}" class="meta-link partido-link">${parlamentar.partido || "Partido não informado"}</a>
            ·
            ${parlamentar.uf || "UF não informada"}
          </p>
        </div>

        <div class="caixa-nota">
          <div class="caixa-nota-rotulo">Nota final</div>
          <div class="caixa-nota-valor">${formatarNota(nota)}</div>
          <div class="caixa-nota-texto">${textoNota(nota)}</div>
        </div>
      </div>

      <div class="termometro-box">
        <div class="termometro-legenda">
          <span>0</span>
          <span>Escala de 0 a 10</span>
          <span>10</span>
        </div>
        <div class="termometro-trilho">
          <div class="termometro-preenchimento ${classeNota(nota)}" style="width: ${percentualBarra(nota)}%;"></div>
        </div>
      </div>

      <div class="perfil-metricas">
        <div class="metrica">
          <span class="metrica-rotulo">Votações consideradas</span>
          <strong class="metrica-valor">${total}</strong>
        </div>
        <div class="metrica">
          <span class="metrica-rotulo">Votos alinhados</span>
          <strong class="metrica-valor">${alinhados}</strong>
        </div>
        <div class="metrica">
          <span class="metrica-rotulo">Votos não alinhados</span>
          <strong class="metrica-valor">${naoAlinhados}</strong>
        </div>
      </div>
    </section>
  `;
}

function criarCardVoto(voto) {
  const status = obterStatusVoto(voto);

  const posicaoTexto = voto.posicao_ods || "Não informado";
  const votoTexto = voto.voto || "Não informado";
  const casaTexto = voto.casa || "Não informado";
  const tituloVotacao = voto.votacao_detalhada || voto.votacao || "Votação sem título";

  return `
    <article class="card voto-card">
      <div class="voto-card-topo">
        <span class="status-pill ${status.classe}">${status.titulo}</span>
        <span class="voto-casa">${casaTexto}</span>
      </div>

      <h3 class="voto-titulo">${tituloVotacao}</h3>

      <div class="voto-grid-info">
        <div class="voto-info-item">
          <span class="rotulo">Voto do parlamentar</span>
          <strong>${votoTexto}</strong>
        </div>
        <div class="voto-info-item">
          <span class="rotulo">Posição de referência</span>
          <strong>${posicaoTexto}</strong>
        </div>
        <div class="voto-info-item">
          <span class="rotulo">Pontuação</span>
          <strong>${Number(voto.pontuacao || 0).toFixed(0)}</strong>
        </div>
      </div>
    </article>
  `;
}

function aplicarFiltros() {
  const termo = buscaVotacaoEl.value.trim().toLowerCase();

  const filtrados = votosCarregados.filter(v => {
    const titulo = (v.votacao_detalhada || v.votacao || "").toLowerCase();
    const status = obterStatusVoto(v).chave;

    const bateBusca = titulo.includes(termo);
    const bateFiltro =
      filtroAtual === "todos" ||
      (filtroAtual === "alinhado" && status === "alinhado") ||
      (filtroAtual === "nao_alinhado" && status === "nao_alinhado");

    return bateBusca && bateFiltro;
  });

  resumoListaVotos.textContent = `${filtrados.length} votação(ões) encontrada(s)`;

  if (filtrados.length === 0) {
    listaVotos.innerHTML = `
      <div class="card estado-vazio">
        <p>Nenhuma votação encontrada com esse filtro.</p>
      </div>
    `;
    return;
  }

  listaVotos.innerHTML = filtrados.map(criarCardVoto).join("");
}

function ativarEventosFiltro() {
  buscaVotacaoEl.addEventListener("input", aplicarFiltros);

  botoesFiltro.forEach(btn => {
    btn.addEventListener("click", () => {
      botoesFiltro.forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      filtroAtual = btn.dataset.filtro;
      aplicarFiltros();
    });
  });
}

async function carregarPerfil() {
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

    const parlamentar = parlamentares.find(p => Number(p.id) === id);

    if (!parlamentar) {
      perfilBox.innerHTML = `
        <div class="card estado-vazio">
          <p>Parlamentar não encontrado.</p>
          <p><a href="index.html" class="link-acao">Voltar para a lista</a></p>
        </div>
      `;
      return;
    }

    document.title = `${parlamentar.nome} | Quem Foi Quem no Congresso`;

    const mapaVotacoes = new Map(votacoes.map(v => [Number(v.id), v]));

    votosCarregados = votos
      .filter(v => Number(v.parlamentar_id) === id)
      .map(v => {
        const votacaoDetalhe = mapaVotacoes.get(Number(v.votacao_id));
        return {
          ...v,
          votacao_detalhada: votacaoDetalhe?.votacao || v.votacao,
          casa: votacaoDetalhe?.casa || v.casa,
          posicao_ods: votacaoDetalhe?.posicao_ods || v.posicao_ods
        };
      })
      .sort((a, b) => {
        const aPont = Number(a.pontuacao || 0);
        const bPont = Number(b.pontuacao || 0);

        if (aPont !== bPont) return aPont - bPont;
        return (a.votacao_detalhada || a.votacao || "").localeCompare(
          (b.votacao_detalhada || b.votacao || ""),
          "pt-BR"
        );
      });

    montarResumoPerfil(parlamentar);
    aplicarFiltros();
    ativarEventosFiltro();
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
    perfilBox.innerHTML = `
      <div class="card estado-vazio">
        <p>Erro ao carregar o perfil.</p>
      </div>
    `;
  }
}

carregarPerfil();