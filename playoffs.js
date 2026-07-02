//const URL_JOGOS = 'https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json';
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
    container.className = "w-full pb-8"; 

    // Lógica de rastreamento de linhagem
    const ordemEsquerda = [
        "germany", "france", "south africa", "netherlands", 
        "portugal", "spain", "united states", "usa", 
        "bosnia and herzegovina", "bosnia & herzegovina", "belgium",
        "canada", "morocco"
    ];

    const numsEsq = new Set();
    const pertenceAChaveEsquerda = (j) => {
        const t1 = normalizarTexto(j.team1); const t2 = normalizarTexto(j.team2);
        if (ordemEsquerda.includes(t1) || ordemEsquerda.includes(t2)) return true;
        const extrairNum = (txt) => { const m = txt.match(/\d+/); return m ? parseInt(m[0], 10) : null; };
        const n1 = extrairNum(t1); const n2 = extrairNum(t2);
        if (n1 && numsEsq.has(n1)) return true;
        if (n2 && numsEsq.has(n2)) return true;
        return false;
    };

    const r32Esq = []; const r32Dir = [];
    fases["r32"].jogos.forEach(j => { if (pertenceAChaveEsquerda(j)) { r32Esq.push(j); if (j.num) numsEsq.add(j.num); } else r32Dir.push(j); });

    const r16Esq = []; const r16Dir = [];
    fases["r16"].jogos.forEach(j => { if (pertenceAChaveEsquerda(j)) { r16Esq.push(j); if (j.num) numsEsq.add(j.num); } else r16Dir.push(j); });

    const qfEsq = []; const qfDir = [];
    fases["quarter"].jogos.forEach(j => { if (pertenceAChaveEsquerda(j)) { qfEsq.push(j); if (j.num) numsEsq.add(j.num); } else qfDir.push(j); });

    const sfEsq = []; const sfDir = [];
    fases["semi"].jogos.forEach(j => { if (pertenceAChaveEsquerda(j)) sfEsq.push(j); else sfDir.push(j); });
    
    const finalJogo = fases["final"].jogos;

    // 📱 NOVO: Card Ultracompacto (estilo oficial da FIFA)
    const gerarCardCompacto = (j) => {
        let g1 = '-'; let g2 = '-';
        if (j.score) {
            if (Array.isArray(j.score.et)) { g1 = j.score.et[0]; g2 = j.score.et[1]; } 
            else if (Array.isArray(j.score.ft)) { g1 = j.score.ft[0]; g2 = j.score.ft[1]; }
        }
        
        // Pênaltis juntos do placar: ex -> 1(3) - 1(4)
        if (j.score && Array.isArray(j.score.p) && j.score.p.length === 2) {
            g1 += `(${j.score.p[0]})`; g2 += `(${j.score.p[1]})`;
        }

        const dataFormatada = j.date ? j.date.split('-').reverse().slice(0,2).join('/') : '?';
        const horaFormatada = j.time ? j.time.split(' ')[0] : '';
        
        return `
            <div onclick="rolarAteOJogo(${j.num || 0})" class="relative bg-slate-900 rounded-lg p-1.5 md:p-2 border border-slate-700 shadow-sm hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center transition-transform active:scale-95 w-full">
                <span class="absolute top-[2px] left-[4px] text-[8px] md:text-[9px] text-slate-500 font-extrabold tracking-tighter">${j.num ? `#${j.num}` : ''}</span>
                
                <div class="flex justify-center gap-2 md:gap-3 mb-1 mt-1">
                    <span class="text-lg md:text-2xl drop-shadow-md" title="${traduzirNomePais(j.team1)}">${obterEmojiBandeira(j.team1)}</span>
                    <span class="text-lg md:text-2xl drop-shadow-md" title="${traduzirNomePais(j.team2)}">${obterEmojiBandeira(j.team2)}</span>
                </div>
                
                <div class="font-bold text-white text-[10px] md:text-xs tracking-wider mb-0.5 text-center w-full">
                    ${g1} - ${g2}
                </div>
                
                <div class="text-[7px] md:text-[8px] text-slate-400 font-medium whitespace-nowrap">
                    ${dataFormatada} • ${horaFormatada}
                </div>
            </div>
        `;
    };

    const gerarPlaceholder = () => `
        <div class="bg-slate-800/30 rounded-lg p-1.5 md:p-2 border border-slate-700/40 opacity-50 flex flex-col items-center justify-center w-full">
            <div class="flex justify-center gap-2 md:gap-3 mb-1 mt-1 text-slate-600">
                <span class="text-lg md:text-2xl">🛡️</span>
                <span class="text-lg md:text-2xl">🛡️</span>
            </div>
            <div class="font-bold text-slate-600 text-[10px] md:text-xs tracking-wider mb-0.5 text-center">-</div>
            <div class="text-[7px] md:text-[8px] text-slate-600 font-medium">A definir</div>
        </div>
    `;

    // Gerador de Colunas do PC
    const gerarColunaDesktop = (jogos, titulo, placeholders = 0) => {
        let html = `<div class="flex-1 flex flex-col justify-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60 min-w-[120px]">`;
        html += `<h3 class="text-center text-[10px] font-bold uppercase text-emerald-400 mb-1 border-b border-slate-800 pb-1">${titulo}</h3>`;
        jogos.forEach(j => html += gerarCardCompacto(j));
        for (let i = jogos.length; i < placeholders; i++) html += gerarPlaceholder();
        html += `</div>`;
        return html;
    };

    // Gerador de Blocos do Celular (A mágica da grade acontece aqui)
    const gerarBlocoMobile = (jogos, titulo, placeholders, gridClass, limitarLargura = false) => {
        let html = `<div class="flex flex-col items-center w-full">`;
        html += `<h3 class="text-center text-xs font-bold text-slate-300 mb-2 tracking-wide">${titulo}</h3>`;
        html += `<div class="${gridClass}">`;
        
        const gerarConteudo = (j) => limitarLargura ? `<div class="w-full max-w-[130px] mx-auto">${gerarCardCompacto(j)}</div>` : gerarCardCompacto(j);
        const gerarPH = () => limitarLargura ? `<div class="w-full max-w-[130px] mx-auto">${gerarPlaceholder()}</div>` : gerarPlaceholder();

        jogos.forEach(j => html += gerarConteudo(j));
        for (let i = jogos.length; i < placeholders; i++) html += gerarPH();
        
        html += `</div></div>`;
        return html;
    };

    const conectorMobile = `<div class="w-px h-6 bg-slate-700/80 my-2"></div>`;

    container.innerHTML = `
        <div class="hidden md:flex flex-row justify-between items-stretch gap-2 mx-auto min-w-[1000px] max-w-full px-2 overflow-x-auto">
            <div class="flex flex-1 gap-2 justify-start">
                ${gerarColunaDesktop(r32Esq, '16 avos', 8)}
                ${gerarColunaDesktop(r16Esq, 'Oitavas', 4)}
                ${gerarColunaDesktop(qfEsq, 'Quartas', 2)}
                ${gerarColunaDesktop(sfEsq, 'Semi', 1)}
            </div>
            <div class="flex flex-col justify-center items-center px-2 shrink-0">
                <img src="taca.png" alt="Troféu" class="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] mb-2">
                <h2 class="text-[10px] font-extrabold text-yellow-500 uppercase tracking-wider mb-2">Final</h2>
                ${gerarColunaDesktop(finalJogo, '', 1)}
            </div>
            <div class="flex flex-1 gap-2 justify-end">
                ${gerarColunaDesktop(sfDir, 'Semi', 1)}
                ${gerarColunaDesktop(qfDir, 'Quartas', 2)}
                ${gerarColunaDesktop(r16Dir, 'Oitavas', 4)}
                ${gerarColunaDesktop(r32Dir, '16 avos', 8)}
            </div>
        </div>

        <div class="flex md:hidden flex-col items-center w-full px-1.5">
            
            ${gerarBlocoMobile(r32Esq, '16 avos-de-final', 8, 'grid grid-cols-4 gap-1.5 w-full')}
            ${conectorMobile}
            ${gerarBlocoMobile(r16Esq, 'Oitavas de final', 4, 'grid grid-cols-4 gap-1.5 w-full')}
            ${conectorMobile}
            ${gerarBlocoMobile(qfEsq, 'Quartas de final', 2, 'grid grid-cols-2 gap-3 w-4/5 mx-auto')}
            ${conectorMobile}
            ${gerarBlocoMobile(sfEsq, 'Semifinais', 1, 'w-full', true)}
            
            <div class="w-px h-8 bg-yellow-500/50 my-2"></div>
            <div class="flex flex-col items-center w-full bg-slate-900/40 py-4 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <img src="taca.png" alt="Troféu" class="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] mb-2">
                ${gerarBlocoMobile(finalJogo, 'Final', 1, 'w-full', true)}
            </div>
            <div class="w-px h-8 bg-yellow-500/50 my-2"></div>

            ${gerarBlocoMobile(sfDir, 'Semifinais', 1, 'w-full', true)}
            ${conectorMobile}
            ${gerarBlocoMobile(qfDir, 'Quartas de final', 2, 'grid grid-cols-2 gap-3 w-4/5 mx-auto')}
            ${conectorMobile}
            ${gerarBlocoMobile(r16Dir, 'Oitavas de final', 4, 'grid grid-cols-4 gap-1.5 w-full')}
            ${conectorMobile}
            ${gerarBlocoMobile(r32Dir, '16 avos-de-final', 8, 'grid grid-cols-4 gap-1.5 w-full')}
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

            const placar1 = jogoIniciado ? g1 : '-';
            const placar2 = jogoIniciado ? g2 : '-';

            const horarioBrasilia = converterParaBrasilia(j.time);
            const badgeTitulo = j.num ? `JOGO ${j.num} • ${fases[chave].titulo}` : fases[chave].titulo;
            const dataFormatada = j.date ? j.date.split('-').reverse().join('/') : '';

            // 🧠 NOVA LÓGICA: Agrupamento de gols por jogador
            const formatarGols = (golsArr) => {
                if (!golsArr || !Array.isArray(golsArr) || golsArr.length === 0) return '';
                
                const golsAgrupados = {};
                
                golsArr.forEach(g => {
                    const nomeJogador = g.name || "Desconhecido";
                    if (!golsAgrupados[nomeJogador]) {
                        golsAgrupados[nomeJogador] = [];
                    }
                    const infoExtra = g.penalty ? ' (P)' : g.owngoal ? ' (GC)' : '';
                    golsAgrupados[nomeJogador].push(`${g.minute}'${infoExtra}`);
                });

                return Object.keys(golsAgrupados).map(nome => {
                    const minutosFormatados = golsAgrupados[nome].join(', ');
                    return `<div class="truncate" title="${nome}">⚽ ${nome} <span class="font-bold text-slate-300">${minutosFormatados}</span></div>`;
                }).join('');
            };

            const listaGolsCasa = formatarGols(j.goals1);
            const listaGolsFora = formatarGols(j.goals2);

            container.innerHTML += `
                <div id="match-${j.num || 0}" class="bg-slate-800/50 rounded-xl p-5 border border-slate-700/60 shadow-md flex flex-col hover:bg-slate-800 transition-all duration-500">
                    <div class="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-2">
                        <span class="text-[10px] md:text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">${badgeTitulo}</span>
                        <span class="text-xs text-slate-400 font-medium">${dataFormatada}</span>
                    </div>
                    
                    <div class="flex justify-between items-start my-2 text-base h-full">
                        
                        <div class="flex-1 flex flex-col text-center border-r border-slate-700/40 pr-2">
                            <div class="flex justify-center items-center gap-1.5 mb-1.5">
                                <span class="text-xl">${obterEmojiBandeira(j.team1)}</span>
                                <span class="font-semibold text-slate-200 text-sm md:text-base truncate max-w-[100px] md:max-w-none" title="${traduzirNomePais(j.team1)}">${traduzirNomePais(j.team1)}</span>
                            </div>
                            <div class="text-3xl font-extrabold text-white mb-3">${placar1}</div>
                            <div class="text-[10px] md:text-xs text-slate-400 space-y-1 mt-auto">
                                ${listaGolsCasa}
                            </div>
                        </div>

                        <div class="flex-1 flex flex-col text-center pl-2">
                            <div class="flex justify-center items-center gap-1.5 mb-1.5">
                                <span class="font-semibold text-slate-200 text-sm md:text-base truncate max-w-[100px] md:max-w-none" title="${traduzirNomePais(j.team2)}">${traduzirNomePais(j.team2)}</span>
                                <span class="text-xl">${obterEmojiBandeira(j.team2)}</span>
                            </div>
                            <div class="text-3xl font-extrabold text-white mb-3">${placar2}</div>
                            <div class="text-[10px] md:text-xs text-slate-400 space-y-1 mt-auto">
                                ${listaGolsFora}
                            </div>
                        </div>

                    </div>

                    <div class="text-[11px] text-slate-500 border-t border-slate-700/40 pt-3 mt-4 flex justify-between">
                        <span class="truncate pr-2">🏟️ ${j.ground || 'Estádio não definido'}</span>
                        <span class="text-emerald-400 font-semibold shrink-0">⏰ ${horarioBrasilia}</span>
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