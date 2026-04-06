# Fill My Resume — Chrome Extension

## Problema que resuelve

Llenar formularios de aplicación laboral en plataformas como Gupy, Remotely, LinkedIn, Indeed y RemoteWorks es repetitivo y consume mucho tiempo. El usuario tiene que copiar y pegar la misma información una y otra vez, adaptando el contenido a cada plataforma. Esta extensión guarda la información del CV una sola vez y la pone disponible en un panel lateral mientras el usuario navega cualquier página web.

---

## Usuarios objetivo

### Camila Santos (Sales / Account Executive)
- 27 años, São Paulo, Brasil
- Aplica a 10-15 posiciones por semana, generalmente en las noches/fines de semana
- Frustración principal: plataformas distintas piden los mismos datos con campos diferentes
- Necesita velocidad: no puede gastar 45 minutos por aplicación

### Alex Rivera (Product Manager / Brand Manager)
- 32-38 años, América Latina (Bolivia/Brasil), multilingüe
- 7+ años de experiencia, activamente buscando empleo
- Aplica a 5-15 posiciones por semana
- Frustraciones: re-entrada de datos, cambio de contexto entre plataformas, gestión de versiones

---

## Solución

Un **plugin de Google Chrome** (Manifest V3) que:
1. Permite al usuario guardar su CV de forma estructurada (campos editables)
2. Se abre como **panel lateral nativo** (Chrome Side Panel API) en cualquier página web
3. El usuario hace click en cualquier campo del panel → se copia al portapapeles → pega con Ctrl+V en el formulario
4. Los datos persisten localmente indefinidamente (sin cuenta, sin backend, sin conexión a internet)

---

## Campos que se guardan

### Perfil personal
- Nombre completo
- Email
- Teléfono
- País / Ciudad
- LinkedIn URL

### Perfil profesional
- Título de ocupación (ej: Product Manager | Product Owner)
- Bio / Descripción breve (párrafo de presentación)

### Experiencia laboral (múltiples entradas)
Por cada empresa:
- Nombre de la empresa
- Cargo / Título del rol
- Mes y año de inicio
- Mes y año de fin (o "Presente")
- País
- Tipo de contrato: remoto / híbrido / presencial
- Sobre la empresa (descripción breve)
- Responsabilidades (alineadas al puesto que se está aplicando)
- Logros (métricas, resultados)
- Herramientas utilizadas

### Educación (múltiples entradas)
- Institución
- Título obtenido
- Campo de estudio
- Año de inicio / fin

### Certificaciones (múltiples entradas)
- Nombre del certificado
- Mes y año de inicio
- Mes y año de conclusión
- URL del certificado

### Skills
- Lista de habilidades técnicas (texto libre o etiquetas)

### Idiomas
- Idioma + nivel (nativo, fluido, intermedio, básico)

---

## Arquitectura técnica

### Tecnologías

| Componente | Tecnología | Razón |
|---|---|---|
| Extension | Chrome Manifest V3 | Estándar actual obligatorio |
| Panel lateral | Chrome Side Panel API | Nativo, sin popups molestos |
| Almacenamiento | `chrome.storage.local` | Local, persiste sin login, sin backend |
| PDF parsing | `pdf.js` (Mozilla) | Corre en el navegador, sin servidor |
| UI | HTML + CSS + JS vanilla (o React ligero) | Simple, sin dependencias pesadas |

### Estructura de archivos

```
extension/
├── manifest.json
├── background/
│   └── service-worker.js      ← Activa el side panel, maneja eventos del navegador
├── sidepanel/
│   ├── index.html             ← UI principal del panel lateral
│   ├── sidepanel.js           ← Lógica: mostrar datos, botones de copiar
│   └── sidepanel.css          ← Estilos del panel
├── onboarding/
│   ├── index.html             ← Primera vez: formulario de carga manual + opción PDF
│   └── onboarding.js          ← Lógica de onboarding y guardado inicial
├── utils/
│   ├── storage.js             ← Abstracción de chrome.storage.local
│   └── pdfParser.js           ← Extracción de texto de PDF con pdf.js (opcional/asistido)
└── assets/
    └── icons/
```

### Modelo de datos (chrome.storage.local)

```json
{
  "profile": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "occupationTitle": "",
    "bio": ""
  },
  "workExperience": [
    {
      "id": "uuid",
      "companyName": "",
      "jobTitle": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "current": false,
      "country": "",
      "contractType": "remote | hybrid | onsite",
      "aboutCompany": "",
      "responsibilities": "",
      "achievements": "",
      "toolsUsed": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startYear": "",
      "endYear": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "url": ""
    }
  ],
  "skills": [],
  "languages": [
    { "language": "", "level": "native | fluent | intermediate | basic" }
  ]
}
```

---

## Flujo de usuario

### Primera vez
1. Usuario instala la extensión
2. Se abre la página de **onboarding**
3. Llena el formulario campo por campo (sección por sección)
4. Opcionalmente puede subir un PDF para que el sistema intente pre-llenar los campos
5. Revisa y confirma → datos guardados en `chrome.storage.local`

### Uso diario
1. Usuario entra a Gupy / LinkedIn / Remotely / etc.
2. Hace click en el ícono de la extensión (o atajo de teclado)
3. Se abre el **panel lateral** con su información organizada por secciones
4. Hace click en el campo que necesita → se copia al portapapeles
5. Pega con Ctrl+V en el formulario de la página
6. Panel permanece abierto mientras navega

### Persistencia
- Los datos se guardan automáticamente en `chrome.storage.local`
- Persisten hasta que el usuario desinstale la extensión o limpie manualmente
- No requiere cuenta, login, ni conexión a internet

---

## Fases de desarrollo

### Fase 1 — MVP
- [ ] Manifest V3 configurado con Side Panel
- [ ] Onboarding: formulario manual de carga de datos
- [ ] Almacenamiento en chrome.storage.local
- [ ] Panel lateral con secciones colapsables
- [ ] Botón de copiar por campo (→ portapapeles → Ctrl+V)
- [ ] Edición de datos desde el panel

### Fase 2 — PDF Upload
- [ ] Subir PDF en onboarding
- [ ] Parseo local con pdf.js
- [ ] Pre-llenado de campos desde el PDF (con revisión manual)

### Fase 3 — IA (futuro)
- [ ] Detección automática de campos en el formulario de la página activa
- [ ] Sugerencia de qué pegar en cada campo según el contexto del puesto
- [ ] Evaluar backend Python (FastAPI) para llamadas seguras a Claude API — solo si se decide conectar a servicios externos
