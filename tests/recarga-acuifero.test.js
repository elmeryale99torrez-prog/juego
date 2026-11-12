import { describe, it, expect, beforeEach } from "vitest";
const { MotorSimulacion } = require("../js/engine.js");

describe("Módulo de Recarga del Acuífero Freático (Urubó / Piraí)", () => {
  let sim;

  beforeEach(() => {
    sim = new MotorSimulacion();
  });

  it("debe inicializar la tasa de recarga del acuífero en 80%", () => {
    expect(sim.estado.recargaAcuifero).toBe(80);
  });

  describe("Inercia metabólica de impermeabilización del suelo", () => {
    it("debe restar -1.2% anual por sellado inercial de suelos urbanos", () => {
      // Configuramos año 2035 donde el evento tiene impacto forzado vacío
      sim.anioActual = 2035;
      const recargaPrevia = sim.estado.recargaAcuifero; // 80%

      const res = sim.avanzarAnio();
      // Recarga esperada: 80 - 1.2 = 78.8%
      expect(res.estadoResultante.recargaAcuifero).toBe(78.8);
      expect(res.estadoResultante.recargaAcuifero).toBe(
        Number((recargaPrevia - 1.2).toFixed(1))
      );
    });
  });

  describe("Impacto de políticas hídricas y territoriales", () => {
    it("debe aumentar la recarga con el blindaje del Urubó (+9%)", () => {
      sim.anioActual = 2035;
      sim.medidasSeleccionadas.add("blindaje_urubo");
      // Impacto de medida: +9%
      // Inercia urbana: -1.2%
      // Neto esperado: 80 + 9 - 1.2 = 87.8%
      const res = sim.avanzarAnio();
      expect(res.estadoResultante.recargaAcuifero).toBe(87.8);
    });

    it("debe reducir drásticamente la recarga con la permisividad inmobiliaria sobre humedales (-14%)", () => {
      sim.anioActual = 2035;
      sim.medidasSeleccionadas.add("permisividad_inmobiliaria");
      // Impacto de medida: -14%
      // Inercia urbana: -1.2%
      // Neto esperado: 80 - 14 - 1.2 = 64.8%
      const res = sim.avanzarAnio();
      expect(res.estadoResultante.recargaAcuifero).toBe(64.8);
    });

    it("debe acotar la recarga estrictamente en el límite superior de 100%", () => {
      sim.anioActual = 2035;
      sim.estado.recargaAcuifero = 95;
      sim.medidasSeleccionadas.add("blindaje_urubo"); // +9%
      sim.medidasSeleccionadas.add("restauracion_cordon_pirai"); // +6%
      // 95 + 9 + 6 - 1.2 = 108.8% -> acotado a 100%
      const res = sim.avanzarAnio();
      expect(res.estadoResultante.recargaAcuifero).toBe(100);
    });
  });

  describe("Bucles de Retroalimentación por Estrés Hídrico (Wt < 50%)", () => {
    it("debe detonar descontento y contracción económica si la recarga cae bajo el umbral crítico del 50%", () => {
      sim.anioActual = 2035;
      // Forzamos un estado previo de estrés moderado (bajo 50% pero sobre umbral de colapso del 40%)
      sim.estado.recargaAcuifero = 46;
      sim.estado.descontentoSocial = 20;
      sim.estado.indicePIB = 100;

      // Inercia: 46 - 1.2 = 44.8%
      // Inercia PIB: +1.0 -> 101
      // deficitHidrico = (50 - 44.8) * 0.6 = 5.2 * 0.6 = 3.12
      // descontentoSocial = 20 + 3.12 = 23.12 -> 23.1%
      // indicePIB = 101 - (3.12 * 0.2) = 101 - 0.624 = 100.376 -> 100.4
      const res = sim.avanzarAnio();

      expect(res.estadoResultante.recargaAcuifero).toBe(44.8);
      expect(res.estadoResultante.descontentoSocial).toBe(23.1);
      expect(res.estadoResultante.indicePIB).toBe(100.4);
      expect(res.alertas).toContain(
        "Déficit hídrico: Caída del nivel freático detona protestas por baja presión de agua."
      );
    });

    it("no debe disparar alerta de estrés hídrico si la recarga se mantiene >= 50%", () => {
      sim.anioActual = 2035;
      sim.estado.recargaAcuifero = 60; // 60 - 1.2 = 58.8 >= 50
      const res = sim.avanzarAnio();

      expect(res.estadoResultante.recargaAcuifero).toBe(58.8);
      expect(res.alertas).not.toContain(
        "Déficit hídrico: Caída del nivel freático detona protestas por baja presión de agua."
      );
    });
  });
});
