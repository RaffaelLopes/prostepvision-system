document.addEventListener('DOMContentLoaded', function () {

    /* =====================================================
       CONTROLE DE ABAS (LIMPA APENAS NO FECHAMENTO TOTAL)
    ===================================================== */
    const abasAbertas = Number(
        localStorage.getItem('prostep_abas_abertas') || '0'
    );

    if (abasAbertas === 0) {
        localStorage.removeItem('prostep_confirmacoes_gate');
        localStorage.removeItem('prostep_turno_atual');
    }

    localStorage.setItem(
        'prostep_abas_abertas',
        abasAbertas + 1
    );

    window.addEventListener('beforeunload', () => {
        const abertas = Number(
            localStorage.getItem('prostep_abas_abertas') || '1'
        );
        localStorage.setItem(
            'prostep_abas_abertas',
            Math.max(abertas - 1, 0)
        );
    });

    /* =====================================================
       ELEMENTOS
    ===================================================== */
    const matriculaInput   = document.getElementById('matriculaInput');
    const numeroSerieInput = document.getElementById('numeroSerieInput');
    const stepSelect       = document.getElementById('stepSelect');
    const stepOptions      = document.getElementById('stepOptions');
    const loginBtn         = document.getElementById('loginBtn');
    const options          = stepOptions.querySelectorAll('.dropdown-option');

    let SERIES_VALIDAS = [];

    /* =====================================================
       CARREGA SÉRIES VÁLIDAS
    ===================================================== */
    fetch('../data/series-validas.json')
        .then(r => r.json())
        .then(d => SERIES_VALIDAS = d.series || [])
        .catch(() => alert('Erro ao carregar séries válidas'));

    /* =====================================================
       DROPDOWN STEP
    ===================================================== */
    stepSelect.addEventListener('click', () => {
        stepOptions.classList.toggle('show');
    });

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            stepSelect.textContent = opt.textContent;
            stepSelect.dataset.value = opt.dataset.value;
            stepOptions.classList.remove('show');
        });
    });

    document.addEventListener('click', e => {
        if (!stepSelect.contains(e.target) && !stepOptions.contains(e.target)) {
            stepOptions.classList.remove('show');
        }
    });

    /* =====================================================
       LOGIN
    ===================================================== */
    loginBtn.addEventListener('click', function () {

        const matricula   = matriculaInput.value.trim();
        const numeroSerie = numeroSerieInput.value.trim();
        const step        = stepSelect.dataset.value;

        if (!matricula) {
            alert('Digite a matrícula');
            return;
        }

        if (!step) {
            alert('Selecione o Step');
            return;
        }

        // Limpa SOMENTE a sessão da aba
        sessionStorage.clear();
        sessionStorage.setItem('prostep_matricula', matricula);

        /* ===============================
           LOGIN GATE (RESTRITO)
        =============================== */
        if (step === 'GATE') {

            if (matricula !== '222222') {
                alert('Acesso não autorizado ao GATE');
                return;
            }

            sessionStorage.setItem('prostep_perfil', 'GATE');
            window.location.href = 'gate.html';
            return;
        }

        /* ===============================
           LOGIN STEP (LIBERADO)
        =============================== */
        if (!numeroSerie) {
            alert('Digite o número de série');
            return;
        }

        if (!SERIES_VALIDAS.includes(numeroSerie)) {
            alert('Número de série não autorizado');
            return;
        }

        sessionStorage.setItem('prostep_serie', numeroSerie);
        sessionStorage.setItem('prostep_step', step);
        sessionStorage.setItem('prostep_perfil', 'STEP');

        window.location.href = 'operacao.html';
    });

});
