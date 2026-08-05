# BioLab — Ciência em movimento

Um protótipo de plataforma educacional com **150 experiências investigativas** para aulas de Ciências e Biologia.

## O que está no protótipo

- **5 laboratórios:** BioSim, BioQuest, BioChallenge, BioStory e BioLab.
- **4 modos de uso:** aula guiada, atividade em grupo, atividade individual e criação de aula.
- Catálogo pesquisável com todos os 150 tópicos.
- Favoritos e seleção de experiências para montar aulas.
- Aula interativa demonstrativa sobre respiração celular.
- PWA instalável em computador e celular, com suporte offline após o primeiro acesso.

## Acessar e instalar

Abra [eudsonalmeida-afk.github.io/BioLab](https://eudsonalmeida-afk.github.io/BioLab/).

No Chrome ou Edge, use o botão **Instalar app** exibido pelo BioLab. No celular, também é possível usar a opção **Adicionar à tela inicial** do navegador.

## Desenvolvimento local

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Para gerar exatamente a versão publicada no GitHub Pages:

```bash
npm run build:pages
```

## Publicação

O fluxo em `.github/workflows/pages.yml` compila e publica automaticamente o PWA no GitHub Pages a cada envio para a branch `main`.
