# ALMI
Alexandria Library Management Interface

**ALXI-ALMI** es una solución SaaS para la administración de bibliotecas. Desarrollado sobre el ecosistema **Bun** para maximizar el rendimiento, la eficiencia y sencillez en el desarrollo.

---

## Stack Tecnológico 

* **Runtime & Package Manager:** [Bun](https://bun.sh/) (Soporte nativo para TypeScript y SQLite).
* **Lenguaje:** TypeScript
* **Servidor HTTP:** Bun Native Server (Arquitectura de alto rendimiento sin dependencias pesadas).
* **Base de Datos:** SQLite (vía `bun:sqlite`) (Persistencia en base de datos real).
* **Integraciones:** [OpenLibrary API](https://openlibrary.org/developers/api) para enriquecimiento de datos.

---

## 📂 Estructura del Proyecto

```text
/ALXI-ALMI
├── src/
│   ├── api/                # Backend: Lógica del Servidor
│   │   ├── routes/         # Definición de rutas y endpoints
│   │   ├── services/       # Lógica de negocio (Clases POO)
│   │   └── controllers/    # Controladores de petición/respuesta
│   ├── web/                # Frontend: Aplicación Web (Vanilla TS)
│   │   ├── components/     # Componentes UI (Clases reutilizables)
│   │   ├── assets/         # Estilos (CSS) y recursos estáticos
│   │   └── main.ts         # Punto de entrada de la UI
│   ├── shared/             # Contratos de Datos
│   │   └── types.ts        # Tipos e Interfaces compartidas Front/Back
│   ├── data/               # Capa de Persistencia
│   │   ├── database.ts
│   │   └── seed.ts         # Script de carga de datos iniciales
│   └── utils/              # Utilidades (Wrapper OpenLibrary API)
├── public/                 # Archivos estáticos (index.html)
├── tests/                  
├── .env                 
├── bun.lockb              
└── package.json
```

## 🔌 Catálogo de Endpoints (API Reference)

### 👤 Gestión de Socios
* **POST** `/api/socios`: Alta de nuevo socio en el sistema.
* **GET** `/api/socios`: Listado completo de socios registrados.
* **GET** `/api/socios/:id`: Consulta de los datos específicos de un socio.
* **PUT** `/api/socios/:id`: Modificación de datos de un usuario existente.
* **DELETE** `/api/socios/:id`: Baja definitiva de un socio.

### 📖 Gestión de Libros
* **POST** `/api/libros`: Registro y adquisición de nuevos ejemplares.
* **GET** `/api/libros`: Listado del catálogo bibliotecario completo.
* **GET** `/api/libros/genero/:genero`: Consulta de libros filtrados por género.
* **GET** `/api/libros/search/:isbn`: **Feature Plus:** Consulta externa a OpenLibrary para autocompletado de metadatos.
* **DELETE** `/api/libros/:id`: Eliminación de un ejemplar del catálogo.

### 🤝 Gestión de Préstamos
* **POST** `/api/prestamos`: Registro de préstamo de ejemplares disponibles.
* **GET** `/api/prestamos/no-devueltos`: Consulta de préstamos pendientes de entrega.
* **GET** `/api/prestamos/vencidos`: Listado de préstamos con fecha de devolución superada.
* **GET** `/api/prestamos/no-vencidos`: Listado de préstamos en periodo de vigencia.
* **GET** `/api/prestamos/socio/:id`: Histórico de préstamos asociados a un socio específico.

### 🔄 Gestión de Devoluciones
* **POST** `/api/devoluciones`: Registro de devoluciones de ejemplares.
* **GET** `/api/devoluciones/socio/:id`: Consulta de libros devueltos por un socio (Histórico).