const URL_JOGOS = 'https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json';

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

// Traduz os países reais e também converte "Winner Match 74" para "Vencedor (número do jogo)"
function traduzirNomePais(nomePais) {
    if (!nomePais) return "?";
    const textoNorm = nomePais.toString().toLowerCase().trim();
    
    if (textoNorm.includes("winner match") || textoNorm.includes("winner of match")) {
        const num = textoNorm.match(/\d+/);
        return num ? `Vencedor  ${num[0]}` : "Vencedor";
    }
    if (textoNorm.startsWith("w") && !isNaN(textoNorm.substring(1))) {
        return `Vencedor  ${textoNorm.substring(1)}`;
    }

    const chave = normalizarTexto(nomePais);
    return TRADUCAO_PAISES[chave] || nomePais;
}

function converterParaBrasilia(horarioOriginal) {
    if (!horarioOriginal) return "Horário a definir";
    try {
        const partes = horarioOriginal.toString().trim().split(" ");
        if (partes.length < 2) return horarioOriginal;

        const [horaStr, minutoStr] = partes[0].split(":");
        let horas = parseInt(horaStr, 10);
        const minutes = minutoStr;

        let fusoOriginal = 0;
        const fusoStr = partes[1].toUpperCase();
        if (fusoStr.includes("-")) {
            fusoOriginal = parseInt(fusoStr.split("-")[1], 10) * -1;
        } else if (fusoStr.includes("+")) {
            fusoOriginal = parseInt(fusoStr.split("+")[1], 10);
        }

        let horaUtc = horas - fusoOriginal;
        let horaBrasilia = horaUtc - 3;

        if (horaBrasilia < 0) horaBrasilia += 24;
        if (horaBrasilia >= 24) horaBrasilia -= 24;

        const horaFinal = horaBrasilia.toString().padStart(2, '0');
        return `${horaFinal}:${minutes} BRT`;
    } catch (e) {
        return horarioOriginal;
    }
}

function rolarAteOJogo(matchNum) {
    const elementoId = `match-${matchNum}`;
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elemento.classList.add('ring-2', 'ring-yellow-500', 'scale-105');
        setTimeout(() => {
            elemento.classList.remove('ring-2', 'ring-yellow-500', 'scale-105');
        }, 2000);
    }
}

function processarPlayoffs(dadosJogos) {
    const matches = dadosJogos && Array.isArray(dadosJogos.matches) ? dadosJogos.matches : [];

    const chavesBusca = {
        "r32": { titulo: "16 av", jogos: [] },
        "r16": { titulo: "Oitavas", jogos: [] },
        "quarter": { titulo: "Quartas", jogos: [] },
        "semi": { titulo: "Semi", jogos: [] },
        "final": { titulo: "Final", jogos: [] }
    };

    matches.forEach(m => {
        const roundStr = (m.round || m.stage || "").toLowerCase();
        if (roundStr.includes("round of 32")) chavesBusca["r32"].jogos.push(m);
        else if (roundStr.includes("round of 16")) chavesBusca["r16"].jogos.push(m);
        else if (roundStr.includes("quarter")) chavesBusca["quarter"].jogos.push(m);
        else if (roundStr.includes("semi")) chavesBusca["semi"].jogos.push(m);
        else if (roundStr === "final" || roundStr === "the final") chavesBusca["final"].jogos.push(m);
    });

    renderizarChaveamentoConvergente(chavesBusca);
    renderizarListaDeJogos(chavesBusca);
}

