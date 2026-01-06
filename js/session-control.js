/* =====================================================
   SESSION CONTROL – PROSTEP VISION SYSTEM
   -----------------------------------------------------
   ✔ Compatível com Vercel e GitHub Pages
   ✔ Não apaga dados automaticamente
   ✔ Não depende de fechamento de navegador
   ✔ Gate controla explicitamente o ciclo do turno
   ✔ Evita resets inesperados entre abas
===================================================== */

(function () {

    /*
      Este arquivo existe como ponto central de controle de sessão.
      Atualmente ele NÃO executa nenhuma ação automática.

      Toda limpeza de dados globais (turno, confirmações, relatórios)
      deve ocorrer EXCLUSIVAMENTE através do GATE,
      via botão "Encerrar Turno".

      Motivo:
      - Ambientes estáticos (Vercel / GitHub Pages)
        não permitem detecção confiável de fechamento de navegador.
      - Qualquer tentativa de limpar localStorage automaticamente
        gera bugs entre abas e páginas.

      Futuro:
      - Este arquivo pode evoluir para:
        • autenticação real
        • controle por token
        • backend/API
        • expiração de sessão
    */

    // Placeholder intencional
    // Nenhuma lógica aqui por enquanto

})();
