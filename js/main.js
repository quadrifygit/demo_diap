let parlamentares = [];
let ufSelecionadaMapa = "";

const listaEl = document.getElementById("listaParlamentares");
const buscaNomeEl = document.getElementById("buscaNome");
const filtroCargoEl = document.getElementById("filtroCargo");
const filtroPartidoEl = document.getElementById("filtroPartido");
const resultadoInfoEl = document.getElementById("resultadoInfo");
const resumoTopoEl = document.getElementById("resumoTopo");
const limparUfMapaEl = document.getElementById("limparUfMapa");
const ufSelecionadaTextoEl = document.getElementById("ufSelecionadaTexto");
const mapaBrasilFakeEl = document.getElementById("mapaBrasilFake");

function limparSelect(selectEl, textoPadrao) {
  selectEl.innerHTML = "";
  const option = document.createElement("option");
  option.value = "";
  option.textContent = textoPadrao;
  selectEl.appendChild(option);
}

function preencherFiltros() {
  limparSelect(filtroCargoEl, "Todos os cargos");
  limparSelect(filtroPartidoEl, "Todos os partidos");

  const cargos = [...new Set(parlamentares.map(p => p.casa).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  const partidos = [...new Set(parlamentares.map(p => p.partido).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  cargos.forEach(cargo => {
    const option = document.createElement("option");
    option.value = cargo;
    option.textContent = cargo;
    filtroCargoEl.appendChild(option);
  });

  partidos.forEach(partido => {
    const option = document.createElement("option");
    option.value = partido;
    option.textContent = partido;
    filtroPartidoEl.appendChild(option);
  });
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

function criarCard(parlamentar) {
  const nota = Number(parlamentar.nota || 0);

  const card = document.createElement("a");
  card.className = "card card-link card-parlamentar";
  card.href = `parlamentar.html?id=${encodeURIComponent(String(parlamentar.id))}`;

  card.innerHTML = `
    <div class="card-parlamentar-topo">
      <span class="perfil-casa-tag">${parlamentar.casa || "Casa não informada"}</span>
      <span class="badge badge-${classeNota(nota)}">${textoNota(nota)}</span>
    </div>

    <h3>${parlamentar.nome}</h3>

    <div class="card-parlamentar-meta">
      <span><strong>Partido:</strong> ${parlamentar.partido}</span>
      <span><strong>UF:</strong> ${parlamentar.uf}</span>
    </div>

    <div class="card-parlamentar-grid">
      <div class="mini-info">
        <span class="rotulo">Nota</span>
        <strong>${nota.toFixed(2)}</strong>
      </div>
      <div class="mini-info">
        <span class="rotulo">Votações</span>
        <strong>${Number(parlamentar.total_votacoes || 0)}</strong>
      </div>
      <div class="mini-info">
        <span class="rotulo">Alinhados</span>
        <strong>${Number(parlamentar.votos_alinhados || 0)}</strong>
      </div>
    </div>
  `;

  return card;
}

function atualizarTextoUfSelecionada() {
  ufSelecionadaTextoEl.textContent = ufSelecionadaMapa || "Todos os estados";
}

function atualizarMapaFakeVisual() {
  if (!mapaBrasilFakeEl) return;

  const botoesUf = mapaBrasilFakeEl.querySelectorAll(".uf-btn");
  botoesUf.forEach(btn => {
    const uf = btn.dataset.uf;
    btn.classList.toggle("ativo", uf === ufSelecionadaMapa);
  });
}

function renderizarLista() {
  const termo = buscaNomeEl.value.trim().toLowerCase();
  const cargo = filtroCargoEl.value;
  const partido = filtroPartidoEl.value;

  const filtrados = parlamentares
    .filter(p => {
      const bateNome = (p.nome || "").toLowerCase().includes(termo);
      const bateCargo = !cargo || p.casa === cargo;
      const batePartido = !partido || p.partido === partido;
      const bateUF = !ufSelecionadaMapa || p.uf === ufSelecionadaMapa;

      return bateNome && bateCargo && batePartido && bateUF;
    })
    .sort((a, b) => {
      if (Number(b.nota) !== Number(a.nota)) return Number(b.nota) - Number(a.nota);
      return (a.nome || "").localeCompare((b.nome || ""), "pt-BR");
    });

  listaEl.innerHTML = "";
  resultadoInfoEl.textContent = `${filtrados.length} parlamentar(es) encontrado(s)`;

  if (filtrados.length === 0) {
    listaEl.innerHTML = `
      <div class="card estado-vazio">
        <h3>Nenhum parlamentar encontrado</h3>
        <p>Tente ajustar os filtros de nome, cargo, partido ou estado.</p>
      </div>
    `;
  } else {
    filtrados.forEach(p => {
      listaEl.appendChild(criarCard(p));
    });
  }

  atualizarTextoUfSelecionada();
  atualizarMapaFakeVisual();
}

function preencherResumoTopo() {
  const total = parlamentares.length;

  const mediaNota =
    total > 0
      ? parlamentares.reduce((acc, p) => acc + Number(p.nota || 0), 0) / total
      : 0;

  const totalCamara = parlamentares.filter(p => p.casa === "Câmara dos Deputados").length;
  const totalSenado = parlamentares.filter(p => p.casa === "Senado Federal").length;
  const totalAlto = parlamentares.filter(p => Number(p.nota || 0) >= 8).length;

  resumoTopoEl.innerHTML = `
    <div class="resumo-card destaque-laranja">
      <span class="rotulo">Total de parlamentares</span>
      <span class="valor">${total}</span>
    </div>

    <div class="resumo-card">
      <span class="rotulo">Média geral de nota</span>
      <span class="valor">${mediaNota.toFixed(2)}</span>
    </div>

    <div class="resumo-card">
      <span class="rotulo">Câmara dos Deputados</span>
      <span class="valor">${totalCamara}</span>
    </div>

    <div class="resumo-card">
      <span class="rotulo">Senado Federal</span>
      <span class="valor">${totalSenado}</span>
    </div>

    <div class="resumo-card">
      <span class="rotulo">Alto alinhamento</span>
      <span class="valor">${totalAlto}</span>
    </div>
  `;
}

function inicializarMapaFake() {
  if (!mapaBrasilFakeEl) return;

  const ufsComDados = new Set(parlamentares.map(p => p.uf).filter(Boolean));
  const botoesUf = mapaBrasilFakeEl.querySelectorAll(".uf-btn");

  botoesUf.forEach(btn => {
    const uf = btn.dataset.uf;

    if (!ufsComDados.has(uf)) {
      btn.classList.add("sem-dados");
      btn.title = `${uf} sem parlamentares na base`;
    } else {
      btn.title = `Filtrar parlamentares de ${uf}`;
    }

    btn.addEventListener("click", () => {
      if (!ufsComDados.has(uf)) return;

      if (ufSelecionadaMapa === uf) {
        ufSelecionadaMapa = "";
      } else {
        ufSelecionadaMapa = uf;
      }

      renderizarLista();
    });
  });
}

async function carregarParlamentares() {
  try {
    const resp = await fetch("./data/parlamentares.json");
    parlamentares = await resp.json();

    preencherFiltros();
    preencherResumoTopo();
    inicializarMapaFake();
    renderizarLista();

    buscaNomeEl.addEventListener("input", renderizarLista);
    filtroCargoEl.addEventListener("change", renderizarLista);
    filtroPartidoEl.addEventListener("change", renderizarLista);

    limparUfMapaEl.addEventListener("click", () => {
      ufSelecionadaMapa = "";
      renderizarLista();
    });
  } catch (erro) {
    console.error("Erro ao carregar parlamentares:", erro);
    resultadoInfoEl.textContent = "Erro ao carregar os dados.";
  }
}

carregarParlamentares();