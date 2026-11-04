/**
 * EcoMetrópolis Santa Cruz - Motor de Simulación Biofísica
 * Manejo de estado, ecuaciones termodinámicas, bucles de retroalimentación y cálculo anual.
 */

class MotorSimulacion {
  constructor() {
    this.reiniciar();
  }

  reiniciar() {
    this.anioActual = CONFIG_INICIAL.anioInicio;
    this.anioFin = CONFIG_INICIAL.anioFin;
    this.presupuestoBase = CONFIG_INICIAL.presupuestoBaseAnual;
    this.presupuestoDisponible = this.presupuestoBase;
    
    // Estado biofísico y socioeconómico actual
    this.estado = { ...CONFIG_INICIAL.valoresIniciales };
    
    // Medidas seleccionadas para el año en curso
    this.medidasSeleccionadas = new Set();
    
    // Registro histórico para gráficos y balance final
    this.historial = [
      {
        anio: this.anioActual,
        estado: { ...this.estado },
        presupuesto: this.presupuestoDisponible,
        medidasTomadas: [],
        eventoOcurrido: null,
        alertaCritica: null
      }
    ];

    this.juegoTerminado = false;
    this.dictamenFinal = null;
  }

  obtenerClasificacionICA(pm25) {
    if (pm25 <= 12) {
      return { categoria: "Buena", claseColor: "ica-verde", descripcion: "Calidad del aire satisfactoria; sin riesgo sanitario." };
    } else if (pm25 <= 35.4) {
      return { categoria: "Moderada", claseColor: "ica-amarillo", descripcion: "Aceptable; leve molestia para personas asmáticas." };
    } else if (pm25 <= 55.4) {
      return { categoria: "Dañina a grupos sensibles", claseColor: "ica-naranja", descripcion: "Afección en niños, ancianos y personas con patologías previas." };
    } else if (pm25 <= 150.4) {
      return { categoria: "Muy dañina", claseColor: "ica-rojo", descripcion: "Toda la población urbana experimenta irritación ocular y respiratoria." };
    } else {
      return { categoria: "Peligrosa / Emergencia", claseColor: "ica-purpura", descripcion: "Alerta sanitaria máxima; suspensión de actividades al aire libre." };
    }
  }

  alternarMedida(medidaId) {
    if (this.juegoTerminado) return { exito: false, motivo: "La simulación ha concluido." };

    const medida = MEDIDAS_POLITICA.find(m => m.id === medidaId);
    if (!medida) return { exito: false, motivo: "Medida no encontrada." };

    if (this.medidasSeleccionadas.has(medidaId)) {
      this.medidasSeleccionadas.delete(medidaId);
      this.presupuestoDisponible += medida.costoPresupuesto;
      return { exito: true, accion: "removida", medida };
    } else {
      if (this.presupuestoDisponible < medida.costoPresupuesto) {
        return { exito: false, motivo: "Presupuesto insuficiente para implementar esta medida." };
      }
      this.medidasSeleccionadas.add(medidaId);
      this.presupuestoDisponible -= medida.costoPresupuesto;
      return { exito: true, accion: "agregada", medida };
    }
  }

