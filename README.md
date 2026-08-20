# TP5 - Boilerplate SaaS con Next.js y Firebase

Este proyecto es una base para desarrollar una aplicacion SaaS en grupos de 2 personas. Cada grupo debe elegir el tema de su SaaS y construir sobre este boilerplate las rutas, componentes, modelos de datos y funcionalidades necesarias.

La idea no es modificar solamente textos o colores: deben transformar esta base en un producto funcional con usuarios autenticados, datos propios por usuario y un flujo principal de uso.

## Que trae el boilerplate

- Next.js latest con App Router.
- JavaScript, sin TypeScript.
- Tailwind CSS con dark mode.
- Tipografia Geist usando `next/font`.
- Firebase Authentication.
- Login con email/password.
- Login con Google.
- Sesion server-side mediante cookie HTTP-only.
- Rutas protegidas.
- Dashboard privado en `/dashboard`.
- Firebase Admin SDK configurado para validar sesiones en el servidor.

## Objetivo del trabajo

Desarrollar una SaaS simple pero completa, partiendo de este boilerplate.

Cada grupo debe definir un problema concreto y crear una aplicacion que permita a un usuario autenticado gestionar informacion propia.

Ejemplos posibles:

- Gestor de turnos para profesionales.
- CRM simple para clientes.
- Sistema de inventario.
- Control de gastos.
- Gestor de tareas o proyectos.
- Seguimiento de habitos.
- Plataforma simple de cursos.
- Sistema de reservas.
- Gestor de pedidos.
- Panel para emprendimientos.

El tema es libre, pero debe estar claramente explicado en el README final del grupo.

## Requerimientos minimos

### 1. Autenticacion

La aplicacion debe permitir:

- Registrarse con email/password.
- Iniciar sesion con email/password.
- Iniciar sesion con Google.
- Cerrar sesion.
- Evitar el acceso a rutas privadas si el usuario no esta autenticado.

El boilerplate ya trae esta base funcionando. Cada grupo puede mejorar la experiencia visual, pero no debe eliminar la proteccion server-side.

### 2. Dashboard protegido

La ruta `/dashboard` debe convertirse en el panel principal de la SaaS.

Debe mostrar informacion relevante para el usuario autenticado, por ejemplo:

- Resumen de datos.
- Ultimos registros creados.
- Accesos rapidos.
- Estado general de la cuenta o actividad.

### 3. Entidad principal de la SaaS

Cada SaaS debe tener al menos una entidad principal.

Ejemplos:

- Clientes.
- Turnos.
- Productos.
- Tareas.
- Gastos.
- Cursos.
- Reservas.
- Pedidos.
- Habitos.

Esa entidad debe tener un ABM completo:

- Alta: crear registros.
- Baja: eliminar registros.
- Modificacion: editar registros.
- Listado: ver registros existentes.

### 4. Datos por usuario

Los datos deben pertenecer al usuario autenticado.

Cada documento guardado en la base debe incluir una referencia al usuario, por ejemplo:

```js
{
  userId: "uid-del-usuario",
  title: "Registro de ejemplo",
  createdAt: "...",
  updatedAt: "..."
}
```

Un usuario no debe poder ver, editar ni borrar datos de otro usuario.

### 5. Rutas y componentes propios

Cada grupo debe agregar las rutas y componentes necesarios para su SaaS.

Ejemplo de estructura posible:

```txt
app/
  dashboard/
    page.js
    clientes/
      page.js
      new/
        page.js
      [id]/
        edit/
          page.js

components/
  ClienteForm.js
  ClienteList.js
  EmptyState.js
```

Tambien pueden usar una estructura mas simple:

```txt
app/
  dashboard/
    items/
      page.js
      actions.js

components/
  ItemForm.js
  ItemList.js
```

La estructura exacta depende del tema elegido, pero debe estar ordenada y ser entendible.

### 6. Uso de Firestore

Como el proyecto ya usa Firebase Auth, la base de datos recomendada para este TP es Cloud Firestore.

Cada grupo debe:

- Crear su propio proyecto en Firebase.
- Habilitar Authentication.
- Habilitar Cloud Firestore.
- Configurar las variables de entorno.
- Crear una coleccion para su entidad principal.
- Guardar los documentos asociados al `uid` del usuario autenticado.

Ejemplo de colecciones:

```txt
clientes
turnos
productos
tareas
gastos
reservas
```

