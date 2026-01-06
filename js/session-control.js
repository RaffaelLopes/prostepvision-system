/* =====================================================
   CONTROLE GLOBAL DE SESSÃO (MULTI-ABAS CORRETO)
   - NUNCA limpa dados em logout
   - Limpa SOMENTE quando o navegador é aberto novamente
===================================================== */

(function () {

    const SESSION_KEY = 'prostep_browser_alive';

    // Se esta chave não existe, é uma NOVA sessão de navegador
    if (!localStorage.getItem(SESSION_KEY)) {

        // Limpa dados globais
        localStorage.removeItem('prostep_confirmacoes_gate');
        localStorage.removeItem('prostep_turno_atual');

        // Marca navegador como ativo
        localStorage.setItem(SESSION_KEY, '1');
    }

})();