  avanzarAnio() {
    if (this.juegoTerminado) return null;

    const anioProcesado = this.anioActual;
    const eventoActual = EVENTOS_HISTORICOS[anioProcesado] || null;
    let alertasDelPeriodo = [];

    // 1. Aplicación de medidas seleccionadas
    const medidasAplicadas = [];
    this.medidasSeleccionadas.forEach(id => {
      const medida = MEDIDAS_POLITICA.find(m => m.id === id);
      if (medida) {
        medidasAplicadas.push(medida);
        for (const [clave, delta] of Object.entries(medida.impactos)) {
          if (this.estado[clave] !== undefined) {
            this.estado[clave] += delta;
          }
        }
      }
    });

    // 2. Tendencia inercial metabólica urbana (dinámica natural sin intervención)
    // Crecimiento demográfico inercial y desgaste material
    this.estado.coberturaBosque -= 0.8; // Presión inercial de la frontera urbana/agrícola
    this.estado.recargaAcuifero -= 1.2; // Sellado inercial de suelos
    this.estado.calidadAirePM25 += 2.5; // Emisiones crecientes del parque automotor
    this.estado.indicePIB += 1.0; // Inercia de crecimiento económico

    // 3. Aplicación de impacto forzado del evento histórico
    if (eventoActual && eventoActual.impactoForzado) {
      for (const [clave, delta] of Object.entries(eventoActual.impactoForzado)) {
        if (clave === "presupuestoBonus") {
          this.presupuestoDisponible += delta;
        } else if (this.estado[clave] !== undefined) {
          this.estado[clave] += delta;
        }
      }
    }

    // 4. Bucles de retroalimentación biofísica (Segunda Ley de la Termodinámica y Salud)
    // El deterioro del aire detona saturación hospitalaria
    if (this.estado.calidadAirePM25 > 55) {
      const excesoAire = (this.estado.calidadAirePM25 - 55) * 0.45;
      this.estado.saturacionSalud += excesoAire;
      this.estado.descontentoSocial += excesoAire * 0.3;
      alertasDelPeriodo.push("Crisis respiratoria: Concentración de partículas finas sobrecarga la red médica.");
    }

    // El estrés hídrico eleva de manera inmediata el conflicto social
    if (this.estado.recargaAcuifero < 50) {
      const deficitHidrico = (50 - this.estado.recargaAcuifero) * 0.6;
      this.estado.descontentoSocial += deficitHidrico;
      this.estado.indicePIB -= deficitHidrico * 0.2;
      alertasDelPeriodo.push("Déficit hídrico: Caída del nivel freático detona protestas por baja presión de agua.");
    }

    // El descontento social alto deprime la recaudación fiscal
    if (this.estado.descontentoSocial > 70) {
      this.estado.indicePIB -= 4;
      alertasDelPeriodo.push("Tensión social elevada: Paros ciudadanos y huelgas reducen la actividad económica.");
    }

    // 5. Normalización y acotamiento de límites físicos (0 a 100%, PM2.5 > 5)
    this.estado.coberturaBosque = Math.max(0, Math.min(100, Number(this.estado.coberturaBosque.toFixed(1))));
    this.estado.recargaAcuifero = Math.max(0, Math.min(100, Number(this.estado.recargaAcuifero.toFixed(1))));
    this.estado.economiaCircular = Math.max(0, Math.min(100, Number(this.estado.economiaCircular.toFixed(1))));
    this.estado.saturacionSalud = Math.max(0, Math.min(100, Number(this.estado.saturacionSalud.toFixed(1))));
    this.estado.descontentoSocial = Math.max(0, Math.min(100, Number(this.estado.descontentoSocial.toFixed(1))));
    this.estado.calidadAirePM25 = Math.max(5, Number(this.estado.calidadAirePM25.toFixed(1)));
    this.estado.indicePIB = Math.max(20, Number(this.estado.indicePIB.toFixed(1)));

    // 6. Preparación del nuevo presupuesto para el siguiente año
    // El presupuesto depende del PIB y del descontento
    const multiplicadorPresupuesto = (this.estado.indicePIB / 100) * (1 - (this.estado.descontentoSocial / 200));
    this.presupuestoDisponible = Math.round(this.presupuestoBase * Math.max(0.6, multiplicadorPresupuesto));

    // Registro histórico
    this.historial.push({
      anio: anioProcesado + 1,
      estado: { ...this.estado },
      presupuesto: this.presupuestoDisponible,
      medidasTomadas: medidasAplicadas.map(m => m.id),
      eventoOcurrido: eventoActual,
      alertas: alertasDelPeriodo
    });

    // Limpieza de medidas del turno
    this.medidasSeleccionadas.clear();

    // Comprobación de final de década
    this.anioActual++;
    if (this.anioActual > this.anioFin) {
      this.juegoTerminado = true;
      this.dictamenFinal = this.calcularDictamenFinal();
    }

    return {
      anioConcluido: anioProcesado,
      nuevoAnio: this.anioActual,
      estadoResultante: { ...this.estado },
      evento: eventoActual,
      alertas: alertasDelPeriodo,
      juegoTerminado: this.juegoTerminado,
      dictamenFinal: this.dictamenFinal
    };
  }

