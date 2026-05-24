# Error log

## 2026-05-24 - Normalizacion de plurales y build Next

```diff
- singularize() eliminaba el sufijo "es" de forma generica.
- "leches" pasaba a "lech" y "tomates" a "tomat", rompiendo parser, merge y tests.
- La clasificacion parcial aceptaba terminos cortos dentro de otras palabras: "sal" coincidia con "salsa".
- Next 16 avisaba que themeColor ya no debe ir en metadata.
+ singularize() ahora elimina "s" de forma conservadora y usa excepciones explicitas.
+ classifyItem() exige palabra completa para terminos cortos y parcial solo para terminos de 4+ caracteres.
+ themeColor se movio a viewport.
+ Se anadio turbopack.root para evitar inferencia incorrecta por lockfiles superiores.
```
