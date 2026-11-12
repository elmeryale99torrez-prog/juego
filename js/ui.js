/**
 * EcoMetrópolis Santa Cruz - Controlador de Interfaz de Usuario (UI)
 * Renderizado de indicadores, mapa SVG interactivo, modales y control de eventos.
 */

document.addEventListener("DOMContentLoaded", () => {
  const motor = new MotorSimulacion();
  let filtroEjeActual = "todos";

  // Elementos DOM principales
  const elAnioActual = document.getElementById("anio-actual");
  const elPresupuesto = document.getElementById("presupuesto-disponible");
  const elBtnAvanzar = document.getElementById("btn-avanzar-anio");
  const elBtnReiniciar = document.getElementById("btn-reiniciar");

  // Indicadores métricos
  const metricas = {
    pm25: {
      valor: document.getElementById("val-pm25"),
      barra: document.getElementById("barra-pm25"),
      tag: document.getElementById("tag-pm25")
    },
    acuifero: {
      valor: document.getElementById("val-acuifero"),
      barra: document.getElementById("barra-acuifero"),
      tag: document.getElementById("tag-acuifero")
    },
    bosque: {
      valor: document.getElementById("val-bosque"),
      barra: document.getElementById("barra-bosque"),
      tag: document.getElementById("tag-bosque")
    },
    circular: {
      valor: document.getElementById("val-circular"),
      barra: document.getElementById("barra-circular"),
      tag: document.getElementById("tag-circular")
    },
    salud: {
      valor: document.getElementById("val-salud"),
      barra: document.getElementById("barra-salud"),
      tag: document.getElementById("tag-salud")
    },
    tension: {
      valor: document.getElementById("val-tension"),
      barra: document.getElementById("barra-tension"),
      tag: document.getElementById("tag-tension")
    }
  };

  // Paneles y contenedores
  const elContenedorPoliticas = document.getElementById("contenedor-politicas");
  const elFiltrosEjes = document.querySelectorAll(".filter-chip");
  const elTituloEvento = document.getElementById("evento-titulo");
  const elDescEvento = document.getElementById("evento-desc");
  const elContenedorAlertas = document.getElementById("contenedor-alertas");
  const elListaLog = document.getElementById("lista-log");
  const elHumoOverlay = document.getElementById("map-smoke");
  const elTooltipMapa = document.getElementById("map-tooltip");

  // Elementos SVG para dinamismo visual
  const svgPirai = document.getElementById("svg-rio-pirai");
  const svgBosque = document.getElementById("svg-area-bosque");
  const svgUrubo = document.getElementById("svg-zona-urubo");

  // Modales
  const modalTeoria = document.getElementById("modal-teoria");
  const modalTeoriaAutor = document.getElementById("modal-teoria-autor");
  const modalTeoriaCita = document.getElementById("modal-teoria-cita");
  const modalFinal = document.getElementById("modal-final");

  // Elementos del Gráfico de Trayectoria Decenal
  const canvasTrayectoria = document.getElementById("canvas-trayectoria");
  const canvasTrayectoriaModal = document.getElementById("canvas-trayectoria-modal");
  const elTooltipChart = document.getElementById("chart-tooltip");
  const legendChips = document.querySelectorAll(".legend-chip");

  const seriesVisibles = {
    bosque: true,
    acuifero: true,
    aire: true,
    circular: true,
    tension: true
  };

  // Inicialización de la vista
  function actualizarInterfazCompleta() {
    actualizarCabecera();
    actualizarMetricas();
    actualizarMapaTerritorial();
    actualizarBandejaPoliticas();
    actualizarEventoPeriodo();
    actualizarGraficoTrayectoria();
  }

  function actualizarCabecera() {
    elAnioActual.textContent = motor.anioActual;
    elPresupuesto.textContent = motor.presupuestoDisponible;

    if (motor.juegoTerminado) {
      elBtnAvanzar.disabled = true;
      elBtnAvanzar.textContent = "Simulación Concluida";
    } else {
      elBtnAvanzar.disabled = false;
      const anioSiguiente = motor.anioActual + 1;
      elBtnAvanzar.innerHTML = `<span>Avanzar al Año ${anioSiguiente}</span> ➔`;
    }
  }

  function actualizarMetricas() {
    const e = motor.estado;

    // PM2.5 y Categoría ICA
    metricas.pm25.valor.textContent = e.calidadAirePM25;
    const ica = motor.obtenerClasificacionICA(e.calidadAirePM25);
    metricas.pm25.tag.textContent = ica.categoria;
    metricas.pm25.tag.className = `metric-status-tag ${ica.claseColor}`;
    const pctPm25 = Math.min(100, (e.calidadAirePM25 / 160) * 100);
    metricas.pm25.barra.style.width = `${pctPm25}%`;
    metricas.pm25.barra.style.backgroundColor = ica.categoria === "Buena" ? "#2ecc71" : (ica.categoria === "Moderada" ? "#f59e0b" : "#ef4444");

    // Acuífero Urubó/Piraí
    metricas.acuifero.valor.textContent = e.recargaAcuifero;
    metricas.acuifero.barra.style.width = `${e.recargaAcuifero}%`;
    if (e.recargaAcuifero >= 70) {
      metricas.acuifero.tag.textContent = "Nivel Óptimo";
      metricas.acuifero.tag.className = "metric-status-tag ica-verde";
      metricas.acuifero.barra.style.backgroundColor = "#3b82f6";
    } else if (e.recargaAcuifero >= 45) {
      metricas.acuifero.tag.textContent = "Estrés Moderado";
      metricas.acuifero.tag.className = "metric-status-tag ica-amarillo";
      metricas.acuifero.barra.style.backgroundColor = "#f59e0b";
    } else {
      metricas.acuifero.tag.textContent = "Estrés Severo";
      metricas.acuifero.tag.className = "metric-status-tag ica-rojo";
      metricas.acuifero.barra.style.backgroundColor = "#ef4444";
    }

    // Cobertura Boscosa
    metricas.bosque.valor.textContent = e.coberturaBosque;
    metricas.bosque.barra.style.width = `${e.coberturaBosque}%`;
    metricas.bosque.barra.style.backgroundColor = e.coberturaBosque >= 70 ? "#10b981" : (e.coberturaBosque >= 50 ? "#f59e0b" : "#ef4444");
    metricas.bosque.tag.textContent = e.coberturaBosque >= 70 ? "Biomasa Estable" : (e.coberturaBosque >= 50 ? "Fragmentado" : "Crítico");
    metricas.bosque.tag.className = e.coberturaBosque >= 70 ? "metric-status-tag ica-verde" : (e.coberturaBosque >= 50 ? "metric-status-tag ica-amarillo" : "metric-status-tag ica-rojo");

    // Economía Circular 9R
    metricas.circular.valor.textContent = e.economiaCircular;
    metricas.circular.barra.style.width = `${e.economiaCircular}%`;
    metricas.circular.barra.style.backgroundColor = "#10b981";
    metricas.circular.tag.textContent = `${e.economiaCircular}% Tasa 9R`;
    metricas.circular.tag.className = "metric-status-tag ica-verde";

    // Saturación Hospitalaria
    metricas.salud.valor.textContent = e.saturacionSalud;
    metricas.salud.barra.style.width = `${e.saturacionSalud}%`;
    metricas.salud.barra.style.backgroundColor = e.saturacionSalud <= 40 ? "#2ecc71" : (e.saturacionSalud <= 70 ? "#f59e0b" : "#ef4444");
    metricas.salud.tag.textContent = e.saturacionSalud <= 40 ? "Capacidad Estable" : (e.saturacionSalud <= 70 ? "Alerta Respiratoria" : "Colapso Sanitario");
    metricas.salud.tag.className = e.saturacionSalud <= 40 ? "metric-status-tag ica-verde" : (e.saturacionSalud <= 70 ? "metric-status-tag ica-amarillo" : "metric-status-tag ica-rojo");

    // Tensión Social
    metricas.tension.valor.textContent = e.descontentoSocial;
    metricas.tension.barra.style.width = `${e.descontentoSocial}%`;
    metricas.tension.barra.style.backgroundColor = e.descontentoSocial <= 35 ? "#2ecc71" : (e.descontentoSocial <= 65 ? "#f59e0b" : "#ef4444");
    metricas.tension.tag.textContent = e.descontentoSocial <= 35 ? "Paz Ciudadana" : (e.descontentoSocial <= 65 ? "Movilización Activa" : "Conflicto Abierto");
    metricas.tension.tag.className = e.descontentoSocial <= 35 ? "metric-status-tag ica-verde" : (e.descontentoSocial <= 65 ? "metric-status-tag ica-amarillo" : "metric-status-tag ica-rojo");
  }

  function actualizarMapaTerritorial() {
    const e = motor.estado;

    // Opacidad de la capa de humo sobre Santa Cruz
    const opacidadHumo = Math.min(0.9, Math.max(0, (e.calidadAirePM25 - 20) / 100));
    elHumoOverlay.style.opacity = opacidadHumo;

    // Estado del río Piraí según recarga freática
    if (svgPirai) {
      if (e.recargaAcuifero >= 65) {
        svgPirai.setAttribute("stroke", "#3b82f6");
        svgPirai.setAttribute("stroke-width", "5");
      } else if (e.recargaAcuifero >= 40) {
        svgPirai.setAttribute("stroke", "#60a5fa");
        svgPirai.setAttribute("stroke-width", "3.5");
      } else {
        svgPirai.setAttribute("stroke", "#94a3b8");
        svgPirai.setAttribute("stroke-width", "2");
      }
    }

    // Estado de la cobertura boscosa
    if (svgBosque) {
      const opacidadBosque = Math.max(0.2, e.coberturaBosque / 100);
      svgBosque.style.opacity = opacidadBosque;
      svgBosque.setAttribute("fill", e.coberturaBosque >= 60 ? "#14532d" : "#78350f");
    }

    // Estado de las colinas del Urubó
    if (svgUrubo) {
      svgUrubo.setAttribute("fill", e.recargaAcuifero >= 60 ? "#166534" : "#854d0e");
    }
  }

  function actualizarBandejaPoliticas() {
    elContenedorPoliticas.innerHTML = "";

    const medidasFiltradas = MEDIDAS_POLITICA.filter(m => {
      if (filtroEjeActual === "todos") return true;
      return m.eje === filtroEjeActual;
    });

    medidasFiltradas.forEach(medida => {
      const seleccionada = motor.medidasSeleccionadas.has(medida.id);
      const card = document.createElement("div");
      card.className = `policy-card ${seleccionada ? "selected" : ""}`;

      // Formato del costo/ingreso
      let etiquetaCosto = "";
      if (medida.costoPresupuesto > 0) {
        etiquetaCosto = `<span class="cost-tag">Coste: ${medida.costoPresupuesto} pts</span>`;
      } else if (medida.costoPresupuesto < 0) {
        etiquetaCosto = `<span class="cost-tag cost-revenue">Ingreso: +${Math.abs(medida.costoPresupuesto)} pts</span>`;
      } else {
        etiquetaCosto = `<span class="cost-tag">Neutro</span>`;
      }

      // Deltas principales formateados
      let deltasHtml = "";
      if (medida.impactos.calidadAirePM25 !== 0) {
        const val = medida.impactos.calidadAirePM25;
        deltasHtml += `<span class="delta-pill ${val < 0 ? "delta-pos" : "delta-neg"}">PM2.5 ${val > 0 ? "+" + val : val}</span>`;
      }
      if (medida.impactos.recargaAcuifero !== 0) {
        const val = medida.impactos.recargaAcuifero;
        deltasHtml += `<span class="delta-pill ${val > 0 ? "delta-pos" : "delta-neg"}">Agua ${val > 0 ? "+" + val : val}%</span>`;
      }
      if (medida.impactos.coberturaBosque !== 0) {
        const val = medida.impactos.coberturaBosque;
        deltasHtml += `<span class="delta-pill ${val > 0 ? "delta-pos" : "delta-neg"}">Bosque ${val > 0 ? "+" + val : val}%</span>`;
      }
      if (medida.impactos.economiaCircular !== undefined && medida.impactos.economiaCircular > 0) {
        deltasHtml += `<span class="delta-pill delta-pos">9R +${medida.impactos.economiaCircular}%</span>`;
      }

      card.innerHTML = `
        <div class="policy-info">
          <div class="policy-tag">${medida.eje.replace("_", " ")}</div>
          <div class="policy-title">${medida.nombre}</div>
          <div class="policy-desc">${medida.descripcion}</div>
          <div class="policy-deltas">
            ${deltasHtml}
            <button class="btn-theory-link" data-theory="${medida.teoriaId}">📖 Fundamento Epistemológico</button>
          </div>
        </div>
        <div class="policy-actions">
          ${etiquetaCosto}
          <button class="btn-toggle-policy" data-id="${medida.id}">
            ${seleccionada ? "✓ Implementada" : "+ Seleccionar"}
          </button>
        </div>
      `;

      // Evento de selección
      card.querySelector(".btn-toggle-policy").addEventListener("click", () => {
        const resultado = motor.alternarMedida(medida.id);
        if (!resultado.exito) {
          alert(resultado.motivo);
        } else {
          actualizarCabecera();
          actualizarBandejaPoliticas();
          actualizarEventoPeriodo();
        }
      });

      // Evento de teoría
      card.querySelector(".btn-theory-link").addEventListener("click", (e) => {
        e.stopPropagation();
        abrirModalTeoria(medida.teoriaId);
      });

      elContenedorPoliticas.appendChild(card);
    });
  }

  function actualizarEventoPeriodo() {
    const evento = motor.obtenerEventoActual();
    if (evento) {
      elTituloEvento.textContent = `Año ${motor.anioActual}: ${evento.titulo}`;
      elDescEvento.textContent = evento.descripcion;
    } else {
      elTituloEvento.textContent = "Período Ordinario de Gestión";
      elDescEvento.textContent = "Sin anomalías meteorológicas de gran escala registradas en este período.";
    }
  }

  function abrirModalTeoria(teoriaId) {
    const teoria = TEORIAS_ACADEMICAS[teoriaId];
    if (!teoria) return;

    modalTeoriaAutor.textContent = teoria.autor;
    modalTeoriaCita.textContent = `"${teoria.postulado}"`;
    modalTeoria.classList.add("active");
  }

  function abrirModalFinal(dictamen) {
    document.getElementById("final-score-num").textContent = `${dictamen.puntaje} / 100`;
    document.getElementById("final-score-grade").textContent = dictamen.calificacion;
    document.getElementById("final-score-paradigm").textContent = dictamen.paradigma;
    document.getElementById("final-score-diag").textContent = dictamen.diagnostico;

    const tablaBody = document.getElementById("final-metrics-body");
    tablaBody.innerHTML = `
      <tr><td>Cobertura Boscosa Chiquitana</td><td><strong>${dictamen.resumenMetricas.bosqueFinal}%</strong> remanente</td></tr>
      <tr><td>Calidad del Aire ($PM_{2.5}$)</td><td><strong>${dictamen.resumenMetricas.aireFinalPM25} µg/m³</strong></td></tr>
      <tr><td>Nivel de Recarga Freática (Urubó/Piraí)</td><td><strong>${dictamen.resumenMetricas.acuiferoFinal}%</strong> capacidad</td></tr>
      <tr><td>Tasa de Economía Circular (9R)</td><td><strong>${dictamen.resumenMetricas.circularidadFinal}%</strong> recuperado</td></tr>
      <tr><td>Ocupación Hospitalaria Respiratoria</td><td><strong>${dictamen.resumenMetricas.saludFinal}%</strong> saturación</td></tr>
      <tr><td>Índice de Tensión Social</td><td><strong>${dictamen.resumenMetricas.tensionFinal}%</strong> descontento</td></tr>
      <tr><td>Índice de Actividad Económica</td><td><strong>${dictamen.resumenMetricas.pibFinal} pts</strong></td></tr>
    `;

    modalFinal.classList.add("active");

    setTimeout(() => {
      if (canvasTrayectoriaModal) {
        dibujarGrafico(canvasTrayectoriaModal, motor.historial);
      }
    }, 60);
  }

  // --- FILTROS DE EJES ---
  elFiltrosEjes.forEach(chip => {
    chip.addEventListener("click", () => {
      elFiltrosEjes.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      filtroEjeActual = chip.getAttribute("data-eje");
      actualizarBandejaPoliticas();
    });
  });

  // --- AVANZAR AÑO ---
  elBtnAvanzar.addEventListener("click", () => {
    const resultado = motor.avanzarAnio();
    if (!resultado) return;

    // Actualizar alertas del período
    elContenedorAlertas.innerHTML = "";
    if (resultado.alertas && resultado.alertas.length > 0) {
      resultado.alertas.forEach(alerta => {
        const item = document.createElement("div");
        item.className = "alert-item";
        if (alerta.startsWith("⚠️")) {
          item.style.borderColor = "#ef4444";
          item.style.backgroundColor = "rgba(239, 68, 68, 0.18)";
          item.style.color = "#fca5a5";
          item.style.fontWeight = "600";
        }
        item.textContent = alerta;
        elContenedorAlertas.appendChild(item);
      });
    } else {
      const item = document.createElement("div");
      item.className = "alert-item";
      item.style.borderColor = "#10b981";
      item.style.color = "#a7f3d0";
      item.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
      item.textContent = "Equilibrio territorial estable: Sin alertas biofísicas de emergencia en este período.";
      elContenedorAlertas.appendChild(item);
    }

    // Agregar entrada a la bitácora histórica
    const logItem = document.createElement("li");
    logItem.className = "log-entry";
    logItem.innerHTML = `<strong>Año ${resultado.anioConcluido}:</strong> Aire PM2.5 en ${resultado.estadoResultante.calidadAirePM25} µg/m³ · Acuíferos al ${resultado.estadoResultante.recargaAcuifero}% · Bosque al ${resultado.estadoResultante.coberturaBosque}%.`;
    elListaLog.prepend(logItem);

    // Actualizar interfaz completa
    actualizarInterfazCompleta();

    // Si terminó la década, mostrar dictamen final
    if (resultado.juegoTerminado) {
      abrirModalFinal(resultado.dictamenFinal);
    }
  });

  // --- BOTÓN REINICIAR ---
  elBtnReiniciar.addEventListener("click", () => {
    if (confirm("¿Deseas reiniciar la simulación territorial a las condiciones base de 2026?")) {
      motor.reiniciar();
      elContenedorAlertas.innerHTML = "<div class='alert-item'>Gestión territorial iniciada. Selecciona las medidas de política pública.</div>";
      elListaLog.innerHTML = "<li class='log-entry'>Inicio de la década de planificación (2026-2035).</li>";
      actualizarInterfazCompleta();
    }
  });

  // --- CERRAR MODALES ---
  document.querySelectorAll(".btn-close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
      modalTeoria.classList.remove("active");
      modalFinal.classList.remove("active");
    });
  });

  // Cerrar al hacer clic fuera del modal
  [modalTeoria, modalFinal].forEach(m => {
    m.addEventListener("click", (e) => {
      if (e.target === m) m.classList.remove("active");
    });
  });

  // Tooltip dinámico sobre el mapa territorial
  document.querySelectorAll(".interactive-map-zone").forEach(zona => {
    zona.addEventListener("mouseenter", (e) => {
      const info = zona.getAttribute("data-info");
      elTooltipMapa.textContent = info;
    });
    zona.addEventListener("mouseleave", () => {
      elTooltipMapa.textContent = "Pasa el cursor sobre las zonas territoriales para explorar su función biofísica.";
    });
  });

  // --- MOTOR DE RENDERIZADO DEL GRÁFICO DE TRAYECTORIA DECENAL ---
  const SERIES_CONFIG = {
    bosque: { nombre: "Bosque", color: "#22c55e", unidad: "%", getVal: s => s.coberturaBosque },
    acuifero: { nombre: "Acuífero", color: "#3b82f6", unidad: "%", getVal: s => s.recargaAcuifero },
    aire: { nombre: "PM2.5", color: "#f97316", unidad: "µg/m³", getVal: s => s.calidadAirePM25 },
    circular: { nombre: "Circular 9R", color: "#06b6d4", unidad: "%", getVal: s => s.economiaCircular },
    tension: { nombre: "Tensión Social", color: "#eab308", unidad: "%", getVal: s => s.descontentoSocial }
  };

  function dibujarGrafico(canvas, historial, highlightIndex = null) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 230;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const padL = 48;
    const padR = 20;
    const padT = 24;
    const padB = 30;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    ctx.clearRect(0, 0, w, h);

    // Fondo sutil de cuadrícula
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(padL, padT, chartW, chartH);

    // Líneas horizontales de guía (0, 25, 50, 75, 100%)
    const niveles = [0, 25, 50, 75, 100];
    ctx.lineWidth = 1;
    ctx.font = "10px SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    niveles.forEach(lvl => {
      const y = padT + chartH * (1 - lvl / 100);

      if (lvl === 50) {
        // Umbral crítico de resiliencia ecológica (50%)
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(239, 68, 68, 0.55)";
        ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
        ctx.fillText("50% (Límite)", padL - 6, y);
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(58, 92, 76, 0.25)";
        ctx.fillStyle = "rgba(154, 180, 166, 0.65)";
        ctx.fillText(`${lvl}%`, padL - 6, y);
      }

      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Eje X: Años 2026 - 2035
    const totalAnios = 10;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(154, 180, 166, 0.8)";

    for (let i = 0; i < totalAnios; i++) {
      const anio = 2026 + i;
      const x = padL + (chartW / (totalAnios - 1)) * i;

      // Línea vertical tenue
      ctx.strokeStyle = "rgba(58, 92, 76, 0.18)";
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + chartH);
      ctx.stroke();

      // Año en eje X
      ctx.fillText(anio, x, padT + chartH + 8);
    }

    if (!historial || historial.length === 0) return;

    // Resaltado de año activo bajo cursor
    if (highlightIndex !== null && highlightIndex >= 0 && highlightIndex < historial.length) {
      const hx = padL + (chartW / (totalAnios - 1)) * highlightIndex;
      ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
      ctx.fillRect(hx - (chartW / (totalAnios - 1)) / 2, padT, chartW / (totalAnios - 1), chartH);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hx, padT);
      ctx.lineTo(hx, padT + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Dibujar curvas de series activas
    Object.keys(SERIES_CONFIG).forEach(clave => {
      if (!seriesVisibles[clave]) return;
      const conf = SERIES_CONFIG[clave];

      ctx.strokeStyle = conf.color;
      ctx.fillStyle = conf.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();

      const puntos = [];
      historial.forEach((entry, idx) => {
        const val = conf.getVal(entry.estado);
        const yNorm = Math.max(0, Math.min(100, val));
        const px = padL + (chartW / (totalAnios - 1)) * idx;
        const py = padT + chartH * (1 - yNorm / 100);
        puntos.push({ x: px, y: py, val });

        if (idx === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      ctx.stroke();

      // Puntos en cada vértice anual
      puntos.forEach((p, idx) => {
        ctx.beginPath();
        const esResaltado = highlightIndex === idx;
        const radio = esResaltado ? 5.5 : 3.5;
        ctx.arc(p.x, p.y, radio, 0, Math.PI * 2);
        ctx.fillStyle = conf.color;
        ctx.fill();
        ctx.strokeStyle = "#08110d";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    });
  }

  function actualizarGraficoTrayectoria() {
    dibujarGrafico(canvasTrayectoria, motor.historial);
    if (canvasTrayectoriaModal) {
      dibujarGrafico(canvasTrayectoriaModal, motor.historial);
    }
  }

  // Interacción de cursor sobre el gráfico
  if (canvasTrayectoria && elTooltipChart) {
    const wrapper = canvasTrayectoria.parentElement;

    wrapper.addEventListener("mousemove", (e) => {
      const rect = canvasTrayectoria.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const padL = 48;
      const padR = 20;
      const chartW = rect.width - padL - padR;

      if (mouseX < padL - 10 || mouseX > rect.width - padR + 10) {
        elTooltipChart.style.display = "none";
        dibujarGrafico(canvasTrayectoria, motor.historial, null);
        return;
      }

      const relX = Math.max(0, Math.min(chartW, mouseX - padL));
      const anioIndex = Math.round((relX / chartW) * 9);

      if (anioIndex >= 0 && anioIndex < motor.historial.length) {
        const item = motor.historial[anioIndex];
        const px = padL + (chartW / 9) * anioIndex;

        dibujarGrafico(canvasTrayectoria, motor.historial, anioIndex);

        let html = `<div class="chart-tooltip-title">Año ${item.anio}</div>`;
        Object.keys(SERIES_CONFIG).forEach(k => {
          if (!seriesVisibles[k]) return;
          const cfg = SERIES_CONFIG[k];
          const val = cfg.getVal(item.estado);
          html += `
            <div class="chart-tooltip-row">
              <span style="color:${cfg.color}; font-weight:600;">${cfg.nombre}:</span>
              <span><strong>${val}</strong> ${cfg.unidad}</span>
            </div>
          `;
        });

        elTooltipChart.innerHTML = html;
        elTooltipChart.style.display = "block";

        const ttWidth = elTooltipChart.offsetWidth || 150;
        let leftPos = px + 15;
        if (leftPos + ttWidth > rect.width) {
          leftPos = px - ttWidth - 15;
        }
        elTooltipChart.style.left = `${Math.max(10, leftPos)}px`;
        elTooltipChart.style.top = "15px";
      } else {
        elTooltipChart.style.display = "none";
        dibujarGrafico(canvasTrayectoria, motor.historial, null);
      }
    });

    wrapper.addEventListener("mouseleave", () => {
      elTooltipChart.style.display = "none";
      dibujarGrafico(canvasTrayectoria, motor.historial, null);
    });
  }

  // Toggles de visibilidad en la leyenda
  legendChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const serie = chip.getAttribute("data-serie");
      if (seriesVisibles[serie] !== undefined) {
        seriesVisibles[serie] = !seriesVisibles[serie];
        chip.classList.toggle("active", seriesVisibles[serie]);
        actualizarGraficoTrayectoria();
      }
    });
  });

  // Adaptación reactiva a cambios de tamaño de pantalla
  window.addEventListener("resize", () => {
    actualizarGraficoTrayectoria();
  });

  // Render inicial
  actualizarInterfazCompleta();
});
