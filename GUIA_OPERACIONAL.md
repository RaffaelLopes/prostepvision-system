🧑‍🏭 Acesso ao Painel de STEP (Operação)
✔️ Quem deve usar

Operadores responsáveis pela execução de um Step específico do processo produtivo.

📝 Como preencher o login (STEP)

Na tela de login, preencha os campos da seguinte forma:

Matrícula

Informe uma matrícula válida de operador de Step

As matrículas seguem um padrão numérico, por exemplo:

111220, 111221, 111222, 111223, ...


As matrículas permitidas estão definidas no arquivo:

data/matricula.json


Número de Série

Informe o número de série da unidade que está sendo trabalhada

Apenas números de série cadastrados no arquivo:

data/series-validas.json


serão aceitos

Step

Selecione o Step correspondente à operação que será executada

Cada operador deve atuar somente no Step selecionado

Clique em Login

📌 Caso algum dos dados esteja incorreto ou não autorizado, o sistema bloqueará o acesso.

🖥️ Tela de Operação (STEP)

Após o login, o operador terá acesso ao painel de operação, que contém:

Checklist obrigatório do Step selecionado

Indicadores visuais de status de todos os Steps

Botão Confirmar

Regras importantes:

Todos os itens do checklist devem ser marcados

O turno deve estar ativo (iniciado pelo GATE)

Somente após essas condições o botão Confirmar será liberado

Ao confirmar:

O Step é registrado no sistema

A confirmação é enviada automaticamente para o painel GATE

🛂 Acesso ao Painel GATE (Controle Central)
✔️ Quem deve usar

Responsável pelo controle de qualidade e acompanhamento geral do processo.

🔑 Regra especial de acesso ao GATE

O GATE possui uma matrícula exclusiva:

222222


⚠️ Nenhuma outra matrícula tem permissão para acessar o painel GATE.

📝 Como preencher o login (GATE)

Matrícula

Informe obrigatoriamente:

222222


Número de Série

Não preencher

O GATE não utiliza número de série para login

Step

Selecione GATE

Clique em Login

🔄 Testando o sistema (STEP + GATE em tempo real)

Para testar corretamente o funcionamento do sistema e visualizar as confirmações em tempo real, recomenda-se o seguinte procedimento:

Abra duas abas do navegador

Na primeira aba:

Faça login como GATE

Matrícula: 222222

Step: GATE

Na segunda aba:

Faça login como STEP

Utilize uma matrícula de operador (ex: 111220)

Informe um número de série válido

Selecione um Step

📌 Dessa forma, será possível:

Confirmar Steps na aba de operação

Visualizar imediatamente as confirmações no painel GATE

Acompanhar o dashboard sendo atualizado em tempo real
