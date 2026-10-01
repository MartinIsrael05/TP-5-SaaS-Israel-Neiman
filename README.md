# TECA

Aplicación web para controlar suscripciones y gastos recurrentes.

**Trabajo Práctico 5 — Programación Multimedial III**
Martín Israel y Luciano Neiman

---

## El problema

Una persona promedio tiene entre seis y quince suscripciones activas. Los cobros
son automáticos, pasan desapercibidos, y casi nadie sabe cuánto suman ni cuándo
se renuevan.

TECA las centraliza en un solo lugar y responde tres preguntas concretas:

- **¿Cuánto se me va por mes?** Incluyendo las anuales prorrateadas.
- **¿Qué se viene?** Los cobros de los próximos 30 días, y en qué día del mes caen.
- **¿Dónde hay plata dormida?** Suscripciones pausadas o de poco uso que se
  siguen pagando.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16.3 (App Router, Server Components, Server Actions) |
| UI | React 19, Tailwind CSS 4, Framer Motion, Lucide |
| Backend | Firebase Authentication, Cloud Firestore, Firebase Admin SDK |
| Gráficos | Recharts |
| Excel | SheetJS (xlsx) |
| Correo | Nodemailer (Gmail) con Resend como alternativa |
| Deploy | Vercel |

> **Nota sobre Next.js 16:** el archivo `middleware.js` se renombró a `proxy.js`.
> Es la misma función —interceptar las peticiones antes de que lleguen a la
> app— con otro nombre. Acá se usa para proteger `/dashboard`.

---

## Cómo levantarlo

```bash
yarn install
yarn dev
```

Requiere Node 20 o superior. **El proyecto usa yarn**: no corras `npm install`,
porque genera un `package-lock.json` que entra en conflicto con `yarn.lock` y
puede hacer que Vercel instale versiones distintas a las de tu máquina.

### Variables de entorno

Copiá `.env.example` a `.env` y completá los valores. El `.env` está ignorado
por git y nunca se sube: por eso al clonar el repo no aparece.

