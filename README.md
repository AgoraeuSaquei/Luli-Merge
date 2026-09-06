# Promo server (README)

This adds a minimal server to validate promo codes using SQLite. The repository keeps no promo codes in client-side files — add them to the DB using the provided script and distribute codes to players as you wish.

Quick start (local):

1) Install dependencies:

   npm install

2) Initialize DB:

   npm run init-db

3) Add a promo code (example):

   npm run add-code -- luceroluli 12
   npm run add-code -- christiano 50

   Note: The above commands edit the database in ./data/promo.db. If you do NOT want codes in the repo, don't run the commands on a public CI; run locally and keep the DB private.

4) Start server:

   npm start

5) Open index.html in a browser (http://localhost:3000/index.html) and test redeeming a code.

Security notes:
- This is a minimal example. In production, add authentication, rate-limiting, HTTPS, and better secret management.
- Consider making codes reusable or time-limited depending on your product requirements.
