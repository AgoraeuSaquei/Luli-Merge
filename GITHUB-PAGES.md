# LULI FRUIT — GitHub Pages

## Executar localmente

```bash
pnpm install
pnpm dev
```

Abra o endereço mostrado pelo Vite. O jogo é client-only e não precisa de servidor, banco de dados ou chave de API.

## Gerar a versão estática

```bash
pnpm build
```

A saída fica em `dist/`. Ela contém `index.html`, JavaScript/CSS compilados e a pasta `assets/` com os mesmos nomes dos arquivos originais.

## Publicar no GitHub Pages

1. Crie ou abra um repositório no GitHub e envie este projeto.
2. Em **Settings → Pages**, escolha **GitHub Actions** como fonte.
3. Crie `.github/workflows/deploy.yml` com o workflow abaixo, ou publique o conteúdo de `dist/` com qualquer workflow de Pages compatível.

```yaml
name: Deploy static game

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

O Vite usa `base: "./"`, então o mesmo build funciona no domínio do usuário e em uma URL de projeto, como `https://usuario.github.io/luli-fruit/`.

## Assets

Os arquivos visuais continuam em `client/public/assets/` com seus nomes originais. Para trocar imagens, substitua o arquivo mantendo exatamente o mesmo nome. O jogo usa `localStorage` para recorde, som, álbum, stickers, cartas douradas e fragmentos.

## Mecânicas preservadas

- Física Matter.js com gravidade, paredes e colisões.
- Posicionamento e lançamento por toque, mouse, teclado, Espaço e Enter.
- Combinação de duas frutas iguais em uma fruta do nível seguinte.
- Combos, partículas, pontuação e recorde persistente.
- Zona de perigo com contagem regressiva e Game Over.
- Pausa, reinício e som opcional.
- Álbum com 17 stickers, cartas douradas, fragmentos e stickers repetidos.
- Código de teste `christiano`, mantido no álbum como no projeto original.
- Layout responsivo para celular e PC.

> Para subir apenas a versão pronta, publique o conteúdo de `dist/`, não a pasta `client/`.
