const URL_JOGOS = 'worldcup.json';

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

function renderizarTopArtilheiros(matches) {
    const container = document.getElementById('artilheiros-container');
    if (!container) return;

    const bancoArtilheiros = {};

    matches.forEach(j => {
        if (j.goals1 && Array.isArray(j.goals1)) {
            j.goals1.forEach(g => {
                if (g.owngoal) return; 
                const nomeJogador = g.name;
                const selecao = j.team1;
                
                if (!bancoArtilheiros[nomeJogador]) {
                    bancoArtilheiros[nomeJogador] = { nome: nomeJogador, selecao: selecao, gols: 0 };
                }
                bancoArtilheiros[nomeJogador].gols++;
            });
        }

        if (j.goals2 && Array.isArray(j.goals2)) {
            j.goals2.forEach(g => {
                if (g.owngoal) return; 
                const nomeJogador = g.name;
                const selecao = j.team2;
                
                if (!bancoArtilheiros[nomeJogador]) {
                    bancoArtilheiros[nomeJogador] = { nome: nomeJogador, selecao: selecao, gols: 0 };
                }
                bancoArtilheiros[nomeJogador].gols++;
            });
        }
    });

    // Ordena do maior para o menor número de gols
    const listaOrdenada = Object.values(bancoArtilheiros).sort((a, b) => b.gols - a.gols);
    const top10 = listaOrdenada.slice(0, 10);

    let tabelaHTML = `
        <div class="bg-slate-800/80 rounded-xl p-5 md:p-8 border border-slate-700/60 shadow-2xl">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-700/50 pb-4">
                        <h2 class="text-xl md:text-2xl font-black text-emerald-400 uppercase tracking-widest">Chuteira de Ouro</h2>
                        <p class="text-xs text-slate-400">Top 10 Artilheiros do Torneio</p>
                    </div>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm md:text-base whitespace-nowrap">
                    <thead>
                        <tr class="text-slate-500 text-[10px] md:text-xs uppercase tracking-wider border-b border-slate-700 pb-2">
                            <th class="py-3 pl-4 w-16">Pos</th>
                            <th class="py-3">Jogador</th>
                            <th class="py-3">Seleção</th>
                            <th class="py-3 text-center w-24">Gols</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (top10.length === 0) {
        tabelaHTML += `<tr><td colspan="4" class="text-center py-8 text-slate-500 italic">Nenhum gol registrado ainda.</td></tr>`;
    } else {
        top10.forEach((jogador, index) => {
            const emojiBandeira = obterEmojiBandeira(jogador.selecao);
            const nomeSelecao = traduzirNomePais(jogador.selecao);
            
            // Estilo VIP para o 1º Colocado e estilo padrão para os demais
            const estiloLinha = index === 0 
                ? 'bg-gradient-to-r from-yellow-500/20 to-transparent text-yellow-100 font-bold border-b border-yellow-500/30' 
                : 'text-slate-300 border-b border-slate-700/40 hover:bg-slate-700/30 transition-colors';

            const coroa = index === 0 ? '<span class="mr-2 text-lg drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">👑</span>' : '';
            const posicao = index === 0 ? '1º' : `${index + 1}º`;

            tabelaHTML += `
                <tr class="${estiloLinha} group">
                    <td class="py-4 pl-4 font-black ${index === 0 ? 'text-yellow-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors">
                        ${posicao}
                    </td>
                    <td class="py-4 font-bold flex items-center">
                        ${coroa} ${jogador.nome}
                    </td>
                    <td class="py-4">
                        <span class="text-lg mr-2 align-middle">${emojiBandeira}</span>
                        <span class="align-middle ${index === 0 ? 'text-yellow-200' : 'text-slate-400'}">${nomeSelecao}</span>
                    </td>
                    <td class="py-4 text-center">
                        <span class="inline-block bg-slate-900 px-3 py-1 rounded-lg border ${index === 0 ? 'border-yellow-500/50 text-yellow-400' : 'border-slate-700 text-emerald-400'} font-extrabold text-lg">
                            ${jogador.gols}
                        </span>
                    </td>
                </tr>
            `;
        });
    }

    tabelaHTML += `</tbody></table></div></div>`;
    container.innerHTML = tabelaHTML;
}

// Inicializador
async function carregarArtilharia() {
    try {
        const res = await fetch(URL_JOGOS);
        if (res.ok) {
            const dados = await res.json();
            renderizarTopArtilheiros(dados.matches);
        } else {
            document.getElementById('artilheiros-container').innerHTML = '<p class="text-red-400 text-center py-8">Erro ao conectar com a API.</p>';
        }
    } catch (e) {
        console.error(e);
        document.getElementById('artilheiros-container').innerHTML = '<p class="text-red-400 text-center py-8">Erro crítico no script.</p>';
    }
}

carregarArtilharia();
