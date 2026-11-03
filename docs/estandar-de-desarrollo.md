# Guía de Estándares y Organización del Proyecto

Este documento establece las pautas de trabajo para el desarrollo de la plataforma web de servicios de marketing de Darmax. Al ser un proyecto colaborativo, el objetivo es que cualquier persona del equipo, sin importar cuándo se integre, pueda entender el código con rapidez, trabajar con confianza y mantener un estándar uniforme y profesional.

---

## 1. Filosofía de Trabajo

1. **Claridad sobre complejidad:** Escribimos código pensado para que otras personas lo lean y mantengan con facilidad.
2. **Crecimiento progresivo:** No creamos carpetas ni archivos vacíos por anticipado. La estructura se expande únicamente cuando una necesidad real del proyecto lo justifica.
3. **Responsabilidad única:** Cada archivo y función debe cumplir una tarea concreta y bien definida.

---

## 2. Estilo de Comentarios

Los comentarios en el código deben ser sobrios, profesionales y directos. Su propósito es explicar el contexto o la razón detrás de una lógica, no adornar el archivo.

### Pautas generales
- No se deben utilizar recuadros decorativos, líneas de caracteres repetidos ni divisiones en arte ASCII (como secuencias de signos iguales, guiones o asteriscos enmarcados).
- Los comentarios no deben incluir opiniones personales, bromas ni modismos informales.
- Si una función o bloque de código es autoexplicativo por el nombre de sus variables, no requiere comentarios redundantes.
- Empleamos comentarios estándar de documentación para funciones principales y comentarios simples de una línea cuando sea necesario clarificar un paso específico.

### Ejemplo comparativo

**Incorrecto (decorativo y con lenguaje informal):**

```typescript
// ==========================================
// =         SECCION DE COTIZADOR           =
// ==========================================

// esta funcion super pro calcula el precio total con descuento loco
const calc = (p: any, d: any) => {
  return p - (p * d); // resta el descuento jeje
};
```

**Correcto (sobrio, profesional y explicativo):**

```typescript
/**
 * Calcula el importe final de un paquete de marketing aplicando un porcentaje de descuento.
 *
 * @param basePrice - Precio base del servicio en moneda local.
 * @param discountRate - Tasa de descuento en formato decimal (por ejemplo, 0.15 para 15%).
 * @returns El precio final tras deducir el descuento correspondiente.
 */
export function calculateDiscountedPrice(basePrice: number, discountRate: number): number {
  if (discountRate <= 0) {
    return basePrice;
  }

  const discountAmount = basePrice * discountRate;
  return basePrice - discountAmount;
}
```

---

## 3. Calidad de Tipado: Evitar el Uso de `any`

El uso de `any` anula las ventajas de TypeScript, oculta posibles fallas en tiempo de ejecución y reduce la efectividad del autocompletado en el editor.

### Reglas
- **Cero uso de `any`:** Todo parámetro, variable y retorno de función debe contar con un tipo explícito o inferido de forma segura.
- **Definición de contratos:** La información que maneja la plataforma (servicios de marketing, formularios de contacto, datos de clientes) debe modelarse mediante `interface` o `type`.
- **Datos externos:** Cuando se recibe información de fuentes externas cuyo formato aún no está verificado, se utiliza `unknown` acompañado de una validación previa antes de procesarla.

### Ejemplo comparativo

**Incorrecto:**

```typescript
// El tipo any desprotege los datos del cliente
export async function sendContactLead(formData: any): Promise<any> {
  const response = await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  return response.json();
}
```

**Correcto:**

```typescript
export interface ContactLeadInput {
  fullName: string;
  email: string;
  phone?: string;
  selectedService: 'seo' | 'social-media' | 'branding' | 'consulting';
  message: string;
}

export interface LeadSubmissionResult {
  success: boolean;
  leadId?: string;
  errorMessage?: string;
}

export async function sendContactLead(
  formData: ContactLeadInput
): Promise<LeadSubmissionResult> {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    return {
      success: false,
      errorMessage: 'No fue posible registrar la solicitud en este momento.',
    };
  }

  const data = (await response.json()) as { id: string };
  return {
    success: true,
    leadId: data.id,
  };
}
```

---

## 4. Estructura por Responsabilidades con `src/` y App Router

El proyecto utiliza **Next.js App Router dentro del directorio `src/`**. Esta configuración mantiene el código fuente separado de los archivos de configuración de la raíz y ofrece un punto de partida ordenado.

### Principio de Colocación (Colocation) en Next.js
En el App Router, las carpetas dentro de `src/app/` solo se transforman en páginas públicas si contienen archivos especiales reconocidos por Next.js, principalmente `page.tsx`. 

Esto significa que podemos colocar componentes, estilos o utilidades auxiliares directamente junto a la página que los utiliza, sin temor a exponer una URL pública por error.

### Esquema de Directorios