function renderizarChaveamentoConvergente(fases) {
    const container = document.getElementById('chaveamento-container');
    container.className = "w-full overflow-x-auto pb-4"; 

    const ordemEsquerda = [
        "germany", "france", "south africa", "netherlands", 
        "portugal", "spain", "united states", "usa", 
        "bosnia and herzegovina", "bosnia & herzegovina", "belgium"
    ];

    // 🧠 NOVO: Set dinâmico para rastrear a linhagem dos jogos que pertencem ao Lado Esquerdo
    const numsEsq = new Set();

    // Função que verifica se um jogo pertence à linhagem da esquerda (por time real ou por número de jogo anterior)
    const pertenceAChaveEsquerda = (j) => {
        const t1 = normalizarTexto(j.team1);
        const t2 = normalizarTexto(j.team2);

        if (ordemEsquerda.includes(t1) || ordemEsquerda.includes(t2)) return true;

        const extrairNumero = (txt) => {
            const m = txt.match(/\d+/);
            return m ? parseInt(m[0], 10) : null;
        };
        const n1 = extrairNumero(t1);
        const n2 = extrairNumero(t2);

        if (n1 && numsEsq.has(n1)) return true;
        if (n2 && numsEsq.has(n2)) return true;

        return false;
    };

    // 1. SEPARAÇÃO DA FASE DE 16 AVOS (Round of 32)
    const r32Esq = []; const r32Dir = [];
    fases["r32"].jogos.forEach(j => {
        if (pertenceAChaveEsquerda(j)) {
            r32Esq.push(j);
            if (j.num) numsEsq.add(j.num); // Alimenta a árvore genealógica da esquerda
        } else { r32Dir.push(j); }
    });

    // 2. SEPARAÇÃO DAS OITAVAS BASEADA NA LINHAGEM
    const r16Esq = []; const r16Dir = [];
    fases["r16"].jogos.forEach(j => {
        if (pertenceAChaveEsquerda(j)) {
            r16Esq.push(j);
            if (j.num) numsEsq.add(j.num);
        } else { r16Dir.push(j); }
    });

    // 3. SEPARAÇÃO DAS QUARTAS BASEADA NA LINHAGEM
    const qfEsq = []; const qfDir = [];
    fases["quarter"].jogos.forEach(j => {
        if (pertenceAChaveEsquerda(j)) {
            qfEsq.push(j);
            if (j.num) numsEsq.add(j.num);
        } else { qfDir.push(j); }
    });

    // 4. SEPARAÇÃO DAS SEMIFINAIS BASEADA NA LINHAGEM
    const sfEsq = []; const sfDir = [];
    fases["semi"].jogos.forEach(j => {
        if (pertenceAChaveEsquerda(j)) { sfEsq.push(j); } 
        else { sfDir.push(j); }
    });

    const finalJogo = fases["final"].jogos;

    const renderizarColuna = (jogos, titulo, placeholders = 0) => {
        let html = `<div class="flex-1 flex flex-col justify-center self-center h-fit gap-2.5 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800/60 min-w-[145px]">`;
        html += `<h3 class="text-center text-[10px] font-bold uppercase text-emerald-400 border-b border-slate-800 pb-0.5 mb-0.5 truncate">${titulo}</h3>`;
        
        if (jogos.length === 0 && placeholders === 0) {
            html += `<p class="text-center text-[10px] text-slate-600 my-auto italic">?</p>`;
        } else {
            jogos.forEach(j => {
                let g1 = '-'; let g2 = '-';
                if (j.score) {
                    if (Array.isArray(j.score.et)) { g1 = j.score.et[0]; g2 = j.score.et[1]; } 
                    else if (Array.isArray(j.score.ft)) { g1 = j.score.ft[0]; g2 = j.score.ft[1]; }
                }
                
                if (j.score && Array.isArray(j.score.p) && j.score.p.length === 2) {
                    g1 += ` (${j.score.p[0]})`; g2 += ` (${j.score.p[1]})`;
                }

                const dataFormatada = j.date ? j.date.split('-').reverse().slice(0,2).join('/') : '?';
                const horarioBrasilia = converterParaBrasilia(j.time);
                const numJogo = j.num ? `#${j.num}` : '';

                html += `
                    <div onclick="rolarAteOJogo(${j.num || 0})" class="relative bg-slate-800/90 rounded p-1.5 border border-slate-700 text-xs shadow-sm hover:border-emerald-500 cursor-pointer transition-all active:scale-95">
                        <span class="absolute top-[2px] left-[4px] text-[11px] text-slate-400/80 font-extrabold tracking-tighter">${numJogo}</span>
                        <div class="text-[9px] text-emerald-400 font-semibold mb-0.5 border-b border-slate-700/50 pb-0.5 text-center">
                            ${dataFormatada} • ${horarioBrasilia}
                        </div>
                        <div class="flex justify-between items-center mb-0.5 gap-1">
                            <span class="truncate pr-0.5 text-slate-200" title="${traduzirNomePais(j.team1)}">
                                ${obterEmojiBandeira(j.team1)} <span>${traduzirNomePais(j.team1)}</span>
                            </span>
                            <span class="font-bold text-white bg-slate-900 px-1.5 rounded text-xs shrink-0">${g1}</span>
                        </div>
                        <div class="flex justify-between items-center gap-1">
                            <span class="truncate pr-0.5 text-slate-200" title="${traduzirNomePais(j.team2)}">
                                ${obterEmojiBandeira(j.team2)} <span>${traduzirNomePais(j.team2)}</span>
                            </span>
                            <span class="font-bold text-white bg-slate-900 px-1.5 rounded text-xs shrink-0">${g2}</span>
                        </div>
                    </div>
                `;
            });
            
            for (let i = jogos.length; i < placeholders; i++) {
                html += `
                    <div class="bg-slate-800/20 rounded p-1.5 border border-slate-700/40 text-xs opacity-30">
                        <div class="flex justify-between items-center mb-0.5 text-slate-600 gap-1">
                            <span>🏳️ <span>?</span></span><span>-</span>
                        </div>
                        <div class="flex justify-between items-center text-slate-600 gap-1">
                            <span>🏳️ <span>?</span></span><span>-</span>
                        </div>
                    </div>
                `;
            }
        }
        html += `</div>`;
        return html;
    };

    container.innerHTML = `
        <div class="flex justify-between items-stretch gap-1.5 mx-auto max-w-full px-2 min-w-[1350px]">
            <div class="flex flex-1 gap-1.5 justify-start">
                ${renderizarColuna(r32Esq, '16 av', 8)}
                ${renderizarColuna(r16Esq, 'Oitavas', 4)}
                ${renderizarColuna(qfEsq, 'Quartas', 2)}
                ${renderizarColuna(sfEsq, 'Semi', 1)}
            </div>

            <div class="flex flex-col justify-center self-center h-fit items-center px-1 w-[140px] shrink-0">
                <div class="text-center mb-1 flex flex-col items-center">
                    <img src="taca.png" alt="Troféu" class="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'><text y=\'30\' font-size=\'30\'>🏆</text></svg>'">
                    <h2 class="text-[9px] font-extrabold text-yellow-500 uppercase tracking-wider mt-1">Final</h2>
                </div>
                ${renderizarColuna(finalJogo, 'Final', 1)}
            </div>

            <div class="flex flex-1 gap-1.5 justify-end">
                ${renderizarColuna(sfDir, 'Semi', 1)}
                ${renderizarColuna(qfDir, 'Quartas', 2)}
                ${renderizarColuna(r16Dir, 'Oitavas', 4)}
                ${renderizarColuna(r32Dir, '16 av', 8)}
            </div>
        </div>
    `;
}