```bash
# Firebase — SDK del navegador (públicas)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (privadas, solo servidor)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Envío del código de verificación del registro
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

`GMAIL_APP_PASSWORD` **no** es la contraseña de la cuenta: es una
"contraseña de aplicación" que se genera en
[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
y requiere tener activada la verificación en dos pasos.

Si no hay ningún proveedor de correo configurado, en desarrollo el código se
imprime en la consola del servidor para poder probar el flujo; en producción,
el registro falla con un error explícito en vez de simular que mandó algo.

---

## Mapa de la aplicación

La app tiene **tres estados** bien diferenciados:

### Sin cuenta

| Ruta | |
|---|---|
| `/` | Landing con la propuesta de valor |
| `/login` | Ingreso y registro |
| `/terminos` | Términos de servicio |
| `/privacidad` | Política de privacidad |

### Con cuenta

| Ruta | |
|---|---|
| `/` | La misma home, pero muestra tu resumen en vez de venderte el producto |
| `/dashboard` | Panel con las métricas |
| `/dashboard/subscriptions` | Listado, alta, búsqueda y filtros |
| `/dashboard/subscriptions/[id]/edit` | Edición y baja |
| `/dashboard/subscriptions/import` | Importación desde Excel |
| `/dashboard/calendar` | Calendario de vencimientos |
| `/dashboard/items` | Categorías propias |
| `/dashboard/cuenta` | Perfil, exportación y baja de cuenta |

### Administrador

| Ruta | |
|---|---|
| `/dashboard/admin` | Métricas agregadas de toda la plataforma |
| `/dashboard/users` | Alta, edición y baja de usuarios |

El rol aparece como un grupo propio en el menú lateral, con una chapa que
indica que estás en modo administrador.

> **Para crear el primer administrador** hay que poner `user_type: "admin"` a
> mano en el documento del usuario en Firestore. Es un problema de arranque en
> frío a propósito: la única pantalla que cambia roles exige ya ser admin, así
> que nadie puede ascenderse solo.

---

## Arquitectura

### Separación por capas

```
app/        → rutas y Server Actions (la frontera con el navegador)
components/ → interfaz
lib/        → lógica de negocio y acceso a datos
```

Ningún componente habla con Firestore directamente. Todo pasa por `lib/`.

### Dónde vive cada cosa en `lib/`

| Archivo | |
|---|---|
| `firebase/admin.js` | Inicializa el Admin SDK (privilegios de servidor) |
| `firebase/client.js` | Inicializa el SDK del navegador |
| `firebase/session.js` | Crea y valida la cookie de sesión |
| `subscriptions/subscriptions.js` | CRUD contra Firestore |
| `subscriptions/metrics.js` | Cálculos puros, sin base de datos |
| `subscriptions/validation.js` | Las reglas de validación, en un solo lugar |
| `subscriptions/dates.js` | Cálculo de la próxima fecha de cobro |
| `subscriptions/importSchema.js` | Mapeo de columnas del Excel |
| `items/items.js` | Categorías |
| `users/users.js` | Perfiles y roles |
| `admin/stats.js` | Métricas agregadas de la plataforma |
| `auth/verification.js` | Códigos de verificación de email |
| `email/send.js` | Envío de correo |

### Por qué hay archivos de constantes separados

`subscriptions.js` importa `firebase-admin`, que es código **solo de servidor**.
Si un componente de cliente importara de ahí para leer una constante, el
bundler intentaría meter el SDK de administrador en el navegador.

Por eso las constantes viven en `constants.js` y las fechas en `dates.js`:
ambos son puros, sin dependencias, y los puede usar cualquiera.

---

## Seguridad

### Sesión del lado del servidor

El navegador se autentica con Firebase y obtiene un `idToken`. Ese token viaja
**una sola vez** a `/api/session/login`, que lo valida con el Admin SDK y
devuelve una **cookie HTTP-only**.

Una cookie HTTP-only es inaccesible desde JavaScript. Si alguien lograra
inyectar un script en la página, no podría leerla ni robar la sesión.

### Aislamiento de datos por usuario

Cada lectura filtra por `userId`:

```js
.collection("subscriptions").where("userId", "==", userId)
```

Y cada escritura **relee el documento y compara el dueño** antes de modificarlo:

```js
if (!doc.exists || doc.data().userId !== userId) {
  throw new Error("Subscription not found.");
}
```

Esto es lo importante: no alcanza con esconder el botón de editar en la
interfaz. Si alguien manda el ID de una suscripción ajena desde la consola del
navegador, la operación falla igual.

### La validación vive en el servidor

Los formularios son componentes de cliente, y todo lo que corre en el cliente
se puede saltear. Por eso la validación está en el Server Action, que es la
única frontera confiable.

Las mismas reglas las usan el formulario **y** la importación de Excel, así no
hay dos versiones de la verdad que se desincronicen.

### Roles en dos capas

La pantalla de administración redirige si no sos admin, **y además** cada
Server Action revalida el rol. Si sólo estuviera la primera, bastaría con
llamar a la acción directamente.

---

## Las partes custom

Esta es la sección que más conviene leer: son las decisiones que no vienen
dadas por el framework.

### 1. Verificación de email con código propio

**El problema:** cualquiera podía registrarse con un mail que no era suyo.

**Por qué no alcanzaba Firebase:** Firebase Auth sólo envía *enlaces* de
verificación, y `sendEmailVerification` **exige que el usuario ya exista**. O
sea que la cuenta quedaría creada con un mail sin verificar — justo el agujero
que queríamos cerrar.

**Cómo se resolvió:** un flujo propio de dos pasos donde la cuenta **no se crea
en Firebase hasta que el código coincide**.

```
Paso 1  /api/auth/verify/start
        Valida los datos, chequea que el mail no esté registrado,
        genera un código de 6 dígitos y lo envía.
        NO crea ninguna cuenta.

Paso 2  /api/auth/verify/confirm
        Valida el código y recién ahí crea el usuario con
        emailVerified: true.
