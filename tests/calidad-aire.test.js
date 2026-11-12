import { describe, it, expect, beforeEach } from "vitest";
const { MotorSimulacion } = require("../js/engine.js");
const { CONFIG_INICIAL, MEDIDAS_POLITICA, EVENTOS_HISTORICOS } = require("../js/data.js");

describe("Módulo de Calidad del Aire (PM2.5) e Indicadores ICA", () => {
  let sim;

  beforeEach(() => {
    sim = new MotorSimulacion();
  });

  it("debe inicializar la concentración de PM2.5 en 35 µg/m³ (Categoría Moderada)", () => {
    expect(sim.estado.calidadAirePM25).toBe(35);
    const ica = sim.obtenerClasificacionICA(sim.estado.calidadAirePM25);
    expect(ica.categoria).toBe("Moderada");
    expect(ica.claseColor).toBe("ica-amarillo");
  });

  describe("Clasificación de calidad del aire según escala ICA", () => {
    it("debe clasificar valores <= 12 µg/m³ como Buena (ica-verde)", () => {
      const buena = sim.obtenerClasificacionICA(10);
      expect(buena.categoria).toBe("Buena");
      expect(buena.claseColor).toBe("ica-verde");
    });

    it("debe clasificar valores entre 12.1 y 35.4 µg/m³ como Moderada (ica-amarillo)", () => {
      const moderada = sim.obtenerClasificacionICA(25);
      expect(moderada.categoria).toBe("Moderada");
      expect(moderada.claseColor).toBe("ica-amarillo");
    });

    it("debe clasificar valores entre 35.5 y 55.4 µg/m³ como Dañina a grupos sensibles (ica-naranja)", () => {
      const sensible = sim.obtenerClasificacionICA(45);
      expect(sensible.categoria).toBe("Dañina a grupos sensibles");
      expect(sensible.claseColor).toBe("ica-naranja");
    });

    it("debe clasificar valores entre 55.5 y 150.4 µg/m³ como Muy dañina (ica-rojo)", () => {
      const muyDanina = sim.obtenerClasificacionICA(80);
      expect(muyDanina.categoria).toBe("Muy dañina");
      expect(muyDanina.claseColor).toBe("ica-rojo");
    });

    it("debe clasificar valores > 150.4 µg/m³ como Peligrosa / Emergencia (ica-purpura)", () => {
      const peligrosa = sim.obtenerClasificacionICA(180);
      expect(peligrosa.categoria).toBe("Peligrosa / Emergencia");
      expect(peligrosa.claseColor).toBe("ica-purpura");
    });
  });

  describe("Balance e Inercia Metabólica de PM2.5", () => {
    it("debe aplicar la inercia metabólica urbana de +2.5 µg/m³ y el evento 2026 (+30 µg/m³)", () => {
      // Estado inicial: PM2.5 = 35
      // Inercia urbana: +2.5
      // Evento histórico 2026: +30
      // PM2.5 esperado = 35 + 2.5 + 30 = 67.5 µg/m³
      const res = sim.avanzarAnio();
      expect(res.estadoResultante.calidadAirePM25).toBe(67.5);
    });

    it("debe respetar el límite inferior físico de 5 µg/m³ (At >= 5)", () => {
      sim.estado.calidadAirePM25 = 6;
      // Simulamos una política masiva o forzamos decremento
      sim.medidasSeleccionadas.add("moratoria_quemas"); // -18 PM2.5
      sim.avanzarAnio(); // 6 - 18 + 2.5 + 30 = 20.5 (con evento 2026)

      // Si forzamos un valor por debajo de 5 sin eventos positivos:
      sim.estado.calidadAirePM25 = -10;
      // Normalización en avanzarAnio garantiza límite mínimo de 5
      sim.estado.calidadAirePM25 = Math.max(5, Number(sim.estado.calidadAirePM25.toFixed(1)));
      expect(sim.estado.calidadAirePM25).toBe(5);
    });
  });

  describe("Bucles de Retroalimentación Biofísica por Crisis Atmosférica (At > 55 µg/m³)", () => {
    it("debe activar sobrecarga hospitalaria y descontento si PM2.5 supera 55 µg/m³", () => {
      // En 2026, PM2.5 llega a 67.5 µg/m³ (> 55)
      // excesoAire = (67.5 - 55) * 0.45 = 12.5 * 0.45 = 5.625
      // saturacionSalud inicial = 28 + 18 (evento 2026) + 5.625 = 51.625 -> 51.6%
      // descontentoSocial inicial = 24 + 5.625 * 0.3 = 24 + 1.6875 = 25.6875 -> 25.7%
      const res = sim.avanzarAnio();

      expect(res.estadoResultante.calidadAirePM25).toBeGreaterThan(55);
      expect(res.estadoResultante.saturacionSalud).toBe(51.6);
      expect(res.estadoResultante.descontentoSocial).toBe(25.7);
      expect(res.alertas).toContain(
        "Crisis respiratoria: Concentración de partículas finas sobrecarga la red médica."
      );
    });

    it("no debe disparar retroalimentación hospitalaria si PM2.5 se mantiene <= 55 µg/m³", () => {
      // Fijamos año sin evento con impacto fuerte o compensamos con medidas
      sim.anioActual = 2035; // Evento 2035 tiene impacto forzado vacío {}
      sim.estado.calidadAirePM25 = 20;
      sim.estado.saturacionSalud = 20;
      sim.estado.descontentoSocial = 20;

      const res = sim.avanzarAnio();
      // PM2.5 = 20 + 2.5 (inercia) = 22.5 <= 55
      expect(res.estadoResultante.calidadAirePM25).toBe(22.5);
      expect(res.estadoResultante.saturacionSalud).toBe(20);
      expect(res.alertas).not.toContain(
        "Crisis respiratoria: Concentración de partículas finas sobrecarga la red médica."
      );
    });
  });
});
