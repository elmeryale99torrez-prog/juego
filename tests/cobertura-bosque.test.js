import { describe, it, expect, beforeEach } from "vitest";
const { MotorSimulacion } = require("../js/engine.js");

describe("Módulo de Cobertura Boscosa Chiquitana y Reserva Forestal", () => {
  let sim;

  beforeEach(() => {
    sim = new MotorSimulacion();
  });

  it("debe inicializar la cobertura boscosa en 82%", () => {
    expect(sim.estado.coberturaBosque).toBe(82);
  });

  describe("Inercia metabólica y presión de frontera agropecuaria", () => {
    it("debe restar -0.8% anual por expansión inercial urbana y agrícola sin intervención", () => {
      sim.anioActual = 2035; // Evento con impacto forzado vacío
      const bosqueInicial = sim.estado.coberturaBosque; // 82%

      const res = sim.avanzarAnio();
      // Bosque esperado: 82 - 0.8 = 81.2%
      expect(res.estadoResultante.coberturaBosque).toBe(81.2);
      expect(res.estadoResultante.coberturaBosque).toBe(
        Number((bosqueInicial - 0.8).toFixed(1))
      );
    });

    it("debe acumular la pérdida por evento histórico de chaqueos e incendios en 2026 (-4%)", () => {
      // En 2026:
      // Inercia: -0.8%
      // Evento quemas descontroladas 2026: -4.0%
      // Bosque resultante = 82 - 0.8 - 4 = 77.2%
      const res = sim.avanzarAnio();
      expect(res.estadoResultante.coberturaBosque).toBe(77.2);
    });
  });

  describe("Impacto de políticas agroforestales y conservación", () => {
    it("debe frenar la deforestación y sumar cobertura con la moratoria de quemas (+4%)", () => {
      sim.anioActual = 2035;
      sim.medidasSeleccionadas.add("moratoria_quemas");
      // 82 + 4 - 0.8 = 85.2%
      const res = sim.avanzarAnio();
      expect(res.estadoResultante.coberturaBosque).toBe(85.2);
    });

    it("debe acelerar la pérdida de masa boscosa con la desregulación agropecuaria (-10%)", () => {
      sim.anioActual = 2035;
      sim.medidasSeleccionadas.add("desregulacion_agropecuaria");
      // 82 - 10 - 0.8 = 71.2%
      const res = sim.avanzarAnio();
      expect(res.estadoResultante.coberturaBosque).toBe(71.2);
    });

    it("debe acotar estrictamente la cobertura entre 0% y 100%", () => {
      // Prueba límite superior 100%
      sim.anioActual = 2035;
      sim.estado.coberturaBosque = 98;
      sim.medidasSeleccionadas.add("moratoria_quemas"); // +4
      sim.medidasSeleccionadas.add("subsidio_agroecologia"); // +3
      // 98 + 4 + 3 - 0.8 = 104.2 -> 100%
      let res = sim.avanzarAnio();
      expect(res.estadoResultante.coberturaBosque).toBe(100);

      // Prueba límite inferior 0% en una nueva instancia
      const simBajo = new MotorSimulacion();
      simBajo.anioActual = 2035;
      simBajo.estado.coberturaBosque = 5;
      simBajo.medidasSeleccionadas.add("desregulacion_agropecuaria"); // -10
      // 5 - 10 - 0.8 = -5.8 -> acotado a 0%
      res = simBajo.avanzarAnio();
      expect(res.estadoResultante.coberturaBosque).toBe(0);
    });
  });
});
