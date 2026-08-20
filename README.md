# Trabajo Practico: Desarrollo de una Aplicacion SaaS con Next.js y Firebase

## Presentacion

Este repositorio proporciona un boilerplate para el desarrollo de una aplicacion web de tipo SaaS utilizando Next.js, Firebase Authentication, Firebase Admin SDK, Firestore y Tailwind CSS.

El trabajo practico debera realizarse en grupos de 2 integrantes. Cada grupo debera definir una propuesta propia de aplicacion, disenar su modelo de datos, implementar las rutas y componentes necesarios, y desarrollar una funcionalidad principal que permita a los usuarios autenticados gestionar informacion persistente.

La finalidad del trabajo es integrar conceptos de desarrollo web moderno, autenticacion, autorizacion, persistencia de datos, arquitectura basada en componentes y diseno de interfaces orientadas a productos digitales.

## Que Es Una SaaS

Una SaaS, o Software as a Service, es una aplicacion de software disponible a traves de internet que permite a los usuarios acceder a funcionalidades sin instalar programas localmente. En este modelo, la aplicacion se ejecuta en servidores remotos y los usuarios interactuan con ella mediante un navegador.

En terminos practicos, una SaaS suele incluir:

- Registro e inicio de sesion de usuarios.
- Gestion de datos propios de cada usuario.
- Panel privado o dashboard.
- Funcionalidades especificas asociadas a un problema o necesidad.
- Persistencia de informacion en una base de datos.
- Separacion entre vistas publicas y vistas protegidas.

Ejemplos conocidos de productos SaaS son gestores de tareas, plataformas de estudio, herramientas de finanzas personales, sistemas de organizacion de proyectos, aplicaciones de planificacion, CRMs, sistemas de reservas, plataformas de contenido y herramientas colaborativas.

## Objetivo General

Desarrollar una aplicacion SaaS funcional a partir del boilerplate provisto.

Cada grupo debera definir un problema concreto, proponer una solucion digital y construir una aplicacion que permita a un usuario autenticado crear, consultar, modificar y eliminar informacion propia.

El resultado esperado no es una maqueta visual ni una landing page estatica, sino una aplicacion web con autenticacion, rutas protegidas, persistencia de datos y una funcionalidad principal completa.

## Tecnologias Incluidas En El Boilerplate

El proyecto base incluye:

- Next.js con App Router.
- JavaScript.
- Tailwind CSS.
- Dark mode.
- Tipografia Geist mediante `next/font`.
- Firebase Authentication.
- Inicio de sesion con email y contrasena.
- Inicio de sesion con Google.
- Sesion server-side mediante cookie HTTP-only.
- Rutas protegidas.
- Dashboard privado en `/dashboard`.
- Firebase Admin SDK para validacion de sesion desde el servidor.

## Tematicas Posibles

La tematica de la SaaS es libre, pero debe responder a una necesidad clara y permitir la gestion de informacion por parte de usuarios autenticados.

Se recomienda elegir problemas cercanos a estudiantes universitarios, jovenes profesionales, emprendimientos iniciales o actividades cotidianas de personas entre 19 y 25 anos.

Ejemplos sugeridos:

- Organizador de materias, parciales y entregas.
- Gestor de gastos personales o compartidos.
- Seguimiento de habitos de estudio, sueno o entrenamiento.
- Planificador de rutinas de gimnasio.
- Gestor de proyectos freelance.
- Administrador de pedidos para un emprendimiento pequeno.
- Catalogo de productos para venta por redes sociales.
- Registro de suscripciones y pagos mensuales.
- Organizador de viajes grupales.
- Gestor de eventos universitarios.
- Plataforma para administrar apuntes o recursos de cursada.
- Seguimiento de postulaciones laborales.
- Registro de clientes para servicios independientes, como diseno, fotografia, clases particulares o community management.
- Planificador de contenido para redes sociales.

No se evaluara la originalidad del tema por si sola, sino la coherencia entre el problema elegido, el modelo de datos, las funcionalidades implementadas y la experiencia de uso.

## Alcance Obligatorio

La aplicacion debe cumplir con los siguientes requisitos minimos.

### 1. Autenticacion

La aplicacion debe permitir:

- Registro con email y contrasena.
- Inicio de sesion con email y contrasena.
- Inicio de sesion con Google.
- Cierre de sesion.
- Proteccion de rutas privadas.

Las rutas internas de la aplicacion no deben ser accesibles por usuarios no autenticados.

### 2. Dashboard Privado