Ejemplo de documento:

```js
{
  userId: "abc123",
  name: "Cliente ejemplo",
  description: "Informacion relevante",
  status: "active",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### 7. Server-side primero

El proyecto debe priorizar el uso de funcionalidades server-side de Next.js.

Se espera que usen:

- Server Components para paginas protegidas y listados.
- Server Actions o Route Handlers para crear, editar y eliminar datos.
- Client Components cuando necesiten interactividad, formularios controlados o estado en pantalla.

No conviertan toda la aplicacion en client-side sin necesidad.

### 8. Interfaz

La aplicacion debe tener una interfaz clara y usable.

Requisitos minimos:

- Dark mode consistente.
- Navegacion clara dentro del dashboard.
- Formularios entendibles.
- Estados vacios.
- Mensajes de error o validacion.
- Diseno responsive.
- Botones y acciones visualmente consistentes.

## Etapas sugeridas

### Etapa 1 - Tema y modelo

Definir:

- Nombre de la SaaS.
- Problema que resuelve.
- Usuario objetivo.
- Entidad principal.
- Campos de esa entidad.

Ejemplo:

```txt
SaaS: Turnito
Problema: profesionales independientes necesitan organizar sus turnos.
Entidad principal: turnos
Campos: cliente, fecha, hora, estado, notas
```

### Etapa 2 - Firestore

Configurar Firebase:

- Crear proyecto propio.
- Habilitar Auth.
- Habilitar Firestore.
- Completar `.env`.
- Probar login.
- Probar lectura/escritura de datos.

### Etapa 3 - ABM principal

Crear las pantallas necesarias para:

- Listar registros.
- Crear un registro.
- Editar un registro.
- Eliminar un registro.

Todas las operaciones deben respetar el usuario autenticado.

### Etapa 4 - Dashboard

Mejorar `/dashboard` para que muestre informacion real de la SaaS.

Ejemplos:

- Cantidad total de registros.
- Ultimos registros.
- Registros por estado.
- Acciones rapidas.

### Etapa 5 - Pulido final

Completar:

- Validaciones.
- Estados vacios.
- Manejo de errores.
- README final.
- Limpieza visual.
- Prueba general del flujo.

## Entregables

Cada grupo debe entregar:

- Codigo fuente completo.
- README actualizado.
- Variables de entorno de ejemplo en `.env.example`.
- Link al repositorio.
- Capturas o breve demo del funcionamiento.

El README final debe incluir:

- Nombre de la SaaS.
- Integrantes.
- Descripcion del problema.
- Funcionalidades implementadas.
- Entidad principal y campos.
- Rutas principales.
- Instrucciones para correr el proyecto.

## Criterios de evaluacion

- Autenticacion y rutas protegidas: 20%.
- Modelo de datos y aislamiento por usuario: 20%.
- ABM funcional: 25%.
- Uso correcto de Next.js server-side: 15%.
- Interfaz, responsive y experiencia de uso: 10%.
- Documentacion y presentacion: 10%.

## Setup del proyecto

1. Instalar dependencias:

```bash
npm install
```

2. Copiar variables de entorno:

```bash
cp .env.example .env
```

3. Completar `.env` con los datos de Firebase Web App y Firebase Admin SDK.

4. En Firebase Console habilitar Authentication con:

- Email/Password.
- Google.

5. Habilitar Cloud Firestore.

6. Ejecutar el servidor:

```bash
npm run dev
```

7. Abrir:

```txt
http://localhost:3000
```

## Variables de entorno

El cliente usa variables publicas:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

El servidor usa Firebase Admin SDK:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

La clave privada debe mantener los saltos de linea escapados con `\n`.

Nunca subir `.env` al repositorio.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Propuesta para avanzar con Firestore

El siguiente paso recomendado para este boilerplate es agregar un ABM base de ejemplo usando Firestore.

Ese ABM no deberia imponer el tema final de la SaaS. Conviene llamarlo de forma generica, por ejemplo `items`, para que cada grupo pueda renombrarlo y adaptarlo a su dominio.

La base podria incluir:

- Helper server-side para Firestore Admin.
- Coleccion `items`.
- Ruta `/dashboard/items`.
- Formulario para crear items.
- Listado de items del usuario autenticado.
- Acciones server-side para crear y eliminar.

Luego cada grupo deberia transformar `items` en su entidad real: `clientes`, `turnos`, `productos`, `gastos`, etc.