  calcularDictamenFinal() {
    const e = this.estado;
    let puntajeBiofisico = 0;
    
    // Evaluación ponderada de sostenibilidad fuerte
    if (e.coberturaBosque >= 75) puntajeBiofisico += 25;
    else if (e.coberturaBosque >= 60) puntajeBiofisico += 15;
    else puntajeBiofisico += 5;

    if (e.calidadAirePM25 <= 25) puntajeBiofisico += 25;
    else if (e.calidadAirePM25 <= 45) puntajeBiofisico += 15;
    else if (e.calidadAirePM25 <= 75) puntajeBiofisico += 5;

    if (e.recargaAcuifero >= 75) puntajeBiofisico += 25;
    else if (e.recargaAcuifero >= 55) puntajeBiofisico += 15;
    else puntajeBiofisico += 5;

    if (e.economiaCircular >= 40) puntajeBiofisico += 15;
    else if (e.economiaCircular >= 25) puntajeBiofisico += 10;
    else puntajeBiofisico += 4;

    if (e.descontentoSocial <= 30 && e.saturacionSalud <= 40) puntajeBiofisico += 10;
    else if (e.descontentoSocial <= 60 && e.saturacionSalud <= 65) puntajeBiofisico += 5;

    let calificacion = "";
    let paradigma = "";
    let diagnostico = "";

    if (puntajeBiofisico >= 85) {
      calificacion = "Sostenibilidad Fuerte y Regenerativa";
      paradigma = "Enfoque Ecológico Dasgupta / Georgescu-Roegen";
      diagnostico = "Lograste desacoplar el bienestar humano del agotamiento material. Se preservó la reserva boscosa chiquitana, los acuíferos conservan alta tasa de infiltración y la atmósfera urbana permanece en rangos respirables saludables.";
    } else if (puntajeBiofisico >= 60) {
      calificacion = "Sostenibilidad Débil / Transición Moderada";
      paradigma = "Enfoque Ambiental Neoclásico / Sustitución de Capitales";
      diagnostico = "Hubo contención parcial de las crisis, pero persisten fracturas ecológicas. Se monetizaron pasivos ambientales y las reservas de agua y bosque operan cerca de sus límites de seguridad.";
    } else if (puntajeBiofisico >= 35) {
      calificacion = "Deterioro Biofísico Acelerado";
      paradigma = "Extractivismo Tardío y Externalización Sistemática";
      diagnostico = "La prioridad asignada a ingresos económicos inmediatos depreció severamente el capital natural colectivo. La población urbana enfrenta episodios frecuentes de aire tóxico y racionamiento hídrico crónico.";
    } else {
      calificacion = "Colapso Metabólico Territorial";
      paradigma = "Falla Total de Bienes Comunes (Tragedia de Hardin)";
      diagnostico = "La destrucción de los acuíferos de recarga, la quema masiva del bosque y la saturación hospitalaria condujeron al colapso del sistema urbano metropolitano.";
    }

    return {
      puntaje: puntajeBiofisico,
      calificacion,
      paradigma,
      diagnostico,
      resumenMetricas: {
        bosqueFinal: e.coberturaBosque,
        aireFinalPM25: e.calidadAirePM25,
        acuiferoFinal: e.recargaAcuifero,
        circularidadFinal: e.economiaCircular,
        saludFinal: e.saturacionSalud,
        tensionFinal: e.descontentoSocial,
        pibFinal: e.indicePIB
      }
    };
  }
}