La ruta `/dashboard` debe funcionar como panel principal de la SaaS.

Debe mostrar informacion relevante para el usuario autenticado, por ejemplo:

- Resumen general de la actividad.
- Cantidad total de registros.
- Ultimos registros creados.
- Accesos directos a las acciones principales.
- Estado general de la informacion gestionada.

El dashboard debe ser especifico para la tematica elegida por el grupo.

### 3. Entidad Principal

Cada aplicacion debe definir al menos una entidad principal.

Ejemplos:

- Materias.
- Entregas.
- Gastos.
- Habitos.
- Rutinas.
- Productos.
- Pedidos.
- Proyectos.
- Clientes.
- Publicaciones.
- Viajes.
- Eventos.
- Postulaciones.

La entidad debe tener campos adecuados al problema elegido. No alcanza con una entidad generica sin relacion con la propuesta.

Ejemplo:

```txt
Aplicacion: Gestor de gastos compartidos
Entidad principal: gastos
Campos posibles: titulo, monto, categoria, fecha, pagadoPor, estado
```

### 4. ABM Completo

La entidad principal debe permitir:

- Alta: crear nuevos registros.
- Baja: eliminar registros existentes.
- Modificacion: editar registros.
- Listado: visualizar los registros guardados.

Las operaciones deben estar integradas en la interfaz de la aplicacion y deben persistir los datos en Firestore.

### 5. Persistencia En Firestore

Cada grupo debera utilizar Cloud Firestore como base de datos.

Cada documento debe guardar la relacion con el usuario autenticado mediante su `uid`.

Ejemplo de documento:

```js
{
  userId: "uid-del-usuario",
  title: "Entrega de Programacion",
  description: "Resolver ejercicio integrador",
  status: "pending",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

Un usuario no debe poder ver, editar ni eliminar datos pertenecientes a otro usuario.

### 6. Rutas Y Componentes Propios

Cada grupo debera agregar las rutas, componentes y acciones necesarias para su aplicacion.

Ejemplo de estructura posible:

```txt
app/
  dashboard/
    page.js
    gastos/
      page.js
      new/
        page.js
      [id]/
        edit/
          page.js

components/
  ExpenseForm.js
  ExpenseList.js
  EmptyState.js
```

Tambien puede utilizarse una estructura mas compacta:

```txt
app/
  dashboard/
    habits/
      page.js
      actions.js

components/
  HabitForm.js
  HabitList.js
