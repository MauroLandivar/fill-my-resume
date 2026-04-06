# Design References & System

## Referencias visuales y bibliográficas

### UI Reference
- **Nombre**: Web Sidebar Menu
- **Fuente**: Dribbble — shot 23370518
- **URL**: https://dribbble.com/shots/23370518-Web-Sidebar-Menu
- **Uso**: Referencia visual para el layout y estilo del panel lateral de la extensión
- **Pendiente**: Extraer paleta de colores, tipografía y patrones de componentes una vez accesible

### Libro de referencia — Design Systems
- **Título**: Design Systems (Smashing eBooks)
- **Autor**: Alla Kholmatova
- **Fuente**: https://www.amazon.com.br/Design-Systems-Smashing-eBooks-English-ebook/dp/B076H49W1G
- **Uso**: Guía metodológica para definir patrones de diseño, componentes reutilizables, tokens de diseño y lenguaje visual coherente de la extensión

---

## Principios a aplicar del libro (Design Systems — Alla Kholmatova)

Basado en los fundamentos del libro, el sistema de diseño de esta extensión debe contemplar:

### 1. Functional Patterns (Patrones funcionales)
Componentes con propósito claro e independiente:
- `FieldCard` — tarjeta con el valor del campo + botón copiar
- `SectionAccordion` — sección colapsable (Perfil, Experiencia, etc.)
- `CopyButton` — botón de acción principal con feedback visual (✓ copiado)
- `FormInput` — input de texto para onboarding y edición
- `TagChip` — para skills e idiomas

### 2. Perceptual Patterns (Patrones perceptuales)
Decisiones visuales que dan coherencia:
- **Tipografía**: una sola familia sans-serif, máximo 3 tamaños (heading, body, caption)
- **Color**: paleta limitada — color primario de acción, neutros para fondo y texto, color de feedback (copiado)
- **Espaciado**: sistema de 4px/8px/16px/24px (múltiplos de 4)
- **Iconografía**: set único y consistente (ej: Heroicons o Lucide)

### 3. Shared Language (Lenguaje compartido)
Nomenclatura consistente en código y UI:
- Sección = grupo de campos relacionados
- Campo = unidad mínima de información copiable
- Entrada = un registro dentro de una sección (ej: una empresa en Experiencia)

### 4. Design Tokens (pendiente de definir con referencia visual)
- `--color-primary`: (por definir con Dribbble ref)
- `--color-bg`: (por definir)
- `--color-text`: (por definir)
- `--color-success`: feedback de "copiado"
- `--radius`: border-radius base
- `--spacing-unit`: 4px

---

## Estructura visual del Side Panel (propuesta)

```
┌─────────────────────────┐
│  [Ícono]  Fill My Resume │  ← Header fijo
│  ──────────────────────  │
│  ▼ Perfil Personal       │  ← Sección colapsable
│    Nombre   [Copiar]     │
│    Email    [Copiar]     │
│    Teléfono [Copiar]     │
│  ──────────────────────  │
│  ▼ Perfil Profesional    │
│    Título   [Copiar]     │
│    Bio      [Copiar]     │
│  ──────────────────────  │
│  ▼ Experiencia Laboral   │
│    ▸ Empresa 1           │  ← Sub-entrada colapsable
│    ▸ Empresa 2           │
│  ──────────────────────  │
│  ▼ Certificaciones       │
│  ▼ Skills                │
│  ▼ Idiomas               │
│  ──────────────────────  │
│  [✎ Editar perfil]       │  ← Footer fijo
└─────────────────────────┘
```

---

## Pendientes de diseño

- [ ] Ver imagen del Dribbble shot 23370518 para extraer: paleta, tipografía, radio de bordes, estilo de íconos
- [ ] Definir design tokens concretos basados en la referencia visual
- [ ] Crear guía de componentes basada en los patrones del libro
