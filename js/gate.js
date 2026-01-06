document.addEventListener('DOMContentLoaded', function () {

    /* =====================================================
       CONSTANTES
    ===================================================== */
    const STEPS = [
        "Step 01","Step 02","Step 03","Step 04","Step 05",
        "Banco","Rear Wall","Console","Porta","IPV"
    ];

    /* =====================================================
       ELEMENTOS
    ===================================================== */
    const gateTableBody = document.getElementById('gateTableBody');

    const turnoSelect   = document.getElementById('turnoSelect');
    const startTurnoBtn = document.getElementById('startTurnoBtn');
    const endTurnoBtn   = document.getElementById('endTurnoBtn');
    const turnoStatus   = document.getElementById('turnoStatus');

    const metaInput     = document.getElementById('metaSeriesInput');

    const dashSeries    = document.getElementById('dashSeries');
    const dashSteps     = document.getElementById('dashSteps');
    const dashPercent   = document.getElementById('dashPercent');
    const progressFill = document.getElementById('progressFill');

    const logoutBtn     = document.getElementById('logoutBtn');

    let turnoAtual = null;

    /* =====================================================
       TURNO
    ===================================================== */
    function carregarTurno() {

        const salvo = localStorage.getItem('prostep_turno_atual');
        turnoAtual = salvo ? JSON.parse(salvo) : null;

        if (!turnoAtual || turnoAtual.encerrado) {
            turnoStatus.textContent = 'Nenhum turno ativo';
            endTurnoBtn.disabled = true;
            metaInput.disabled = true;
            metaInput.value = '';
        } else {
            turnoStatus.textContent = `Turno ${turnoAtual.turno} em andamento`;
            endTurnoBtn.disabled = false;
            metaInput.disabled = false;
            metaInput.value = turnoAtual.meta || '';
        }

        atualizarDashboard();
    }

    startTurnoBtn.onclick = () => {

        if (!turnoSelect.value) {
            alert('Selecione um turno');
            return;
        }

        turnoAtual = {
            turno: turnoSelect.value,
            inicioISO: new Date().toISOString(),
            encerrado: false,
            meta: 0
        };

        localStorage.setItem(
            'prostep_turno_atual',
            JSON.stringify(turnoAtual)
        );

        carregarTurno();
    };

    /* =====================================================
       ENCERRAR TURNO (RELATÓRIO)
    ===================================================== */
    endTurnoBtn.onclick = () => {

        if (!confirm('Encerrar turno e gerar relatório?')) return;

        gerarRelatorioExcelUnico();

        localStorage.removeItem('prostep_confirmacoes_gate');
        localStorage.removeItem('prostep_turno_atual');

        gateTableBody.innerHTML = '';
        carregarTurno();
        atualizarDashboard();
    };

    /* =====================================================
       META DO TURNO
    ===================================================== */
    metaInput.addEventListener('input', function () {

        if (!turnoAtual || turnoAtual.encerrado) return;

        const valor = Math.max(0, Math.min(99, Number(this.value)));

        turnoAtual.meta = valor;

        localStorage.setItem(
            'prostep_turno_atual',
            JSON.stringify(turnoAtual)
        );

        atualizarDashboard();
    });

    /* =====================================================
       TABELA GATE (COM CONFIRMAÇÃO MANUAL)
    ===================================================== */
    function carregarTabela() {

        gateTableBody.innerHTML = '';

        const confirmacoes = JSON.parse(
            localStorage.getItem('prostep_confirmacoes_gate') || '[]'
        );

        const series = [...new Set(confirmacoes.map(c => c.numeroSerie))];

        series.forEach(serie => {

            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${serie}</td>`;

            const confirmados = STEPS.map(step =>
                confirmacoes.some(c =>
                    c.numeroSerie === serie && c.step === step
                )
            );

            STEPS.forEach((step, i) => {

                const td = document.createElement('td');

                if (confirmados[i]) {

                    td.classList.add('status-green');

                    const c = confirmacoes.find(x =>
                        x.numeroSerie === serie && x.step === step
                    );

                    if (c) {
                        td.textContent = c.matricula || '';
                        td.title = new Date(c.dataISO).toLocaleString();
                    }

                } else if (confirmados.slice(i + 1).some(v => v)) {

                    // BURACO → VERMELHO → GATE PODE CONFIRMAR
                    td.classList.add('status-red');
                    td.title = 'Clique para confirmar (GATE)';

                    td.onclick = () => {

                        if (!confirm(`Confirmar ${step} da série ${serie}?`)) return;

                        confirmacoes.push({
                            numeroSerie: serie,
                            step,
                            matricula: sessionStorage.getItem('prostep_matricula') || 'GATE',
                            origem: 'GATE',
                            dataISO: new Date().toISOString()
                        });

                        localStorage.setItem(
                            'prostep_confirmacoes_gate',
                            JSON.stringify(confirmacoes)
                        );

                        carregarTabela();
                        atualizarDashboard();
                    };
                }

                tr.appendChild(td);
            });

            gateTableBody.appendChild(tr);
        });
    }

    /* =====================================================
       DASHBOARD DO TURNO (BASEADO EM STEP)
    ===================================================== */
    function atualizarDashboard() {

        const confirmacoes = JSON.parse(
            localStorage.getItem('prostep_confirmacoes_gate') || '[]'
        );

        if (!turnoAtual || !turnoAtual.meta) {
            dashSeries.textContent  = '0';
            dashSteps.textContent   = '0';
            dashPercent.textContent = '0%';
            progressFill.style.width = '0%';
            return;
        }

        const meta = turnoAtual.meta;
        const totalEsperado = meta * STEPS.length;

        const contador = {};
        STEPS.forEach(s => contador[s] = new Set());

        confirmacoes.forEach(c => {
            if (contador[c.step]) contador[c.step].add(c.numeroSerie);
        });

        let totalConfirmado = 0;
        STEPS.forEach(step => {
            totalConfirmado += Math.min(contador[step].size, meta);
        });

        const percentual = Math.round(
            (totalConfirmado / totalEsperado) * 100
        );

        dashSeries.textContent  = meta;
        dashSteps.textContent   = totalConfirmado;
        dashPercent.textContent = `${percentual}%`;
        progressFill.style.width = `${percentual}%`;
    }

    /* =====================================================
       RELATÓRIO EXCEL ÚNICO (3 PLANILHAS)
    ===================================================== */
    function gerarRelatorioExcelUnico() {

        const confirmacoes = JSON.parse(
            localStorage.getItem('prostep_confirmacoes_gate') || '[]'
        );

        const wb = XLSX.utils.book_new();

        /* ABA 1 – RESUMO POR STEP */
        const resumo = STEPS.map(step => {

            const qtd = new Set(
                confirmacoes.filter(c => c.step === step).map(c => c.numeroSerie)
            ).size;

            return {
                Turno: turnoAtual.turno,
                Step: step,
                Meta: turnoAtual.meta,
                Confirmados: qtd,
                Percentual: turnoAtual.meta
                    ? `${Math.round((qtd / turnoAtual.meta) * 100)}%`
                    : '0%'
            };
        });

        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(resumo),
            'Resumo por Step'
        );

        /* ABA 2 – DETALHADO */
        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(confirmacoes.map(c => ({
                Turno: turnoAtual.turno,
                Serie: c.numeroSerie,
                Step: c.step,
                Matricula: c.matricula,
                Origem: c.origem,
                DataHora: new Date(c.dataISO).toLocaleString()
            }))),
            'Detalhado'
        );

        /* ABA 3 – TURNO */
        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet([{
                Turno: turnoAtual.turno,
                Inicio: new Date(turnoAtual.inicioISO).toLocaleString(),
                Fim: new Date().toLocaleString(),
                Meta: turnoAtual.meta,
                TotalConfirmacoes: confirmacoes.length
            }]),
            'Turno'
        );

        XLSX.writeFile(
            wb,
            `Relatorio_Turno_${turnoAtual.turno}.xlsx`
        );
    }

    /* =====================================================
       EVENTOS GLOBAIS
    ===================================================== */
    window.addEventListener('storage', () => {
        carregarTurno();
        carregarTabela();
    });

    /* =====================================================
       LOGOUT
    ===================================================== */
    logoutBtn.onclick = () => {
        if (!confirm('Sair do sistema?')) return;
        sessionStorage.clear();
        window.location.href = 'index.html';
    };

    /* =====================================================
       INIT
    ===================================================== */
    carregarTurno();
    carregarTabela();
    atualizarDashboard();
});


