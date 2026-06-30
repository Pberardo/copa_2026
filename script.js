// URLs Oficiais do repositório openfootball
const URL_GRUPOS = 'https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.groups.json';
const URL_JOGOS = 'https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json';

// 🇧🇷 DICIONÁRIO DE BANDEIRAS
const DICIONARIO_BANDEIRAS = {
    "mexico": "🇲🇽", "africa do sul": "🇿🇦", "coreia do sul": "🇰🇷", "republica tcheca": "🇨🇿",
    "suica": "🇨🇭", "canada": "🇨🇦", "bosnia e herzegovina": "🇧🇦", "bosnia e hezergovina": "🇧🇦",
    "catar": "🇶🇦", "brasil": "🇧🇷", "marrocos": "🇲🇦", "escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "haiti": "🇭🇹", "estados unidos": "🇺🇸", "australia": "🇦🇺", "paraguai": "🇵🇾",
    "turquia": "🇹🇷", "alemanha": "🇩🇪", "costa do marfim": "🇨🇮", "equador": "🇪🇨", "holanda": "🇳🇱",
    "japao": "🇯🇵", "suecia": "🇸🇪", "tunisia": "🇹🇳", "belgica": "🇧🇪", "egito": "🇪🇬",
    "ira": "🇮🇷", "nova zelandia": "🇳🇿", "espanha": "🇪🇸", "cabo verde": "🇨🇻", "arabia saudita": "🇸🇦",
    "uruguai": "🇺🇾", "franca": "🇫🇷", "senegal": "🇸🇳", "iraque": "🇮🇶", "noruega": "🇳🇴",
    "argelia": "🇩🇿", "argentina": "🇦🇷", "austria": "🇦🇹", "jordania": "🇯🇴", "portugal": "🇵🇹",
    "rd congo": "🇨🇩", "curacao": "🇨🇼", "uzbequistao": "🇺🇿", "colombia": "🇨🇴", "inglaterra": "🏴󠁧󠁢󠁥󠁮ッグ󠁿", 
    "croacia": "🇭🇷", "gana": "🇬🇭", "panama": "🇵🇦"
};

// 🗺️ DICIONÁRIO COMPLETO DE TRADUÇÃO E UNIFICAÇÃO
const TRADUCAO_PAISES = {
    "germany": "Alemanha", "paraguay": "Paraguai", "france": "França", "sweden": "Suécia",
    "south africa": "África do Sul", "canada": "Canadá", "netherlands": "Holanda", "morocco": "Marrocos",
    "portugal": "Portugal", "croatia": "Croácia", "spain": "Espanha", "austria": "Áustria",
    "united states": "Estados Unidos", "usa": "Estados Unidos", 
    "bosnia & herzegovina": "Bósnia e Herzegovina", "bosnia and herzegovina": "Bósnia e Herzegovina", 
    "bosnia-herzegovina": "Bósnia e Herzegovina", "bosnia": "Bósnia e Herzegovina", 
    "belgium": "Bélgica", "senegal": "Senegal", "brazil": "Brasil", "japan": "Japão", 
    "ivory coast": "Costa do Marfim", "cote d'ivoire": "Costa do Marfim", "norway": "Noruega", 
    "mexico": "México", "ecuador": "Equador", "england": "Inglaterra", "dr congo": "RD Congo", 
    "congo dr": "RD Congo", "congo": "RD Congo", "argentina": "Argentina", "cape verde": "Cabo Verde", 
    "australia": "Austrália", "egypt": "Egito", "switzerland": "Suíça", "algeria": "Argélia", 
    "colombia": "Colômbia", "ghana": "Gana", "south korea": "Coreia do Sul", "korea republic": "Coreia do Sul",
    "czech republic": "República Tcheca", "czechia": "República Tcheca", "qatar": "Catar", "catar": "Catar",
    "scotland": "Escócia", "haiti": "Haiti", "turkey": "Turquia", "tunisia": "Tunísia",
    "iran": "Irã", "new zealand": "Nova Zelândia", "saudi arabia": "Arábia Saudita",
    "uruguay": "Uruguai", "iraq": "Iraque", "jordan": "Jordânia", "curacao": "Curaçao",
    "uzbekistan": "Uzbequistão", "panama": "Panamá"
};

const BANCO_FAIR_PLAY = {};

