# 🤖 Pia Robot - Sistema de Olhos Emocionais

## Visão Geral do Projeto
Este trabalho apresenta o desenvolvimento de um sistema inovador para a exibição dos "olhos emocionais" do **Pia Robot**, um robô não-humanoide que utiliza a tela de um dispositivo móvel acoplado à sua cabeça. O objetivo principal é aprimorar a interação humano-robô, permitindo que o Pia Robot replique as emoções do usuário por meio de animações de olhos no estilo cartoon. A pesquisa explora a importância da expressão ocular na comunicação humana e como ela pode ser traduzida para robôs, fortalecendo laços emocionais e tornando a interação mais significativa.

## ✨ O Que o Projeto Faz e Como Funciona
O sistema é projetado para **replicar a emoção do usuário** em tempo real, exibindo um olhar emocional correspondente na tela do Pia Robot.

**Fluxo de Funcionamento:**
1.  **Captura Facial:** Um aplicativo mobile desenvolvido em React Native, rodando em um smartphone acoplado à cabeça do robô, captura imagens da face do usuário continuamente (originalmente a cada 2s, ajustado para 18s devido à latência).
2.  **Análise de Emoções:** As imagens capturadas são enviadas para um backend desenvolvido em Flask, que utiliza a biblioteca **DeepFace** para realizar o reconhecimento facial e identificar a emoção dominante do usuário (alegria, tristeza, raiva, surpresa, neutro). As análises baseiam-se em teorias como as de Paul Ekman.
3.  **Exibição do Olhar Emocional:** O resultado do reconhecimento é enviado de volta ao aplicativo, que atualiza a animação dos olhos emocionais do Pia Robot na tela, correspondendo à emoção detectada.

## 🎨 Concepção dos Olhos Emocionais
Para cada emoção básica, foi criado um conjunto de desenhos de olhos no estilo cartoon, com características visuais que refletem as expressões faciais universais (ex: sobrancelhas arqueadas para alegria, pálpebras tensionadas para raiva). Cores de fundo estratégicas foram adicionadas para potencializar a percepção das emoções. As animações incluem o piscar dos olhos para maior naturalidade.

## 🛠️ Tecnologias Utilizadas
* **Desenvolvimento Mobile (Front-end):** `React Native` (para Android)
* **Linguagem de Programação (Back-end):** `Python` (com Flask)
* **Framework Web (Back-end):** `Flask`
* **Reconhecimento Facial:** `DeepFace` (biblioteca)
* **Controle de Versão:** `Git`


## 🚀 Próximos Passos (Trabalhos Futuros)
Planeja-se aprimorar o desempenho do aplicativo, otimizando o processamento de imagens e reduzindo a latência para uma interação ainda mais fluida. Além disso, a exploração de novas tecnologias de reconhecimento em tempo real para integrar de forma mais eficiente a análise de emoções com as expressões visuais do robô.
