# Despesas

Aplicação React para acompanhar e organizar despesas, com autenticação e dados
geridos pelo Supabase.

## Desenvolvimento

```sh
npm install
npm run dev
```

## PWA

A aplicação pode ser instalada a partir de um browser compatível quando estiver
publicada em HTTPS. No telemóvel, abre o endereço da aplicação e escolhe
"Adicionar ao ecrã principal" ou "Instalar aplicação" no menu do browser.

O service worker mantém em cache a interface e os recursos estáticos para que a
aplicação possa abrir sem ligação. Consultar ou alterar despesas continua a
exigir ligação ao Supabase; os pedidos e dados do Supabase não são guardados em
cache.
