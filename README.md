# BioLab — Ciência em movimento

Uma plataforma educacional com **159 experiências investigativas** para aulas de Ciências e Biologia.

## O que está no protótipo

- **5 laboratórios:** BioSim, BioQuest, BioChallenge, BioStory e BioLab.
- **4 modos de uso:** aula guiada, atividade em grupo, atividade individual e criação de aula.
- Catálogo pesquisável com todos os 159 tópicos.
- BioQuest com 13 casos completos, organizados em problema, recuperação, hipótese, evidências, conclusão provisória, surpresa, revisão, formalização e transferência.
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