```

Decisiones de seguridad en `lib/auth/verification.js`:

- **El código nunca se guarda en claro.** Se almacena `sha256(mail + código)`,
  igual que una contraseña. Va atado al mail para que un hash no sirva en otro
  registro.
- **Comparación en tiempo constante** (`timingSafeEqual`), para no filtrar
  información por el tiempo que tarda la respuesta.
- **Vence a los 10 minutos**, admite **5 intentos**, y limita los reenvíos a uno
  por minuto y cinco por hora, para que no se pueda usar como máquina de spam
  contra el mail de otra persona.
- **Un solo uso:** al validarse, el registro se borra.
- **La contraseña nunca se persiste.** Queda en el estado del formulario entre
  el paso 1 y el 2, viaja al servidor sólo en el confirm, y se usa una vez para
  crear el usuario.
- Si el envío del correo falla, el código se descarta, para no consumirle al
  usuario el cupo de reenvíos por un error que no es suyo.

### 2. El calendario

**Archivos:** `components/calendar/CalendarBoard.js` y `DayDetail.js`

Construido con `Date` nativo y CSS Grid, sin librerías de calendario. La grilla
se arma calculando el offset del primer día (la semana arranca el lunes, no el
domingo como devuelve `getDay()`) y redondeando a múltiplos de 7.

**El problema de fechas que costó resolver.** `resolveNextChargeDate` devuelve
el *próximo* cobro contado desde hoy. Usarlo directamente como piso del mes
daba un resultado incorrecto:

> Netflix se cobra el 5. Hoy es 24. Esa función ya devuelve el **5 del mes que
> viene**. Al mirar el mes actual, el calendario aparecía vacío — aunque el
> cobro del 5 sí había ocurrido.

La solución fue separar dos cosas que se estaban mezclando: esa fecha se usa
sólo para saber **qué día del mes** cae, y el piso pasó a ser `createdAt`, para
no inventar cobros anteriores al alta de la suscripción.

Además, para las mensuales el día se recorta al último día del mes cuando no
existe: una suscripción que cae el 31 se muestra el 30 en noviembre y el 28 (o
29) en febrero.

**Interacción:** se descartó el hover por tres razones concretas — no existe en
pantallas táctiles, parpadea al mover el mouse entre celdas, y el globo se
recortaba contra los bordes de la grilla. Tocar un día abre un panel: hoja
desde abajo en mobile, diálogo centrado en escritorio.

### 3. Importar y exportar Excel

**Archivos:** `components/subscriptions/ImportForm.js`,
`lib/subscriptions/importSchema.js`

- **El archivo se lee en el navegador**, no se sube a ningún servidor. SheetJS
  se carga con `import()` dinámico sólo cuando el usuario elige un archivo, así
  no pesa en la carga inicial de la página.
- **Previsualización fila por fila** antes de guardar nada, con los errores
  marcados en rojo y el motivo concreto de cada uno.
- **Encabezados flexibles:** cada campo acepta varios nombres y se comparan
  normalizados, sin acentos ni mayúsculas. `Monto`, `Importe`, `Precio` y
  `Valor` son lo mismo.
- **Las categorías que no existen se crean solas.**
- **El servidor revalida todas las filas** aunque el navegador ya las haya
  validado: la previsualización es una comodidad, no una garantía.

**El round-trip.** La exportación usa **las mismas columnas** que acepta el
importador, así que el archivo que bajás se puede editar en Excel y volver a
subir sin tocar nada.

**Un bug que apareció en las pruebas:** `$ 28.000` se guardaba como **28 pesos**.
El parser trataba el punto como separador decimal, pero en formato argentino es
separador de miles. Se resolvió con una heurística: si el texto matchea
`^\d{1,3}(\.\d{3})+$` son miles; si no, es un decimal.

### 4. El gráfico de proyección

**Archivo:** `components/dashboard/ProjectionChart.js`

Barras apiladas que separan la **base mensual** de las **renovaciones anuales**.
Es el gráfico que más valor agrega porque muestra algo que un promedio esconde:
el gasto no es parejo. Un mes con una renovación anual puede costar bastante más
que uno normal.

**Sobre los colores:** no se eligieron a ojo. El acento de la interfaz queda
fuera de la banda de luminosidad recomendada para fondo oscuro, así que las
barras usan un paso más profundo de la misma rampa. El par de colores se validó
con medición: separación ΔE 19,5 para daltonismo (deuteranopía) sobre un piso
recomendado de 8, y contraste mayor a 3:1 contra el fondo real de las tarjetas.

Un detalle de implementación: Recharts **no dibuja los segmentos de valor cero**,
así que la etiqueta del total colgada del segmento anual desaparecía en los
meses sin renovación. Se resolvió calculando la escala en píxeles desde la base
mensual y posicionando la etiqueta sobre la pila completa.

### 5. Detección de suscripciones "zombie"

Una suscripción activa marcada con `usageLevel: "Bajo"` es plata que se sigue
pagando por algo que casi no se usa. El panel calcula cuánto se ahorraría
cancelándolas, y en el calendario aparecen con un punto coral en vez de indigo.

### 6. Soporte multimoneda

Las suscripciones pueden estar en ARS o USD. Los totales **no se convierten**:
se muestran por separado (`$ 253.148 + USD 12`). Es una decisión deliberada —
convertir exigiría una cotización, y mostrar un número convertido con un tipo de
cambio viejo sería peor que mostrar dos números exactos.

---

## Modelo de datos

### `subscriptions`

```js
{
  userId, name, categoryItemId, amount, currency,
  billingCycle,       // "monthly" | "annual"
  nextChargeDate,     // "YYYY-MM-DD"
  paymentMethod,
  status,             // "active" | "paused" | "cancelled"
  usageLevel,         // "Alto" | "Medio" | "Bajo"
  reminderDaysBefore, cancelUrl, notes,
  createdAt, updatedAt
}
```

### `items` (categorías)

```js
{ userId, title, description, createdAt, updatedAt }
```

La colección conserva el nombre `items` porque viene del boilerplate y ya tenía
datos cargados, pero en esta app son las categorías con las que el usuario
agrupa sus suscripciones. Son privadas.

### `users`

```js
{ email, displayName, photoURL, provider,
  user_type,          // "user" | "admin"
  createdAt, updatedAt, lastLoginAt }
