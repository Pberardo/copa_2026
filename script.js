const URL_JOGOS = 'worldcup.json';

// Dicionários
const DICIONARIO_BANDEIRAS = {
    "mexico": "🇲🇽", "south africa": "🇿🇦", "south korea": "🇰🇷", "czech republic": "🇨🇿",
    "switzerland": "🇨🇭", "canada": "🇨🇦", "bosnia & herzegovina": "🇧🇦", "bosnia and herzegovina": "🇧🇦",
    "qatar": "🇶🇦", "catar": "🇶🇦", "brazil": "🇧🇷", "morocco": "🇲🇦", "scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "haiti": "🇭🇹", "united states": "🇺🇸", "usa": "🇺🇸", "australia": "🇦🇺", "paraguay": "🇵🇾",
    "turkey": "🇹🇷", "germany": "🇩🇪", "ivory coast": "🇨🇮", "ecuador": "🇪🇨", "netherlands": "🇳🇱",
    "japan": "🇯🇵", "sweden": "🇸🇪", "tunisia": "🇹🇳", "belgium": "🇧🇪", "egypt": "🇪🇬",
    "iran": "🇮🇷", "new zealand": "🇳🇿", "spain": "🇪🇸", "cape verde": "🇨🇻", "saudi arabia": "🇸🇦",
    "uruguay": "🇺🇾", "france": "🇫🇷", "senegal": "🇸🇳", "iraq": "🇮🇶", "norway": "🇳🇴",
    "algeria": "🇩🇿", "argentina": "🇦🇷", "austria": "🇦🇹", "jordan": "🇯🇴", "portugal": "🇵🇹",
    "dr congo": "🇨🇩", "curacao": "🇨🇼", "uzbekistan": "🇺🇿","colombia": "🇨🇴", "england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 
    "croatia": "🇭🇷", "ghana": "🇬🇭", "panama": "🇵🇦"
};

const TRADUCAO_PAISES = {
    "germany": "Alemanha", "paraguay": "Paraguai", "france": "França", "sweden": "Suécia",
    "south africa": "África do Sul", "canada": "Canadá", "netherlands": "Holanda", "morocco": "Marrocos",
    "portugal": "Portugal", "croatia": "Croácia", "spain": "Espanha", "austria": "Áustria",
    "united states": "Estados Unidos", "usa": "Estados Unidos", "bosnia & herzegovina": "Bósnia e Hezergovina",
    "bosnia and herzegovina": "Bósnia e Hezergovina", "belgium": "Bélgica", "senegal": "Senegal",
    "brazil": "Brasil", "japan": "Japão", "ivory coast": "Costa do Marfim", "norway": "Noruega",
    "mexico": "México", "ecuador": "Equador", "england": "Inglaterra", "dr congo": "RD Congo",
    "congo dr": "RD Congo", "congo": "RD Congo", "argentina": "Argentina", "cape verde": "Cabo Verde",
    "australia": "Austrália", "egypt": "Egito", "switzerland": "Suíça", "algeria": "Argélia",
    "colombia": "Colômbia", "ghana": "Gana"
};

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function obterEmojiBandeira(nomePais) {
    const chave = normalizarTexto(nomePais);
    return DICIONARIO_BANDEIRAS[chave] || "🏳️";
}
function traduzirNomePais(nomePais) {
    if (!nomePais) return "?";
    const chave = normalizarTexto(nomePais);
    return TRADUCAO_PAISES[chave] || nomePais;
}

