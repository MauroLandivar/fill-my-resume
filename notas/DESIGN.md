# Design References & System

## Referencias visuales y bibliográficas

### UI Reference
- **Nombre**: Web Sidebar Menu
- **Fuente**: Dribbble — shot 23370518
- **URL**: https://dribbble.com/shots/23370518-Web-Sidebar-Menu
- **Uso**: Referencia visual para el layout y estilo del panel lateral de la extensión

### Libro de referencia — Design Systems
- **Título**: Design Systems (Smashing eBooks)
- **Autor**: Alla Kholmatova
- **Fuente**: https://www.amazon.com.br/Design-Systems-Smashing-eBooks-English-ebook/dp/B076H49W1G
- **Uso**: Guía metodológica para definir patrones, componentes reutilizables, tokens y lenguaje visual

---

## Análisis visual del UI de referencia (Dribbble shot 23370518)

### Estilo general
Minimalista, monocromático, clean. Predominan grises claros con negro puro para el estado activo. Un único acento de color (magenta/rosa) solo para notificaciones. Muy amplio uso de border-radius — formas de píldora en todos los elementos interactivos.

### Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `--color-bg-outer` | `#E8E8E8` | Fondo exterior del panel / página |
| `--color-bg-panel` | `#F4F4F4` | Fondo del sidebar principal |
| `--color-bg-selected` | `#FFFFFF` | Ítem de sub-menú seleccionado |
| `--color-active` | `#111111` | Fondo de ítem activo (píldora negra) |
| `--color-text-primary` | `#111111` | Texto principal |
| `--color-text-secondary` | `#888888` | Texto secundario / labels de sección |
| `--color-text-on-active` | `#FFFFFF` | Texto sobre fondo activo negro |
| `--color-accent` | `#E91E8C` | Solo para badges/notificaciones (magenta) |
| `--color-divider` | `#E0E0E0` | Líneas separadoras entre secciones |
| `--color-badge-bg` | `#111111` | Fondo de badge de contador |
| `--color-badge-text` | `#FFFFFF` | Texto del badge |

### Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--font-family` | Inter, system-ui, sans-serif | Única familia tipográfica |
| `--font-size-header` | `18px` | Título del panel ("Menu") |
| `--font-size-body` | `14px` | Ítems de navegación |
| `--font-size-caption` | `12px` | Labels de sección, contadores |
| `--font-weight-bold` | `600` | Header, ítem activo |
| `--font-weight-regular` | `400` | Ítems normales |

### Espaciado (sistema de 4px)

| Token | Valor | Uso |
|---|---|---|
| `--space-1` | `4px` | Micro espaciado |
| `--space-2` | `8px` | Espaciado interno de íconos |
| `--space-3` | `12px` | Padding vertical de ítems |
| `--space-4` | `16px` | Padding horizontal de ítems |
| `--space-6` | `24px` | Separación entre secciones |
| `--space-8` | `32px` | Padding del panel |

### Border Radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-pill` | `999px` | Ítems activos, sub-ítems seleccionados |
| `--radius-panel` | `24px` | Contenedor del panel lateral |
| `--radius-badge` | `999px` | Badges circulares |
| `--radius-icon-rail` | `32px` | Rail colapsado de íconos (top redondeado) |

### Sombras

| Token | Valor | Uso |
|---|---|---|
| `--shadow-selected` | `0 2px 8px rgba(0,0,0,0.08)` | Sub-ítem seleccionado (tarjeta blanca) |
| `--shadow-panel` | `0 4px 24px rgba(0,0,0,0.06)` | Panel flotante |

### Íconos
- Estilo: **stroke thin** (trazo fino, ~1.5px)
- Set recomendado: **Lucide Icons** o **Hugeicons** (ambos open source, thin stroke)
- Tamaño: 20px en sidebar, 18px en sub-panel
- Color: heredan `--color-text-primary`, en estado activo cambian a `--color-text-on-active`

---

## Principios del libro aplicados (Design Systems — Alla Kholmatova)

