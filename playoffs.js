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

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function obterEmojiBandeira(nomePais) {
    const chave = normalizarTexto(nomePais);
    return DICIONARIO_BANDEIRAS[chave] || "🏳️";
}

function converterParaBrasilia(horarioOriginal) {
    if (!horarioOriginal) return "Horário a definir";
    try {
        const partes = horarioOriginal.toString().trim().split(" ");
        if (partes.length < 2) return horarioOriginal;

        const [horaStr, minutoStr] = partes[0].split(":");
        let horas = parseInt(horaStr, 10);
        const minutos = minutoStr;

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
        return `${horaFinal}:${minutos} BRT`;
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
        "quarter": { titulo: "Quartas", jobs: [], jogos: [] },
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

    const dividirChave = (jogos) => {
        const metade = Math.ceil(jogos.length / 2);
        return [jogos.slice(0, metade), jogos.slice(metade)];
    };

    const [r32Esq, r32Dir] = dividirChave(fases["r32"].jogos);
    const [r16Esq, r16Dir] = dividirChave(fases["r16"].jogos);
    const [qfEsq, qfDir] = dividirChave(fases["quarter"].jogos);
    const [sfEsq, sfDir] = dividirChave(fases["semi"].jogos);
    const finalJogo = fases["final"].jogos;

    const renderizarColuna = (jogos, titulo, placeholders = 0) => {
        let html = `<div class="flex-1 flex flex-col justify-center self-center h-fit gap-2.5 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800/60 min-w-[145px]">`;
        html += `<h3 class="text-center text-[10px] font-bold uppercase text-emerald-400 border-b border-slate-800 pb-0.5 mb-0.5 truncate">${titulo}</h3>`;
        
        if (jogos.length === 0 && placeholders === 0) {
            html += `<p class="text-center text-[10px] text-slate-600 my-auto italic">?</p>`;
        } else {
            jogos.forEach(j => {
                // CORREÇÃO: Busca primeiro o placar da prorrogação (et), se não houver, busca o tempo normal (ft)
                let g1 = '-';
                let g2 = '-';
                if (j.score) {
                    if (Array.isArray(j.score.et)) {
                        g1 = j.score.et[0];
                        g2 = j.score.et[1];
                    } else if (Array.isArray(j.score.ft)) {
                        g1 = j.score.ft[0];
                        g2 = j.score.ft[1];
                    }
                }
                
                // CORREÇÃO CRÍTICA: Troca '.ps' por '.p' para alinhar perfeitamente com a API do GitHub
                if (j.score && Array.isArray(j.score.p) && j.score.p.length === 2) {
                    g1 += ` (${j.score.p[0]})`;
                    g2 += ` (${j.score.p[1]})`;
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
                            <span class="truncate pr-0.5 text-slate-200" title="${j.team1 || 'A definir'}">
                                ${obterEmojiBandeira(j.team1)} <span>${j.team1 || '?'}</span>
                            </span>
                            <span class="font-bold text-white bg-slate-900 px-1.5 rounded text-xs shrink-0">${g1}</span>
                        </div>
                        <div class="flex justify-between items-center gap-1">
                            <span class="truncate pr-0.5 text-slate-200" title="${j.team2 || 'A definir'}">
                                ${obterEmojiBandeira(j.team2)} <span>${j.team2 || '?'}</span>
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
            
            // CORREÇÃO: Lógica de prorrogação e tempo normal replicada na lista inferior
            let g1 = null;
            let g2 = null;
            if (j.score) {
                if (Array.isArray(j.score.et)) {
                    g1 = j.score.et[0];
                    g2 = j.score.et[1];
                } else if (Array.isArray(j.score.ft)) {
                    g1 = j.score.ft[0];
                    g2 = j.score.ft[1];
                }
            }
            const jogoIniciado = g1 !== null && g2 !== null;
            
            // CORREÇÃO CRÍTICA: Troca '.ps' por '.p' nos cards de detalhes também
            if (jogoIniciado && j.score && Array.isArray(j.score.p) && j.score.p.length === 2) {
                g1 += ` (${j.score.p[0]})`;
                g2 += ` (${j.score.p[1]})`;
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
                            <span class="font-medium text-slate-200 flex items-center gap-2">${obterEmojiBandeira(j.team1)} ${j.team1 || 'A definir'}</span>
                            <span class="text-xl font-extrabold text-white">${jogoIniciado ? g1 : '-'}</span>
                        </div>
                        <div class="flex justify-between items-center text-base">
                            <span class="font-medium text-slate-200 flex items-center gap-2">${obterEmojiBandeira(j.team2)} ${j.team2 || 'A definir'}</span>
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