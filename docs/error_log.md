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

## 2026-05-24 - Microfono deshabilitado y overflow del boton anadir

```diff
- AddItemsForm detectaba SpeechRecognition en el inicializador de useState.
- En Next, el primer render puede ejecutarse sin window, dejando voiceSupported=false permanentemente.
- La fila de entrada no tenia suficientes min-width: 0 en el contenedor flexible movil.
- En pantallas estrechas, el input podia empujar el boton "+" fuera del viewport.
+ SpeechRecognition se detecta tras montar en cliente con requestAnimationFrame.
+ El boton de microfono se habilita cuando el navegador expone SpeechRecognition o webkitSpeechRecognition.
+ La barra de entrada usa w-full, min-w-0, flex-none en botones y overflow-x-hidden en el wrapper.
+ Verificado en viewport 320px: documentElement.scrollWidth == innerWidth.
```