```text
DarmaxMarketing/
├── docs/                      # Documentación del proyecto y guías de trabajo
├── public/                    # Archivos estáticos públicos (imágenes, fuentes, iconos)
├── src/
│   ├── app/                   # Rutas y páginas del sitio (App Router)
│   ├── components/            # Biblioteca de interfaz visual compartida
│   │   └── ui/                # Elementos gráficos básicos y reutilizables
│   ├── modules/               # Módulos funcionales de negocio (Vertical Slicing)
│   ├── services/              # Clientes de APIs, integraciones y servicios externos
│   ├── lib/                   # Funciones utilitarias, formateadores y configuraciones
│   └── types/                 # Tipos e interfaces globales compartidos
├── next.config.ts             # Configuración de Next.js
├── package.json               # Dependencias y scripts del proyecto
└── tsconfig.json              # Configuración de TypeScript y alias de importación
```

### Responsabilidad de cada directorio

- **`src/app/`**: Contiene únicamente las definiciones de rutas, páginas (`page.tsx`), plantillas generales (`layout.tsx`) y manejadores de error (`error.tsx`, `not-found.tsx`). Su función es orquestar la navegación.
- **`src/components/ui/`**: Aloja componentes visuales genéricos y agnósticos de la lógica de negocio (botones, tarjetas, campos de formulario, modales).
- **`src/modules/`**: Organiza las funcionalidades del negocio de marketing en bloques independientes. Cada módulo agrupa su propia lógica, interfaces y componentes específicos.
- **`src/services/`**: Concentra las funciones encargadas de comunicarse con servicios externos (envío de correos, conexión con CRM, pasarelas o APIs externas).
- **`src/lib/`**: Reúne utilidades transversales y funciones puras que no dependen de la interfaz gráfica (formateo de monedas, manejo de fechas, constantes de configuración).
- **`src/types/`**: Contiene definiciones TypeScript comunes a múltiples partes de la aplicación.

---

## 5. Módulos de Dominio (Vertical Slicing)

En lugar de dispersar el código de una misma funcionalidad en carpetas genéricas distantes entre sí, aplicamos división vertical por módulo de negocio dentro de `src/modules/`.

Cada módulo representa un área de servicio o función específica del sitio de marketing.

### Ejemplo de organización modular

```text
src/modules/
├── contact/                   # Módulo de contacto y captura de clientes potenciales
│   ├── components/            # Formularios y elementos visuales propios de contacto
│   ├── hooks/                 # Lógica de estado y validación del formulario
│   ├── types.ts               # Tipos exclusivos del módulo de contacto
│   └── index.ts               # Punto de entrada público del módulo
└── services-catalog/          # Módulo de exhibición de servicios de marketing
    ├── components/            # Tarjetas de servicios, filtros, comparativas
    ├── types.ts               # Tipos del catálogo de servicios
    └── index.ts               # Exportaciones públicas del módulo
```

### Regla para módulos
Todo archivo que solo pertenezca y sirva a un módulo específico debe vivir dentro de la carpeta de ese módulo. Solo si un componente o utilidad es requerido por dos o más módulos distintos, se evalúa su traslado a `src/components/` o `src/lib/`.

---

## 6. Biblioteca UI Compartida (`src/components/ui/`)

Los componentes ubicados en `src/components/ui/` deben ser puramente visuales y no deben contener lógica de negocio ni llamadas directas a APIs.

- **Reutilización:** Diseñados para usarse indistintamente en cualquier sección del sitio.
- **Parametrización por propiedades (props):** Reciben su estado, textos y controladores de eventos desde el componente padre.
- **Independencia:** No deben importar elementos de `src/modules/` ni de `src/services/`.

---

## 7. Reglas de Importación entre Capas

Para prevenir dependencias circulares y mantener el código desacoplado, se establece una dirección estricta para las importaciones:

| Capa | Puede importar desde | No debe importar desde |
| :--- | :--- | :--- |
| **`app/`** (Páginas y Rutas) | `modules/`, `components/`, `services/`, `lib/`, `types/` | Ninguna restricción de consumo directo |
| **`modules/`** (Funcionalidades) | `components/ui/`, `services/`, `lib/`, `types/` | `app/`, ni otros módulos de forma cruzada no controlada |
| **`components/ui/`** (UI Base) | `lib/`, `types/` | `app/`, `modules/`, `services/` |
| **`services/`** (Integraciones) | `lib/`, `types/` | `app/`, `modules/`, `components/` |
| **`lib/`** (Utilidades) | `types/` | `app/`, `modules/`, `components/`, `services/` |

---

## 8. Convenciones de Importación (Path Aliases)

Para evitar rutas relativas largas y propensas a errores al mover archivos (como `../../../../components`), se utiliza el alias principal `@/*` configurado en `tsconfig.json`.

### Ejemplos de uso

**Incorrecto (rutas relativas frágiles):**

```typescript
import { Button } from '../../../components/ui/button';
import { ContactForm } from '../../modules/contact/components/contact-form';
import { formatCurrency } from '../../../../lib/formatters';
```

**Correcto (rutas absolutas mediante alias):**

