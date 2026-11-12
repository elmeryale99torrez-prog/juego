import { describe, it, expect, beforeEach } from "vitest";
const { MotorSimulacion } = require("../js/engine.js");

describe("Módulo de Presupuesto Dinámico y Mecánica de Selección de Políticas", () => {
  let sim;

  beforeEach(() => {
    sim = new MotorSimulacion();
  });

  describe("Cálculo del Presupuesto Dinámico Anual (Ecuación Pt+1)", () => {
    it("debe calcular el presupuesto en función del PIB y del descontento ciudadano", () => {
      // Estado controlado antes de avanzar:
      // Pt+1 = round(Pbase * max(0.60, (Yt / 100) * (1 - Dt / 200)))
      sim.anioActual = 2035; // Sin eventos forzados
      sim.estado.indicePIB = 120; // 120 + 1 (inercia) = 121
      sim.estado.descontentoSocial = 20; // 20
      // multiplicador = (121 / 100) * (1 - 20 / 200) = 1.21 * 0.9 = 1.089
      // presupuesto = round(100 * max(0.60, 1.089)) = round(108.9) = 109

      sim.avanzarAnio();
      expect(sim.presupuestoDisponible).toBe(109);
    });

    it("debe respetar el piso mínimo de solvencia presupuestaria del 60% (multiplicador >= 0.60)", () => {
      sim.anioActual = 2035;
      sim.estado.indicePIB = 30; // Economía muy deprimida
      sim.estado.descontentoSocial = 90; // Descontento extremo
      // multiplicador = (31 / 100) * (1 - 90 / 200) = 0.31 * 0.55 = 0.1705 < 0.60
      // presupuesto = round(100 * 0.60) = 60

      sim.avanzarAnio();
      expect(sim.presupuestoDisponible).toBe(60);
    });

    it("debe aplicar penalización al PIB cuando el descontento social supera el 70%", () => {
      sim.anioActual = 2035;
      sim.estado.indicePIB = 100;
      sim.estado.descontentoSocial = 75; // > 70%

      // Inercia PIB: +1.0 -> 101
      // Penalización parálisis social (Dt > 70): -4.0 -> 97.0
      const res = sim.avanzarAnio();
      expect(res.estadoResultante.indicePIB).toBe(97.0);
      expect(res.alertas).toContain(
        "Tensión social elevada: Paros ciudadanos y huelgas reducen la actividad económica."
      );
    });
  });

  describe("Mecánica de Alternancia de Políticas (alternarMedida)", () => {
    it("debe restar el costo presupuestario al seleccionar una medida", () => {
      // moratoria_quemas cuesta 25 pts
      const res = sim.alternarMedida("moratoria_quemas");
      expect(res.exito).toBe(true);
      expect(res.accion).toBe("agregada");
      expect(sim.presupuestoDisponible).toBe(75);
      expect(sim.medidasSeleccionadas.has("moratoria_quemas")).toBe(true);
    });

    it("debe reembolsar el presupuesto al deseleccionar una medida ya seleccionada", () => {
      sim.alternarMedida("moratoria_quemas"); // Resta 25 -> 75
      const res = sim.alternarMedida("moratoria_quemas"); // Deselecciona
      expect(res.exito).toBe(true);
      expect(res.accion).toBe("removida");
      expect(sim.presupuestoDisponible).toBe(100);
      expect(sim.medidasSeleccionadas.has("moratoria_quemas")).toBe(false);
    });

    it("debe rechazar la selección si el presupuesto disponible es insuficiente", () => {
      sim.presupuestoDisponible = 10;
      const res = sim.alternarMedida("moratoria_quemas"); // Cuesta 25 pts
      expect(res.exito).toBe(false);
      expect(res.motivo).toContain("Presupuesto insuficiente");
      expect(sim.medidasSeleccionadas.has("moratoria_quemas")).toBe(false);
    });

    it("debe permitir medidas de desregulación que aportan ingresos fiscales (costo negativo)", () => {
      // permisividad_inmobiliaria tiene costo -20 (genera ingresos)
      const saldoPrevio = sim.presupuestoDisponible;
      const res = sim.alternarMedida("permisividad_inmobiliaria");
      expect(res.exito).toBe(true);
      expect(sim.presupuestoDisponible).toBe(saldoPrevio + 20);
    });

    it("debe bloquear la selección de medidas si el juego ha finalizado", () => {
      sim.juegoTerminado = true;
      const res = sim.alternarMedida("moratoria_quemas");
      expect(res.exito).toBe(false);
      expect(res.motivo).toContain("La simulación ha concluido");
    });
  });

  describe("Reinicio del Sistema (reiniciar)", () => {
    it("debe restablecer todas las variables de estado y año a los valores iniciales de 2026", () => {
      sim.avanzarAnio(); // Año 2026 concluido, pasa a 2027
      expect(sim.anioActual).toBe(2027);

      sim.reiniciar();
      expect(sim.anioActual).toBe(2026);
      expect(sim.presupuestoDisponible).toBe(100);
      expect(sim.estado.coberturaBosque).toBe(82);
      expect(sim.estado.calidadAirePM25).toBe(35);
      expect(sim.estado.recargaAcuifero).toBe(80);
      expect(sim.juegoTerminado).toBe(false);
      expect(sim.dictamenFinal).toBeNull();
      expect(sim.historial.length).toBe(1);
    });
  });
});