// 🧮 FUNÇÃO: Calcula a pontuação e ordena a tabela do grupo
function calcularClassificacao(jogosGrupo) {
    const times = {};

    jogosGrupo.forEach(j => {
        const t1 = j.team1; const t2 = j.team2;

        // Inicializa os times se não existirem no dicionário
        if (!times[t1]) times[t1] = { nome: t1, pts: 0, j: 0, v: 0, e: 0, d: 0, gf: 0, gc: 0, sg: 0 };
        if (!times[t2]) times[t2] = { nome: t2, pts: 0, j: 0, v: 0, e: 0, d: 0, gf: 0, gc: 0, sg: 0 };

        // Só contabiliza se o jogo já acabou (tem placar)
        if (j.score && Array.isArray(j.score.ft)) {
            const g1 = j.score.ft[0]; const g2 = j.score.ft[1];

            times[t1].j++; times[t2].j++;
            times[t1].gf += g1; times[t2].gf += g2;
            times[t1].gc += g2; times[t2].gc += g1;

            if (g1 > g2) { // Vitória T1
                times[t1].v++; times[t1].pts += 3;
                times[t2].d++;
            } else if (g1 < g2) { // Vitória T2
                times[t2].v++; times[t2].pts += 3;
                times[t1].d++;
            } else { // Empate
                times[t1].e++; times[t2].e++;
                times[t1].pts += 1; times[t2].pts += 1;
            }
        }
    });

    // Calcula o saldo de gols e transforma em array
    const listaTimes = Object.values(times).map(t => {
        t.sg = t.gf - t.gc;
        return t;
    });

    // Ordena: Pontos > Saldo de Gols > Gols Feitos
    return listaTimes.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.sg !== a.sg) return b.sg - a.sg;
        return b.gf - a.gf;
    });
}

// 📊 FUNÇÃO: Gera o HTML da Tabela de Classificação
function gerarTabelaHTML(timesOrdenados) {
    let linhasHTML = '';
    
    timesOrdenados.forEach((t, index) => {
        // Os dois primeiros colocados ganham um destaque verde sutil
        const classLinha = index < 2 
            ? "bg-emerald-900/10 border-l-4 border-l-emerald-500 font-medium" 
            : "border-l-4 border-l-transparent text-slate-400";

        linhasHTML += `
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${classLinha}">
                <td class="py-3 pl-3 text-center w-8">${index + 1}</td>
                <td class="py-3 flex items-center gap-2 font-bold text-slate-200 whitespace-nowrap">
                    <span class="text-xl">${obterEmojiBandeira(t.nome)}</span> ${traduzirNomePais(t.nome)}
                </td>
                <td class="py-3 text-center font-extrabold text-white">${t.pts}</td>
                <td class="py-3 text-center text-slate-500">${t.j}</td>
                <td class="py-3 text-center">${t.v}</td>
                <td class="py-3 text-center">${t.e}</td>
                <td class="py-3 text-center">${t.d}</td>
                <td class="py-3 text-center font-semibold text-emerald-400">${t.sg}</td>
            </tr>
        `;
    });

    return `
        <div class="mb-6 overflow-x-auto rounded-xl border border-slate-700/80 shadow-md">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th class="py-3 pl-3 text-center">Pos</th>
                        <th class="py-3">Seleção</th>
                        <th class="py-3 text-center w-12 text-white">Pts</th>
                        <th class="py-3 text-center w-10">J</th>
                        <th class="py-3 text-center w-10">V</th>
                        <th class="py-3 text-center w-10">E</th>
                        <th class="py-3 text-center w-10">D</th>
                        <th class="py-3 text-center w-12">SG</th>
                    </tr>
                </thead>
                <tbody class="bg-slate-800/40 divide-y divide-slate-700/50">
                    ${linhasHTML}
                </tbody>
            </table>
        </div>
    `;
}