function calcularPontosFairPlay(nomePais) {
    const dados = BANCO_FAIR_PLAY[nomePais] || { amarelos: 0, verm_indiretos: 0, verm_diretos: 0, am_mais_verd: 0 };
    return (dados.amarelos * -1) + (dados.verm_indiretos * -3) + (dados.verm_diretos * -4) + (dados.am_mais_verd * -5);
}

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function traduzirNomePais(nomePais) {
    if (!nomePais) return "";
    const chave = normalizarTexto(nomePais);
    return TRADUCAO_PAISES[chave] || nomePais;
}

function obterEmojiBandeira(nomePais) {
    const chave = normalizarTexto(nomePais);
    return DICIONARIO_BANDEIRAS[chave] || "🏳️"; 
}

function cruzarDados(dadosGrupos, dadosJogos) {
    const grupos = {};

    // MODIFICAÇÃO CRÍTICA: Bloqueia termos como W75, W16, etc. (^w\d+)
    function ehTimeValido(nome) {
        if (!nome) return false;
        const n = nome.toString().trim().toLowerCase();
        if (n.includes("/") || n.match(/^[0-9]/) || n.match(/^w\d+/) || n.includes("winner") || n.includes("vencedor") || n === "tbd" || n === "?" || n.includes("a definir")) return false;
        return true;
    }

    const listaGrupos = (dadosGrupos && Array.isArray(dadosGrupos.groups)) ? dadosGrupos.groups : [];
    listaGrupos.forEach(g => {
        const nomeGrupo = g.name || g.title || "Grupo";
        if (!nomeGrupo.toUpperCase().includes("GROUP") && !nomeGrupo.toUpperCase().includes("GRUPO")) return; 

        grupos[nomeGrupo] = { selecoes: {}, jogos: [] };
        const times = g.teams || g.teams_string || [];
        
        if (Array.isArray(times)) {
            times.forEach(t => {
                let nomePaisOriginal = (typeof t === 'object' && t !== null) ? (t.name || t.title) : t;
                if (ehTimeValido(nomePaisOriginal)) {
                    let nomeTraduzido = traduzirNomePais(nomePaisOriginal);
                    const chaveNormalizada = normalizarTexto(nomeTraduzido);
                    grupos[nomeGrupo].selecoes[chaveNormalizada] = {
                        nome: nomeTraduzido, pontos: 0, saldo_geral: 0, gols_geral: 0, jogos_contados: 0
                    };
                }
            });
        }
    });

    const matches = (dadosJogos && Array.isArray(dadosJogos.matches)) ? dadosJogos.matches : [];
    matches.forEach(partida => {
        const nomeCasaOriginal = partida.team1 || partida.home_team || (partida.team && partida.team.name);
        const nomeForaOriginal = partida.team2 || partida.away_team;
        
        if (!ehTimeValido(nomeCasaOriginal) || !ehTimeValido(nomeForaOriginal)) return;

        const nomeCasa = traduzirNomePais(nomeCasaOriginal);
        const nomeFora = traduzirNomePais(nomeForaOriginal);

        const chaveCasa = normalizarTexto(nomeCasa);
        const chaveFora = normalizarTexto(nomeFora);

        const grupoCasaOriginal = Object.keys(grupos).find(gNome => grupos[gNome] && grupos[gNome].selecoes[chaveCasa]);
        const grupoForaOriginal = Object.keys(grupos).find(gNome => grupos[gNome] && grupos[gNome].selecoes[chaveFora]);

        if (grupoCasaOriginal && grupoForaOriginal && grupoCasaOriginal !== grupoForaOriginal) return;

        let grupoPertencente = grupoCasaOriginal || grupoForaOriginal;
        if (!grupoPertencente && (partida.group || partida.grupo)) {
            const pGroup = (partida.group || partida.grupo).toString().toUpperCase().trim();
            grupoPertencente = Object.keys(grupos).find(gNome => gNome.toUpperCase().trim() === pGroup);
        }

        if (!grupoPertencente || !grupos[grupoPertencente]) return;

        [ {chave: chaveCasa, nome: nomeCasa}, {chave: chaveFora, nome: nomeFora} ].forEach(obj => {
            if (obj.chave && ehTimeValido(obj.nome) && !grupos[grupoPertencente].selecoes[obj.chave]) {
                grupos[grupoPertencente].selecoes[obj.chave] = {
                    nome: obj.nome, pontos: 0, saldo_geral: 0, gols_geral: 0, jogos_contados: 0
                };
            }
        });

        let golsCasa = null; let golsFora = null;
        if (partida.score && Array.isArray(partida.score.ft) && partida.score.ft.length === 2) {
            golsCasa = partida.score.ft[0]; golsFora = partida.score.ft[1];
        } else if (partida.score1 !== undefined && partida.score1 !== null) {
            golsCasa = partida.score1; golsFora = partida.score2;
        }

        const jogoEncerrado = golsCasa !== null && golsFora !== null && !isNaN(golsCasa) && !isNaN(golsFora);

        if (jogoEncerrado) {
            const timeCasa = grupos[grupoPertencente].selecoes[chaveCasa];
            const timeFora = grupos[grupoPertencente].selecoes[chaveFora];

            if (timeCasa && timeFora) {
                const gc = Number(golsCasa); const gf = Number(golsFora);
                timeCasa.gols_geral += gc; timeFora.gols_geral += gf;
                timeCasa.jogos_contados++; timeFora.jogos_contados++;
                timeCasa.saldo_geral += (gc - gf); timeFora.saldo_geral += (gf - gc);

                if (gc > gf) { timeCasa.pontos += 3; } else if (gf > gc) { timeFora.pontos += 3; } else { timeCasa.pontos += 1; timeFora.pontos += 1; }
                grupos[grupoPertencente].jogos.push({ casa: timeCasa.nome, fora: timeFora.nome, golsCasa: gc, golsFora: gf });
            }
        }
    });

    return grupos;
}

