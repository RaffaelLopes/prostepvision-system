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
    const serialNumberDisplay = document.getElementById('serialNumberDisplay');
    const currentStepDisplay = document.getElementById('currentStepDisplay');
    const confirmBtn = document.getElementById('confirmBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const stepItems = document.querySelectorAll('.step-item');
    const operationBox = document.querySelector('.operation-box');

    /* =====================================================
       DADOS DE SESSÃO
    ===================================================== */
    const matricula = sessionStorage.getItem('prostep_matricula');
    const numeroSerie = sessionStorage.getItem('prostep_serie');
    const stepAtual = sessionStorage.getItem('prostep_step');

    if (!matricula || !numeroSerie || !stepAtual) {
        alert('Sessão inválida');
        window.location.href = 'index.html';
        return;
    }

    serialNumberDisplay.textContent = numeroSerie;
    currentStepDisplay.textContent = stepAtual;

    const indexAtual = STEPS.indexOf(stepAtual);

    /* =====================================================
       CHECKLIST
    ===================================================== */
    let checklistConcluido = false;
    let checklistUL = null;

    function carregarChecklist() {

        operationBox.innerHTML = '';
        checklistConcluido = false;

        checklistUL = document.createElement('ul');

        const lista = window.CHECKLIST_POR_STEP[stepAtual] || [];

        lista.forEach(texto => {

            const li = document.createElement('li');
            li.textContent = texto;

            li.onclick = () => {
                li.classList.toggle('check-ok');

                if (li.classList.contains('check-ok')) {
                    li.style.backgroundColor = '#D4F4DD';
                    li.style.borderLeft = '5px solid #37C239';
                } else {
                    li.style.backgroundColor = '#FFEBA4';
                    li.style.borderLeft = '5px solid #0f0f0f';
                }

                validarChecklist();
            };

            checklistUL.appendChild(li);
        });

        operationBox.appendChild(checklistUL);
        validarChecklist();
    }

    function validarChecklist() {
        const itens = checklistUL.querySelectorAll('li');
        checklistConcluido = [...itens].every(li =>
            li.classList.contains('check-ok')
        );
        atualizarBotao();
    }

    /* =====================================================
       TURNO
    ===================================================== */
    function turnoAtivo() {
        const t = localStorage.getItem('prostep_turno_atual');
        if (!t) return false;
        return !JSON.parse(t).encerrado;
    }

    /* =====================================================
       CONFIRMAÇÕES
    ===================================================== */
    function obterConfirmacoes() {
        return JSON.parse(
            localStorage.getItem('prostep_confirmacoes_gate') || '[]'
        );
    }

    function stepConfirmado(step) {
        return obterConfirmacoes().some(c =>
            c.numeroSerie === numeroSerie && c.step === step
        );
    }

    /* =====================================================
       STATUS DOS STEPS (REGRA FINAL)
    ===================================================== */
    function atualizarStatusSteps() {

        const confirmacoes = obterConfirmacoes();

        stepItems.forEach((item, i) => {

            const ind = item.querySelector('.status-indicator');
            ind.className = 'status-indicator status-white';

            const nome = item.dataset.step;
            const confirmado = confirmacoes.some(c =>
                c.numeroSerie === numeroSerie && c.step === nome
            );

            // confirmado
            if (confirmado) {
                ind.className = 'status-indicator status-green';
                return;
            }

            // BURACO: step anterior ao atual não confirmado
            if (i < indexAtual) {
                ind.className = 'status-indicator status-red';
                return;
            }

            // step atual em execução
            if (nome === stepAtual) {
                ind.className = 'status-indicator status-orange';
            }
        });
    }

    /* =====================================================
       BOTÃO CONFIRMAR
    ===================================================== */
    function atualizarBotao() {

        if (!turnoAtivo()) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '🔒';
            confirmBtn.style.background = '#E73A33';
            return;
        }

        if (!checklistConcluido) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '🔒';
            confirmBtn.style.background = '#ADB5BD';
            return;
        }

        if (stepConfirmado(stepAtual)) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = 'Confirmado';
            confirmBtn.style.background = '#37C239';
            return;
        }

        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirmar';
        confirmBtn.style.background = '';
    }

    /* =====================================================
       CONFIRMAR STEP
    ===================================================== */
    confirmBtn.onclick = () => {

        if (confirmBtn.disabled) return;
        if (!confirm(`Confirmar ${stepAtual}?`)) return;

        const confirmacoes = obterConfirmacoes();

        confirmacoes.push({
            numeroSerie,
            step: stepAtual,
            matricula,
            origem: 'STEP',
            dataISO: new Date().toISOString()
        });

        localStorage.setItem(
            'prostep_confirmacoes_gate',
            JSON.stringify(confirmacoes)
        );

        atualizarStatusSteps();
        atualizarBotao();
    };

    /* =====================================================
       SINCRONIZAÇÃO
    ===================================================== */
    window.addEventListener('storage', () => {
        atualizarStatusSteps();
        atualizarBotao();
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
    carregarChecklist();
    atualizarStatusSteps();
    atualizarBotao();

});


