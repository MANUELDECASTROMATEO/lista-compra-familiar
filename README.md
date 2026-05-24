# Lista Compra Familiar

PWA gratuita para gestionar una lista de la compra familiar. Funciona desde el primer arranque en modo local con `localStorage` y deja preparado Supabase para sincronizacion familiar real.

## Funcionalidad

- Entrada por texto libre.
- Dictado con Web Speech API si el navegador lo soporta.
- Clasificacion por secciones de supermercado sin IA obligatoria.
- Aprendizaje local al cambiar un producto de seccion.
- Checkboxes grandes para usar en el supermercado.
- Ocultar comprados y finalizar compra.
- Exportar/importar estado para mover la lista entre dispositivos mientras no se configure Supabase.

## Desarrollo local

```powershell
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Tests y build

```powershell
npm test
npm run build
```

## Supabase

La app ya incluye la migracion inicial en `supabase/migrations/20260524000000_initial_schema.sql`.

Para aplicar la migracion en un proyecto Supabase:

```powershell
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

Copia `.env.example` a `.env.local` y rellena:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

La clave `SUPABASE_SERVICE_ROLE_KEY` es solo server-side. No debe aparecer con prefijo `NEXT_PUBLIC_`.

## Coste

La V1 no depende de APIs de pago. El modo local no usa backend. Supabase y Vercel pueden usarse en sus planes gratuitos.
