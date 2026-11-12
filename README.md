# EcoMetrópolis Santa Cruz
## Laboratorio Interactivo de Simulación Territorial y Límites Biofísicos (2026–2035)

[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
[![UAGRM](https://img.shields.io/badge/UAGRM-Ciencias%20de%20la%20Educación-blue.svg)](https://www.uagrm.edu.bo)
[![Tecnología](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS%20Vanilla-orange.svg)](#)
[![GitHub Pages](https://img.shields.io/badge/Despliegue-GitHub%20Pages-brightgreen.svg)](#)

> **Universidad Autónoma Gabriel René Moreno · Facultad de Humanidades · Carrera de Ciencias de la Educación**  
> *Asignatura: Taller de Educación Ambiental*

---

### 1. Resumen y Propósito Pedagógico

**EcoMetrópolis Santa Cruz** es una aplicación web interactiva que modela las tensiones metabólicas entre la expansión urbana-agroindustrial y las fronteras ecológicas de la biosfera en el departamento de Santa Cruz, Bolivia.

Inspirado en los fundamentos de la **economía ecológica**, el simulador ubica al participante en el rol de **Consejo de Planificación Territorial y Ambiental**. Durante una década de gestión (2026–2035), el usuario debe asignar presupuestos públicos anuales y responder a emergencias atmosféricas por quemas, estrés hídrico en acuíferos, saturación hospitalaria y conflictos sociales.

---

### 2. Dimensiones y Variables Biofísicas

El modelo matemático concibe la ciudad como un **subsistema abierto** regido por la Primera y Segunda Ley de la Termodinámica:

* 💨 **Calidad del Aire ($PM_{2.5}$ en $\mu\text{g}/\text{m}^3$ e ICA):** Concentración de partículas finas producto de chaqueos e incendios forestales en la Chiquitania sumados al parque vehicular metropolitano.
* 💧 **Recarga Freática (Acuífero Urubó / Río Piraí):** Capacidad de infiltración del agua subterránea que abastece de agua potable al área metropolitana frente a la impermeabilización del suelo.
* 🌳 **Cobertura Boscosa Chiquitana (% remanente):** Reserva forestal y biomasa que actúa como sumidero de carbono y regulador de temperatura.
* ♻️ **Tasa de Economía Circular (Estrategia 9R):** Porcentaje de residuos desviados de los vertederos mediante biometanización, compostaje y reciclaje formalizado.
* 🏥 **Presión Sanitaria Hospitalaria:** Capacidad de respuesta del sistema de salud ante afecciones respiratorias derivadas del humo.
* ⚡ **Tensión y Conflicto Social:** Descontento ciudadano detonado por desabastecimiento hídrico o imposición tributaria ambiental.

---

### 3. Estructura del Repositorio

```text
ecometropolis-santacruz/
│
├── css/
│   └── styles.css              # Sistema de diseño, paleta ecológica, temas de alerta y curvas
│
├── js/
│   ├── data.js                 # 12 medidas de política, resolución dinámica de eventos y marco teórico
│   ├── engine.js               # Motor de cálculo biofísico, Tipping Points, balance y dictamen
│   └── ui.js                   # Interfaz reactiva, mapa SVG, gráfico Canvas de series temporales
│
├── tests/                      # Suite de pruebas unitarias automatizadas (Vitest)
│   ├── calidad-aire.test.js
│   ├── cobertura-bosque.test.js
│   ├── dictamen-sostenibilidad.test.js
│   ├── presupuesto-dinamico.test.js
│   ├── recarga-acuifero.test.js
│   └── tipping-points.test.js
│
├── index.html                  # Aplicación interactiva principal con visor de trayectoria decenal
├── MODELO_MATEMATICO.md        # Especificación formal de ecuaciones, Tipping Points y dinámica de sistemas
├── package.json                # Configuración de pruebas unitarias y cobertura con Vitest
├── LICENSE                     # Licencia de código abierto MIT
├── .gitignore                  # Reglas de exclusión de archivos
└── README.md                   # Documentación principal del proyecto
```

---

### 4. Fundamentación Epistemológica

Cada intervención pública desplegada en el simulador incluye su respectivo respaldo en la literatura económica y ambiental clásica:

* **Sir Partha Dasgupta (2021):** *La Economía de la Biodiversidad* (finitud de la biosfera y capital natural).
* **Arthur Cecil Pigou (1920):** *La Economía del Bienestar* (externalidades negativas e impuestos correctivos).
* **Nicholas Georgescu-Roegen (1971):** *La Ley de la Entropía y el Proceso Económico* (subordinación a la termodinámica).
* **Garrett Hardin (1968) y Elinor Ostrom (1990):** Dilemas de bienes comunes de libre acceso versus gobernanza comunitaria.
* **Johan Rockström (2009):** Umbrales de resiliencia, puntos de inflexión (*Tipping Points*) y fronteras planetarias.

---

### 5. Cómo Ejecutar Localmente

No requiere Node.js, compiladores ni servidores externos para jugar. Funciona directamente en cualquier navegador moderno:

1. Clona este repositorio o descarga el archivo `.zip`:
   ```bash
   git clone https://github.com/TU-USUARIO/ecometropolis-santacruz.git
   ```
2. Entra a la carpeta del proyecto y abre el archivo `index.html` con doble clic.

#### Ejecutar Suite de Pruebas Unitarias Automatizadas
Si deseas auditar las ecuaciones biofísicas y los puntos de inflexión con Node.js:
```bash
npm install
npm test              # Ejecución completa de las 46 pruebas unitarias
npm run test:coverage # Reporte de cobertura de código
```

---

### 6. Despliegue en GitHub Pages (Jugar en Línea)

Este repositorio incluye el archivo de automatización `.github/workflows/deploy.yml`. Para publicarlo en la web de forma gratuita:

1. Ve a la pestaña **Settings** (Configuración) de tu repositorio en GitHub.
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment** (Construcción y despliegue), selecciona **Source** $\rightarrow$ **GitHub Actions**.
4. Haz cualquier `push` a la rama `main` y GitHub publicará automáticamente el simulador en:  
   `https://<TU-USUARIO>.github.io/ecometropolis-santacruz/`

---

### 7. Licencia y Créditos

Proyecto desarrollado en el marco del **Taller de Educación Ambiental** de la Carrera de Ciencias de la Educación de la **Universidad Autónoma Gabriel René Moreno (UAGRM)**.

Distribuido bajo [Licencia MIT](LICENSE).