function ordenarSelecoesDoGrupo(selecoesArray, jogosDoGrupo) {
    selecoesArray.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        const jogoDireto = jogosDoGrupo.find(j => (j.casa === a.nome && j.fora === b.nome) || (j.casa === b.nome && j.fora === a.nome));
        
        if (jogoDireto) {
            let ptsA = 0, ptsB = 0, gpA = 0, gpB = 0;
            if (jogoDireto.casa === a.nome) { gpA = jogoDireto.golsCasa; gpB = jogoDireto.golsFora; } 
            else { gpA = jogoDireto.golsFora; gpB = jogoDireto.golsCasa; }
            let sgA = gpA - gpB; let sgB = gpB - gpA;
            if (gpA > gpB) ptsA = 3; else if (gpB > gpA) ptsB = 3; else { ptsA = 1; ptsB = 1; }

            if (ptsB !== ptsA) return ptsB - ptsA;
            if (sgB !== sgA) return sgB - sgA;
            if (gpB !== gpA) return gpB - gpA;
        }

        if (b.saldo_geral !== a.saldo_geral) return b.saldo_geral - a.saldo_geral;
        if (b.gols_geral !== a.gols_geral) return b.gols_geral - a.gols_geral;

        const fpA = calcularPontosFairPlay(a.nome); const fpB = calcularPontosFairPlay(b.nome);
        if (fpB !== fpA) return fpB - fpA;
        return 0;
    });
}

function obterMelhoresTerceiros(gruposProcessados) {
    const todosOsTerceiros = [];
    Object.keys(gruposProcessados).forEach(grupoNome => {
        const selecoesArray = Object.values(gruposProcessados[grupoNome].selecoes);
        const jogosDoGrupo = gruposProcessados[grupoNome].jogos;
        if (selecoesArray.length < 3) return;
        ordenarSelecoesDoGrupo(selecoesArray, jogosDoGrupo);
        if (selecoesArray[2]) todosOsTerceiros.push({ ...selecoesArray[2], jogosDoSeuGrupo: jogosDoGrupo });
    });

    todosOsTerceiros.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.saldo_geral !== a.saldo_geral) return b.saldo_geral - a.saldo_geral;
        if (b.gols_geral !== a.gols_geral) return b.gols_geral - a.gols_geral;

        const jogoDireto = a.jogosDoSeuGrupo.find(j => (j.casa === a.nome && j.fora === b.nome) || (j.casa === b.nome && j.fora === a.nome));
        if (jogoDireto) {
            let ptsA = 0, ptsB = 0, gpA = 0, gpB = 0;
            if (jogoDireto.casa === a.nome) { gpA = jogoDireto.golsCasa; gpB = jogoDireto.golsFora; } 
            else { gpA = lookup; gpA = jogoDireto.golsFora; gpB = jogoDireto.golsCasa; }
            let sgA = gpA - gpB; let sgB = gpB - gpA;
            if (gpA > gpB) ptsA = 3; else if (gpB > gpA) ptsB = 3; else { ptsA = 1; ptsB = 1; }
            if (ptsB !== ptsA) return ptsB - ptsA;
            if (sgB !== sgA) return sgB - sgA;
            if (gpB !== gpA) return gpB - gpA;
        }

        const fpA = calcularPontosFairPlay(a.nome); const fpB = calcularPontosFairPlay(b.nome);
        if (fpB !== fpA) return fpB - fpA;
        return 0;
    });
    return todosOsTerceiros.slice(0, 8).map(time => time.nome);
}

