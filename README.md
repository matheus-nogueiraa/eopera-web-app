
# Eopera Web

## Como baixar e rodar o projeto

1. Faça o clone do repositório:

```bash
git clone <url-do-repositorio>
```

2. Instale as dependências:

```bash
npm install
# ou
```

3. Rode o projeto em modo desenvolvimento:

```bash
npm start
# ou
```

4. Para build de produção:

```bash
npm run build
# ou
```

## Estrutura de pastas principal

```
coreui-free-react-admin-template
├── public/          # static files
│   ├── favicon.ico
│   └── manifest.json
│
├── src/             # project root
│   ├── assets/      # images, icons, etc.
│   ├── components/  # common components - header, footer, sidebar, etc.
│   ├── layouts/     # layout containers
│   ├── scss/        # scss styles
│   ├── views/       # application views
│   ├── _nav.js      # sidebar navigation config
│   ├── App.js
│   ├── index.js
│   ├── routes.js    # routes config
│   └── store.js     # template state example 
│
├── index.html       # html template
├── ...
├── package.json
├── ...
└── vite.config.mjs  # vite config
```

---

Projeto baseado em [CoreUI Free React Admin Template](https://github.com/coreui/coreui-free-react-admin-template).