### 1. Functional Patterns (Patrones funcionales)
Componentes con propósito único y reutilizable:

| Componente | Descripción |
|---|---|
| `<SectionHeader>` | Título de sección colapsable con contador e ícono de acción |
| `<NavItem>` | Ítem de navegación: ícono + label + estado activo/normal |
| `<FieldCard>` | Campo del CV: label + valor + botón copiar |
| `<CopyButton>` | Botón de acción con feedback visual (→ ✓ Copiado) |
| `<EntryCard>` | Tarjeta de una entrada (empresa, certificación, etc.) |
| `<Badge>` | Contador circular, solo para notificaciones |
| `<Divider>` | Línea separadora entre secciones |
| `<TagChip>` | Etiqueta para skills e idiomas |

### 2. Perceptual Patterns (Patrones perceptuales)
Decisiones visuales que dan coherencia a toda la UI:
- **Una sola familia tipográfica**: Inter
- **Monocromático + un acento**: nunca más de un color de acento activo a la vez
- **Forma de píldora** para todos los estados interactivos seleccionados
- **Íconos thin stroke** consistentes en toda la extensión
- **Grises cálidos**, no fríos (ligeramente hacia el beige)

### 3. Shared Language (Lenguaje compartido)
Nomenclatura consistente en diseño y código:
- **Sección**: grupo lógico de campos (Perfil, Experiencia, Educación...)
- **Entrada**: un ítem dentro de una sección (ej: una empresa)
- **Campo**: unidad mínima copiable (ej: nombre de la empresa)
- **Panel**: el contenedor lateral completo de la extensión
- **Rail**: la barra colapsada de íconos (solo visible si se implementa modo compacto)

### 4. Design Tokens
Todos definidos arriba. Se implementarán como variables CSS (`--token-name`) en un archivo `tokens.css` global.

---

## Layout del Side Panel (basado en la referencia visual)

```
┌──────────────────────────────┐
│  ✦  Fill My Resume           │  ← Header (bold, 18px, ícono estrella)
│  ────────────────────────    │  ← Divider
│                              │
│  ▼  Perfil Personal          │  ← SectionHeader colapsable
│    [👤] Nombre               │
│         John Doe    [Copiar] │  ← FieldCard
│    [✉] Email                 │
│         john@...   [Copiar]  │
│                              │
│  ▼  Perfil Profesional       │
│    [💼] Título               │
│         Product Manager [📋] │
│    [📝] Bio         [Copiar] │
│                              │
│  ▼  Experiencia  (2)         │
│    ┌─────────────────────┐   │  ← EntryCard seleccionada (blanca, pill)
│    │ ▸ Viva — Bolivia    │   │
│    └─────────────────────┘   │
│      ▸ Empresa 2             │
│                              │
│  ▼  Certificaciones  (3)     │
│  ▼  Skills                   │
│  ▼  Idiomas                  │
│  ────────────────────────    │
│  [✎ Editar perfil]           │  ← Footer fijo, ghost button
└──────────────────────────────┘
```

---

## Estados de los componentes

| Componente | Normal | Hover | Activo/Seleccionado |
|---|---|---|---|
| NavItem / Sección | bg transparente, texto `--color-text-primary` | bg `#E8E8E8` | bg `--color-active` (#111), texto blanco, pill |
| EntryCard | bg transparente | bg `#F0F0F0` | bg `#FFFFFF`, sombra `--shadow-selected`, pill |
| CopyButton | ícono gris | ícono negro | flash verde → vuelve a gris |
| FieldCard | border `--color-divider` | border `#BBBBBB` | — |

---

## Pendientes de diseño

- [x] Analizar imagen del Dribbble shot 23370518
- [x] Extraer paleta de colores y tokens
- [x] Definir tipografía, espaciado, border-radius
- [x] Mapear componentes según Design Systems (Kholmatova)
- [x] Íconos: **Lucide Icons** (más simple, más conocido, open source)
- [ ] Crear archivo `tokens.css` base al iniciar el código
- [x] Layout: **panel acordeón** — secciones colapsables/expandibles, sin modo compacto