function renderizarGrupos(gruposProcessados, container, melhoresTerceirosNomes) {
    container.innerHTML = '';
    Object.keys(gruposProcessados).forEach(grupoNome => {
        const selecoesArray = Object.values(gruposProcessados[grupoNome].selecoes);
        const jogosDoGrupo = gruposProcessados[grupoNome].jogos;
        if (selecoesArray.length === 0) return;

        ordenarSelecoesDoGrupo(selecoesArray, jogosDoGrupo);

        let tabelaHTML = `<div class="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg">
            <h2 class="text-xl font-bold mb-3 text-emerald-300">${grupoNome}</h2>
            <table class="w-full text-left text-sm">
                <thead><tr class="text-slate-400 text-xs uppercase border-b border-slate-700"><th class="py-2">Pos</th><th>País</th><th class="text-center">P</th><th class="text-center">SG</th><th class="text-center">GP</th></tr></thead>
                <tbody>`;

        selecoesArray.forEach((time, index) => {
            const ehTop2 = index < 2; const ehMelhorTerceiro = index === 2 && melhoresTerceirosNomes.includes(time.nome);
            let estiloLinha = ehTop2 ? 'bg-emerald-950/30 text-emerald-200 font-semibold' : (ehMelhorTerceiro ? 'bg-yellow-500/20 text-yellow-200 font-bold' : 'text-slate-400');
            const emojiBandeira = obterEmojiBandeira(time.nome);

            tabelaHTML += `<tr class="${estiloLinha} border-b border-slate-700/40 hover:bg-slate-700/10 transition-colors">
                <td class="py-2.5 pl-1">${index + 1}</td>
                <td class="whitespace-nowrap"><span class="text-base mr-1.5 align-middle">${emojiBandeira}</span><span class="align-middle">${time.nome}</span> ${ehMelhorTerceiro ? '<span class="text-[10px] bg-yellow-500/30 text-yellow-300 px-1 rounded ml-1 align-middle font-normal">Repescagem</span>' : ''}</td>
                <td class="text-center font-bold text-white align-middle">${time.pontos}</td>
                <td class="text-center align-middle">${time.saldo_geral > 0 ? '+' + time.saldo_geral : time.saldo_geral}</td>
                <td class="text-center align-middle">${time.gols_geral}</td>
            </tr>`;
        });
        tabelaHTML += `</tbody></table></div>`;
        container.innerHTML += tabelaHTML;
    });
}

async function carregarSiteCopa() {
    const container = document.getElementById('grupos-container');
    try {
        const [resGrupos, resJogos] = await Promise.all([fetch(URL_GRUPOS), fetch(URL_JOGOS)]);
        if (resGrupos.ok && resJogos.ok) {
            const dadosGrupos = await resGrupos.json(); const dadosJogos = await resJogos.json();
            const gruposProcessados = cruzarDados(dadosGrupos, dadosJogos);
            const melhoresTerceirosNomes = obterMelhoresTerceiros(gruposProcessados);
            renderizarGrupos(gruposProcessados, container, melhoresTerceirosNomes);
        } else { container.innerHTML = '<p class="text-red-400 text-center col-span-full">Erro na API.</p>'; }
    } catch (e) {
        console.error("Erro no processamento:", e);
        container.innerHTML = '<p class="text-red-400 text-center col-span-full">Erro crítico no script.</p>';
    }
}
carregarSiteCopa();