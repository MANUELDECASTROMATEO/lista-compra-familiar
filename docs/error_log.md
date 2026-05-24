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

## 2026-05-24 - Dictado continuo se guardaba como un solo producto

```diff
- El parser solo separaba productos por comas, saltos de linea o conectores como "y".
- SpeechRecognition puede devolver una frase continua: "patatas huevos leche detergente...".
- Esa frase se guardaba como un unico producto.
+ El parser detecta entradas sin separadores y las segmenta con el diccionario de supermercado.
+ Usa coincidencia mas larga para frases como "carne para guisar".
+ Conserva modificadores hasta el siguiente producto conocido: "pan integral leche sin lactosa".
+ Se anadio test con la frase real dictada por el usuario.
```

## 2026-05-24 - Producto reconocido mal no se podia corregir ni separar

```diff
- La fila solo permitia marcar comprado, cambiar seccion en desktop y borrar.
- Si el dictado reconocia mal un producto, habia que borrar y volver a escribir.
- Si una linea mezclaba varios productos como "ketchup, mayonesa, mostaza", no habia accion para separarla.
- Los bloques de seccion eran todos visualmente blancos y se distinguian poco.
+ Cada producto tiene boton de editar.
+ El modo edicion permite cambiar el nombre o escribir varios productos en lineas separadas.
+ Guardar/separar reemplaza la fila usando el mismo parser y reclasifica cada producto.
+ Las secciones tienen color semantico por familia de supermercado.
```

## 2026-05-24 - Dictado largo sin feedback visual

```diff
- El dictado largo se volcaba en una caja de texto de una linea.
- El usuario no podia saber claramente si la app estaba escuchando ni que productos iba detectando.
- SpeechRecognition no usaba resultados intermedios ni modo continuo.
+ El dictado abre una hoja superpuesta con estado "Escuchando productos".
+ La hoja muestra transcripcion en vivo y chips con productos detectados por el parser.
+ El usuario puede parar, limpiar o anadir directamente desde la hoja.
+ SpeechRecognition usa interimResults y continuous para dictados largos.
```
