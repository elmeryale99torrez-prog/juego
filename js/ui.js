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

  // Inicialización de la vista
  function actualizarInterfazCompleta() {
    actualizarCabecera();
    actualizarMetricas();
    actualizarMapaTerritorial();
    actualizarBandejaPoliticas();
    actualizarEventoPeriodo();
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
    const evento = EVENTOS_HISTORICOS[motor.anioActual];
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

  // Render inicial
  actualizarInterfazCompleta();
});