```

La estructura debe ser consistente, legible y adecuada al tamano del proyecto.

### 7. Uso De Funcionalidades Server-Side

El proyecto debera priorizar las capacidades server-side de Next.js.

Se espera el uso de:

- Server Components para paginas protegidas y listados.
- Server Actions o Route Handlers para operaciones de escritura.
- Firebase Admin SDK para operaciones seguras desde el servidor.
- Client Components unicamente cuando sean necesarios para interactividad, formularios controlados o estados locales de interfaz.

No se aceptara una implementacion completamente client-side si las operaciones pueden resolverse desde el servidor.

### 8. Interfaz De Usuario

La aplicacion debe presentar una interfaz clara, consistente y usable.

Requisitos minimos de interfaz:

- Dark mode coherente.
- Navegacion interna clara.
- Formularios comprensibles.
- Estados vacios.
- Mensajes de error o validacion.
- Diseno responsive.
- Jerarquia visual adecuada.
- Botones y acciones consistentes.

## Alcance Ampliado

Los siguientes puntos no son obligatorios, pero pueden mejorar la calidad del proyecto:

- Filtros o busqueda.
- Estados para los registros, por ejemplo pendiente, activo, completado o cancelado.
- Ordenamiento por fecha, categoria o prioridad.
- Metricas adicionales en el dashboard.
- Subida de archivos o imagenes.
- Integracion con una API externa.
- Exportacion de datos en CSV.
- Roles simples, por ejemplo usuario y administrador.
- Limite de uso simulado por usuario.
- Pagina publica de presentacion del producto.

## Fuera De Alcance

No se requiere:

- Implementar pagos reales.
- Implementar multi-tenancy avanzado.
- Desarrollar una aplicacion movil nativa.
- Crear un sistema de roles complejo.
- Implementar notificaciones push.
- Publicar obligatoriamente en produccion.
- Utilizar TypeScript.

Estos elementos pueden incorporarse de manera opcional si el grupo lo considera pertinente y si no comprometen los requisitos minimos.

## Etapas De Desarrollo

### Etapa 1: Definicion Del Producto

Cada grupo debera definir:

- Nombre de la SaaS.
- Problema que busca resolver.
- Usuario objetivo.
- Entidad principal.
- Campos principales de la entidad.
- Flujo de uso esperado.

Ejemplo:

```txt
Nombre: StudyTrack
Problema: estudiantes universitarios necesitan organizar entregas, parciales y tareas.
Usuario objetivo: estudiantes de carreras universitarias.
Entidad principal: tareas academicas.
Campos: titulo, materia, fecha de entrega, prioridad, estado, notas.
```

### Etapa 2: Configuracion De Firebase

Cada grupo debera:

- Crear su propio proyecto en Firebase.
- Habilitar Firebase Authentication.
- Habilitar proveedores de email/password y Google.
- Habilitar Cloud Firestore.
- Configurar las variables de entorno.
- Verificar el inicio y cierre de sesion.

### Etapa 3: Modelo De Datos Y Firestore

Cada grupo debera:

- Definir la coleccion principal.
- Definir los campos de cada documento.
- Guardar el `uid` del usuario autenticado.
- Implementar consultas filtradas por usuario.
- Validar que los datos de un usuario no sean accesibles por otro.

Ejemplos de colecciones:

```txt
tasks
expenses
habits
projects
products
orders
applications
events
```

### Etapa 4: ABM Principal

Implementar las pantallas y acciones necesarias para:

- Crear registros.
- Listar registros.
- Editar registros.
- Eliminar registros.

La funcionalidad debe ser verificable desde la interfaz.

### Etapa 5: Dashboard Y Experiencia De Uso

Adaptar `/dashboard` para mostrar informacion real del proyecto.

Ejemplos:

- Total de registros.
- Ultimos elementos cargados.
- Cantidad de elementos por estado.
- Acciones frecuentes.
- Informacion resumida para la toma de decisiones.

### Etapa 6: Documentacion Y Revision Final

Completar el README del proyecto final, revisar el flujo completo y verificar que la aplicacion pueda ejecutarse correctamente desde cero.

## Entregables

Cada grupo debera entregar:

- Repositorio completo del proyecto.
- README actualizado.
- Archivo `.env.example` con las variables necesarias sin valores secretos.
- Capturas de pantalla o breve demostracion funcional.
- Descripcion de la entidad principal y su modelo de datos.

El README final del grupo debe incluir:

- Nombre de la SaaS.
- Integrantes.
- Descripcion del problema.
- Usuario objetivo.
- Funcionalidades implementadas.
- Entidad principal y campos.
- Rutas principales.
- Instrucciones para ejecutar el proyecto.

## Criterios De Evaluacion

- Autenticacion y proteccion de rutas: 20%.
- Modelo de datos y aislamiento por usuario: 20%.
- ABM funcional sobre Firestore: 25%.
- Uso adecuado de Next.js server-side: 15%.
- Interfaz, responsive y experiencia de uso: 10%.
- Documentacion y presentacion: 10%.

## Configuracion Inicial Del Proyecto

1. Instalar dependencias:

```bash
npm install
```

2. Copiar las variables de entorno:

```bash
cp .env.example .env
```

3. Completar `.env` con los datos de Firebase Web App y Firebase Admin SDK.

4. En Firebase Console habilitar Authentication con:

- Email/Password.
- Google.

5. Habilitar Cloud Firestore.

6. Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

7. Abrir la aplicacion:

```txt
http://localhost:3000
```

## Variables De Entorno

Variables publicas utilizadas por el cliente:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Variables privadas utilizadas por Firebase Admin SDK:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

La clave privada debe conservar los saltos de linea escapados mediante `\n`.

El archivo `.env` no debe subirse al repositorio.

## Scripts Disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Orientacion Para La Implementacion Con Firestore

Se recomienda incorporar un ABM base utilizando Firestore como referencia tecnica.

Una estrategia posible es implementar inicialmente una entidad generica denominada `items` y luego adaptarla al dominio elegido por cada grupo.

La implementacion base puede incluir:

- Helper server-side para Firestore Admin.
- Coleccion `items`.
- Ruta `/dashboard/items`.
- Formulario de creacion.
- Listado filtrado por usuario autenticado.
- Edicion de registros.
- Eliminacion de registros.
- Validacion de propiedad mediante `userId`.

Luego, cada grupo debera reemplazar la entidad generica por una entidad especifica de su SaaS, por ejemplo `expenses`, `habits`, `products`, `projects` o `applications`.