```

### `emailVerifications`

```js
{ email, codeHash, expiresAt, attempts, lastSentAt, sendCount, windowStartedAt }
```

El documento se identifica por el hash del mail, y se borra al validarse.

---

## Declaración de uso de inteligencia artificial

Este trabajo se desarrolló usando asistentes de IA. Lo documentamos de forma
transparente porque era parte de la consigna.

### Qué modelo se usó

**Claude Opus 5**, de Anthropic, a través de **Claude Code** (el asistente que
corre en la terminal y tiene acceso al repositorio).

Se eligió esa herramienta porque, a diferencia de un chat, puede leer el código
real del proyecto, correr los comandos (`yarn build`, `yarn lint`, los tests) y
verificar en un navegador que lo que escribió efectivamente funciona, en vez de
proponer código a ciegas.

**Trazabilidad:** los commits en los que participó están firmados con
`Co-Authored-By: Claude Opus 5` en el mensaje. Son **14 de los 64** commits del
repositorio. Se pueden listar con:

```bash
git log --format="%h %s" --grep="Co-Authored-By: Claude"
```

### Para qué se usó

- **Diagnóstico de errores.** El deploy de Vercel fallaba con un error 500 que
  no se entendía. La IA rastreó la cadena de dependencias
  (`firebase-admin → jwks-rsa → jose`) hasta el conflicto real entre módulos
  CommonJS y ESM.
- **Implementación de features** a partir de consignas nuestras: verificación de
  email por código, calendario, importación de Excel, pantalla de cuenta,
  páginas legales, aviso de cookies.
- **Explicación de conceptos** que no conocíamos: por qué una cookie HTTP-only
  es más segura, qué es `useSyncExternalStore` y por qué conviene sobre un
  `useEffect` para leer `localStorage`, cómo funciona el aislamiento por
  usuario en Firestore.
- **Resolución de problemas de Git**, incluido un merge que no dio conflictos
  pero dejó código roto.
- **Escritura de este README.**

### Qué decidimos nosotros

La IA no tomó las decisiones de producto ni de arquitectura. Las que definimos
nosotros y le dimos como restricción:

- Qué entidad principal modelar y con qué campos.
- Que las categorías fueran un ABM propio y no una lista fija.
- Que todo arrancara en pesos y el soporte de USD viniera después.
- El diseño visual completo: la paleta "Teca Nocturna", la tipografía, el tono
  de los textos.
- Qué features priorizar y en qué orden.
- Que no hubiera calendario en el panel para no duplicar información.

### Cómo verificamos lo que escribió

Esto nos parece la parte más importante. No dimos nada por bueno porque
compilara:

- **`yarn build` y `yarn lint`** en cada cambio.
- **Pruebas en el navegador real**, con sesión iniciada y datos reales. Varias
  veces apareció ahí lo que el build no detecta. Ejemplos concretos:
  - Un merge dejó `onClick={close}` apuntando a una variable que ya no existía.
    Era un `ReferenceError` en tiempo de ejecución: compilaba perfecto y
    crasheaba el panel al renderizar.
  - El gráfico de proyección no mostraba el total en los meses sin renovación
    anual.
  - El menú inferior de mobile tapaba el último botón del panel de detalle.
  - `$ 28.000` se importaba como 28 pesos.
- **Pruebas de la lógica pura**: 18 casos para las fechas del calendario
  (incluyendo meses de 28, 29, 30 y 31 días) y 16 para la validación.

### Lo que aprendimos

Que la IA escribe código que compila, pero **no garantiza que funcione**. Casi
todos los bugs reales aparecieron al abrir la aplicación y usarla, no al
compilarla. Revisar y probar sigue siendo trabajo nuestro.


## Estado actual

**Funcionando:** autenticación con email verificado y con Google, ABM completo
de suscripciones y categorías, importación y exportación de Excel, panel con
métricas, calendario, pantalla de cuenta, rol de administrador, responsive con
menú inferior en mobile.


## Flujo de trabajo con Git

El proyecto se trabajó con una rama por feature:

```bash
git switch main
git pull
git switch -c nombre-de-la-feature
# ... commits ...
git push -u origin nombre-de-la-feature
# Pull Request en GitHub y merge
```