// ⚽ FUNÇÃO: Gera o card do Jogo
function gerarCardJogoGrupo(j) {
    let g1 = '-'; let g2 = '-';
    if (j.score && Array.isArray(j.score.ft)) { g1 = j.score.ft[0]; g2 = j.score.ft[1]; }

    const dataFormatada = j.date ? j.date.split('-').reverse().slice(0,2).join('/') : '?';
    const horaFormatada = j.time ? j.time.replace(' BRT', '') : ''; 

    let golsTime1HTML = '';
    if (j.goals1 && j.goals1.length > 0) {
        golsTime1HTML = j.goals1.map(g => `<div class="text-[10px] md:text-xs text-slate-400"><span class="text-emerald-400">⚽</span> ${g.name} ${g.minute}' ${g.owngoal ? '<span class="text-red-400 text-[9px] font-bold">(GC)</span>' : ''}</div>`).join('');
    }

    let golsTime2HTML = '';
    if (j.goals2 && j.goals2.length > 0) {
        golsTime2HTML = j.goals2.map(g => `<div class="text-[10px] md:text-xs text-slate-400">${g.owngoal ? '<span class="text-red-400 text-[9px] font-bold">(GC)</span>' : ''} ${g.minute}' ${g.name} <span class="text-emerald-400">⚽</span></div>`).join('');
    }

    return `
        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700/80 hover:border-emerald-500/50 transition-colors shadow-lg flex flex-col h-full w-full">
            <div class="flex justify-between items-center border-b border-slate-700/50 pb-2 mb-3">
                <span class="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Jogo #${j.num || '?'}</span>
                <span class="text-[10px] md:text-xs text-emerald-400 font-semibold">${dataFormatada} • ${horaFormatada}</span>
            </div>
            <div class="flex justify-between items-center mb-3">
                <div class="flex flex-col items-center w-[35%]">
                    <span class="text-3xl mb-1">${obterEmojiBandeira(j.team1)}</span>
                    <span class="text-[10px] font-bold text-slate-300 text-center uppercase tracking-wide leading-tight">${traduzirNomePais(j.team1)}</span>
                </div>
                <div class="flex flex-col items-center justify-center w-[30%]">
                    <div class="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span class="text-lg font-black text-white">${g1} - ${g2}</span>
                    </div>
                </div>
                <div class="flex flex-col items-center w-[35%]">
                    <span class="text-3xl mb-1">${obterEmojiBandeira(j.team2)}</span>
                    <span class="text-[10px] font-bold text-slate-300 text-center uppercase tracking-wide leading-tight">${traduzirNomePais(j.team2)}</span>
                </div>
            </div>
            ${(golsTime1HTML || golsTime2HTML) ? `
                <div class="flex justify-between mt-auto pt-2 border-t border-slate-700/30">
                    <div class="flex flex-col w-1/2 pr-2 border-r border-slate-700/30 text-left gap-0.5">${golsTime1HTML}</div>
                    <div class="flex flex-col w-1/2 pl-2 text-right items-end gap-0.5">${golsTime2HTML}</div>
                </div>
            ` : ''}
        </div>
    `;
}

// 🚀 FUNÇÃO PRINCIPAL
function renderizarFaseGrupos(matches) {
    const container = document.getElementById('grupos-container');
    container.innerHTML = '';

    const jogosGrupos = matches.filter(j => j.group);
    const gruposAgrupados = {};
    jogosGrupos.forEach(j => {
        const nomeGrupo = j.group;
        if (!gruposAgrupados[nomeGrupo]) gruposAgrupados[nomeGrupo] = [];
        gruposAgrupados[nomeGrupo].push(j);
    });

    for (const [nomeGrupo, jogos] of Object.entries(gruposAgrupados)) {
        const tituloGrupo = nomeGrupo.replace('Group', 'Grupo').trim();
        
        // 1. Calcula a tabela para este grupo específico
        const timesOrdenados = calcularClassificacao(jogos);
        
        // 2. Cria o HTML do grupo com a Tabela + Os Jogos
        let htmlGrupo = `
            <div class="mb-14 bg-slate-900/30 p-4 md:p-6 rounded-2xl border border-slate-800/60 shadow-xl">
                <h2 class="text-2xl font-black text-emerald-400 mb-6 flex items-center gap-2">
                    <span>📊</span> ${tituloGrupo}
                </h2>
                
                ${gerarTabelaHTML(timesOrdenados)}
                
                <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 mt-8 border-b border-slate-800 pb-2">Jogos do Grupo</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        `;

        jogos.forEach(jogo => { htmlGrupo += gerarCardJogoGrupo(jogo); });

        htmlGrupo += `</div></div>`;
        container.innerHTML += htmlGrupo;
    }
}

async function carregarFaseGrupos() {
    try {
        const res = await fetch(URL_JOGOS);
        if (res.ok) {
            const dados = await res.json();
            if (dados.matches && Array.isArray(dados.matches)) {
                renderizarFaseGrupos(dados.matches);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

carregarFaseGrupos();