function renderizarListaDeJogos(fases) {
    const container = document.getElementById('jogos-playoffs-container');
    container.innerHTML = '';
    let totalJogos = 0;

    Object.keys(fases).forEach(chave => {
        fases[chave].jogos.forEach(j => {
            totalJogos++;
            
            let g1 = null; let g2 = null;
            if (j.score) {
                if (Array.isArray(j.score.et)) { g1 = j.score.et[0]; g2 = j.score.et[1]; } 
                else if (Array.isArray(j.score.ft)) { g1 = j.score.ft[0]; g2 = j.score.ft[1]; }
            }
            const jogoIniciado = g1 !== null && g2 !== null;
            
            if (jogoIniciado && j.score && Array.isArray(j.score.p) && j.score.p.length === 2) {
                g1 += ` (${j.score.p[0]})`; g2 += ` (${j.score.p[1]})`;
            }

            const horarioBrasilia = converterParaBrasilia(j.time);
            const badgeTitulo = j.num ? `JOGO ${j.num} • ${fases[chave].titulo}` : fases[chave].titulo;

            container.innerHTML += `
                <div id="match-${j.num || 0}" class="bg-slate-800/50 rounded-xl p-5 border border-slate-700/60 shadow-md flex flex-col justify-between hover:bg-slate-800 transition-all duration-500">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">${badgeTitulo}</span>
                        <span class="text-xs text-slate-400 font-medium">${j.date ? j.date.split('-').reverse().join('/') : ''}</span>
                    </div>
                    <div class="space-y-3 my-4">
                        <div class="flex justify-between items-center text-base">
                            <span class="font-medium text-slate-200 flex items-center gap-2">${obterEmojiBandeira(j.team1)} ${traduzirNomePais(j.team1)}</span>
                            <span class="text-xl font-extrabold text-white">${jogoIniciado ? g1 : '-'}</span>
                        </div>
                        <div class="flex justify-between items-center text-base">
                            <span class="font-medium text-slate-200 flex items-center gap-2">${obterEmojiBandeira(j.team2)} ${traduzirNomePais(j.team2)}</span>
                            <span class="text-xl font-extrabold text-white">${jogoIniciado ? g2 : '-'}</span>
                        </div>
                    </div>
                    <div class="text-[11px] text-slate-500 border-t border-slate-700/40 pt-2 flex justify-between">
                        <span>🏟️ ${j.ground || 'Estádio não definido'}</span>
                        <span class="text-emerald-400 font-semibold">⏰ ${horarioBrasilia}</span>
                    </div>
                </div>
            `;
        });
    });

    if (totalJogos === 0) container.innerHTML = '<p class="text-center text-slate-500 col-span-full py-8">Os confrontos serão listados quando a API liberar o mata-mata!</p>';
}

async function carregarPlayoffs() {
    try {
        const res = await fetch(URL_JOGOS);
        if (res.ok) {
            const dados = await res.json();
            processarPlayoffs(dados);
        } else {
            document.getElementById('jogos-playoffs-container').innerHTML = '<p class="text-red-400 text-center col-span-full">Erro ao conectar com a API.</p>';
        }
    } catch (e) {
        console.error(e);
        document.getElementById('jogos-playoffs-container').innerHTML = '<p class="text-red-400 text-center col-span-full">Erro crítico no script.</p>';
    }
}
carregarPlayoffs();