```typescript
import { Button } from '@/components/ui/button';
import { ContactForm } from '@/modules/contact';
import { formatCurrency } from '@/lib/formatters';
import type { ContactLeadInput } from '@/types/leads';
```

---

## 9. Flujo de Trabajo y Control de Versiones con GitHub

Para asegurar un historial de cambios limpio, rastreable y seguro, todo el equipo sigue una metodología uniforme de control de versiones en GitHub.

### 9.1. Estrategia de Ramas

- **Rama principal (`main`):** Representa el estado estable y funcional del proyecto, listo para despliegue. No se realizan cambios directos sobre esta rama.
- **Ramas de trabajo:** Toda modificación se realiza en una rama secundaria creada a partir de `main`, nombrada de acuerdo con su propósito:
  - `feature/nombre-de-la-tarea`: Para el desarrollo de nuevas pantallas, componentes o funcionalidades (por ejemplo, `feature/formulario-contacto`, `feature/tarjetas-servicios`).
  - `fix/descripcion-del-problema`: Para corregir errores detectados (por ejemplo, `fix/calculo-descuento`, `fix/alineacion-menu-movil`).
  - `chore/descripcion-de-la-tarea`: Para tareas de mantenimiento, actualización de librerías o configuración del proyecto (por ejemplo, `chore/actualizar-dependencias`, `chore/configurar-fuentes`).

### 9.2. Mensajes de Confirmación (Commits)

Los mensajes de commit deben describir qué cambio se realizó de manera concisa y comprensible para cualquier miembro del equipo.

**Estructura recomendada:**

```text
tipo: descripción breve en tiempo presente o infinitivo
```

**Tipos comunes:**
- `feat:` Incorporación de una nueva funcionalidad.
- `fix:` Corrección de un fallo o error.
- `docs:` Cambios en la documentación o guías del proyecto.
- `style:` Ajustes visuales de formato o estilos que no alteran la lógica.
- `refactor:` Reorganización de código sin modificar el comportamiento externo.
- `chore:` Tareas de mantenimiento o configuración de herramientas.

**Ejemplos comparativos:**

- **Incorrecto:** `cambios varios`, `arreglando cosas`, `subiendo archivo`, `commit 2`, `texto aleatorio`, `comentarios sin sentido`
- **Correcto:** `feat: agregar seccion de preguntas frecuentes en pagina de servicios`
- **Correcto:** `fix: corregir validacion de correo electronico en contacto`

Preferentemente se recomienda el uso de ingles para cada commit como un estandar de mensajes

### 9.3. Solicitudes de Integración (Pull Requests)

La incorporación de código a la rama `main` se realiza exclusivamente a través de Pull Requests (PR) en GitHub:

1. **Título claro:** Debe resumir el cambio principal de forma comprensible.
2. **Descripción breve:** Debe detallar qué se agregó o modificó y cómo puede comprobarse que funciona correctamente.
3. **Revisión colaborativa:** Todo PR debe ser revisado y aprobado por al menos otro desarrollador antes de su integración.
4. **Fusión limpia:** Una vez aprobado y verificado que no introduce conflictos, se integra a `main` y se elimina la rama secundaria para mantener limpio el repositorio.

### 9.4. Versionado y Publicaciones (Releases)

Para dar seguimiento a las etapas del proyecto y entregables de marketing, se emplea versionado semántico mediante etiquetas (*tags*) en GitHub con el formato `vMAYOR.MENOR.PARCHE` (por ejemplo, `v1.2.0`):

- **Mayor (`1.0.0`):** Hitos importantes, rediseños completos del sitio o cambios estructurales mayores.
- **Menor (`0.2.0`):** Entrega de nuevas secciones, páginas o funcionalidades completas.
- **Parche (`0.2.1`):** Correcciones menores de texto, estilos o errores puntuales.

Cada versión relevante debe registrarse en la sección de **Releases** de GitHub, acompañada de una breve nota explicativa de las mejoras incluidas.

---

## 10. Lista de Verificación para Nuevos Cambios

Antes de solicitar la integración de código mediante un Pull Request, cada desarrollador debe validar los siguientes puntos:

1. **Tipos explícitos:** No existe ningún uso de `any` en los archivos creados o modificados.
2. **Comentarios limpios:** Los comentarios son descriptivos, concisos y carecen de adornos visuales o expresiones informales.
3. **Ubicación adecuada:** Cada archivo nuevo se encuentra en la carpeta correspondiente según su responsabilidad.
4. **Respeto de capas:** Ningún componente visual compartido depende de lógica de módulos o servicios.
5. **Rutas limpias:** Se utiliza el alias `@/` en todas las importaciones entre carpetas distintas.
6. **Rama y commits ordenados:** El trabajo se realizó en una rama con prefijo adecuado (`feature/`, `fix/`) y los mensajes de commit son descriptivos.
7. **Verificación funcional:** Se probó localmente que el sitio compila y ejecuta sin errores antes de abrir el Pull Request.
