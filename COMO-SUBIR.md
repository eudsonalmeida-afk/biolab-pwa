# Como aplicar esta atualização no GitHub

Repositório: https://github.com/eudsonalmeida-afk/biolab-pwa

Substitua os arquivos do ZIP mantendo exatamente as pastas:
- app/page.tsx
- app/globals.css
- app/activity-data.ts
- app/bioquest-data.ts
- app/experience-demo.tsx
- public/sw.js
- tests/activity-content.test.mjs
- package.json
- README.md

No GitHub: abra o repositório, use Add file > Upload files, arraste o conteúdo desta pasta (não a pasta `package` inteira) e confirme o commit na branch main.

Não envie node_modules, dist, build, gh-pages-dist ou tsconfig.tsbuildinfo.
