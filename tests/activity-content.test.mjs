import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const data = fs.readFileSync(new URL("../app/activity-data.ts", import.meta.url), "utf8");
const experience = fs.readFileSync(new URL("../app/experience-demo.tsx", import.meta.url), "utf8");

function catalogTitles() {
  const block = page.split("const topicGroups")[1].split("const topics")[0];
  return [...block.matchAll(/titles:\s*(\[[^\r\n]+\])/g)].flatMap((match) => JSON.parse(match[1]));
}

function profileTitles() {
  return [...data.matchAll(/^\s+\["([^"]+)",/gm)].map((match) => match[1]);
}

test("as 150 experiências possuem perfil científico individual", () => {
  const catalog = catalogTitles();
  const profiles = profileTitles();
  assert.equal(catalog.length, 150);
  assert.equal(profiles.length, 150);
  assert.equal(new Set(profiles).size, 150);
  assert.deepEqual(new Set(profiles), new Set(catalog));
});

test("o catálogo não usa mais os controles e textos genéricos", () => {
  assert.doesNotMatch(data, /Variável principal|Fator de estresse/);
  assert.doesNotMatch(experience, /Existe relação causal|É apenas coincidência|Chegue a 85 pontos/);
  assert.match(experience, /Revelar explicação científica/);
  assert.match(experience, /modelo didático, não uma medição clínica ou laboratorial/i);
});

test("cada laboratório usa seu conjunto esperado de conteúdos", () => {
  const sections = [
    ["simRows", "questRows", 87],
    ["questRows", "storyRows", 9],
    ["storyRows", "challengeRows", 13],
    ["challengeRows", "labRows", 36],
    ["labRows", "export const labContent", 5],
  ];
  for (const [start, end, expected] of sections) {
    const block = data.split(`const ${start}`)[1].split(end)[0];
    assert.equal([...block.matchAll(/^\s+\["/gm)].length, expected, `${start} deve conter ${expected} perfis`);
  }
});

