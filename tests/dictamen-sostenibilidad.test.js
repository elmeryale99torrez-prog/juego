import { describe, it, expect, beforeEach } from "vitest";
const { MotorSimulacion } = require("../js/engine.js");

describe("Módulo de Dictamen Final y Condiciones de Victoria o Colapso Ecológico", () => {
  let sim;

  beforeEach(() => {
    sim = new MotorSimulacion();
  });

  describe("Condición de Victoria Ecológica: Sostenibilidad Fuerte y Regenerativa (>= 85 pts)", () => {
    it("debe otorgar el dictamen máximo con puntaje 100 ante condiciones biofísicas óptimas", () => {
      sim.estado.coberturaBosque = 85; // +25
      sim.estado.calidadAirePM25 = 15;  // +25
      sim.estado.recargaAcuifero = 85;  // +25
      sim.estado.economiaCircular = 50; // +15
      sim.estado.descontentoSocial = 15;// +10 (descontento <= 30 y salud <= 40)
      sim.estado.saturacionSalud = 20;

      const dictamen = sim.calcularDictamenFinal();

      expect(dictamen.puntaje).toBe(100);
      expect(dictamen.calificacion).toBe("Sostenibilidad Fuerte y Regenerativa");
      expect(dictamen.paradigma).toBe("Enfoque Ecológico Dasgupta / Georgescu-Roegen");
      expect(dictamen.resumenMetricas.bosqueFinal).toBe(85);
      expect(dictamen.resumenMetricas.aireFinalPM25).toBe(15);
      expect(dictamen.resumenMetricas.acuiferoFinal).toBe(85);
    });

    it("debe calificar Sostenibilidad Fuerte si el puntaje es exactamente 85", () => {
      sim.estado.coberturaBosque = 75; // +25
      sim.estado.calidadAirePM25 = 20;  // +25
      sim.estado.recargaAcuifero = 75;  // +25
      sim.estado.economiaCircular = 15; // +4
      sim.estado.descontentoSocial = 40;// +5 (descontento <= 60 y salud <= 65)
      sim.estado.saturacionSalud = 50;
      // Total: 25 + 25 + 25 + 4 + 6 = 85 pts (esperado 84 si social es 5, 25+25+25+4+5=84)
      // Ajustemos economía circular a 25 (+10): 25 + 25 + 25 + 10 = 85 pts (sin bonus social)
      sim.estado.economiaCircular = 25; // +10
      sim.estado.descontentoSocial = 80;// 0 bonus social
      sim.estado.saturacionSalud = 80;

      const dictamen = sim.calcularDictamenFinal();
      expect(dictamen.puntaje).toBe(85);
      expect(dictamen.calificacion).toBe("Sostenibilidad Fuerte y Regenerativa");
    });
  });

  describe("Condición de Colapso Ecológico: Colapso Metabólico Territorial (< 35 pts)", () => {
    it("debe dictaminar Colapso Metabólico Territorial cuando los límites biofísicos son devastados", () => {
      // Estado colapsado:
      sim.estado.coberturaBosque = 25;   // < 60 -> +5
      sim.estado.calidadAirePM25 = 120;  // > 75 -> +0
      sim.estado.recargaAcuifero = 20;   // < 55 -> +5
      sim.estado.economiaCircular = 5;   // < 25 -> +4
      sim.estado.descontentoSocial = 85; // > 60 -> +0
      sim.estado.saturacionSalud = 90;   // > 65 -> +0
      // Puntaje total = 5 + 0 + 5 + 4 + 0 = 14 pts (< 35)

      const dictamen = sim.calcularDictamenFinal();

      expect(dictamen.puntaje).toBe(14);
      expect(dictamen.calificacion).toBe("Colapso Metabólico Territorial");
      expect(dictamen.paradigma).toBe("Falla Total de Bienes Comunes (Tragedia de Hardin)");
      expect(dictamen.diagnostico).toContain("colapso del sistema urbano metropolitano");
    });
  });

  describe("Categorías Intermedias de Sostenibilidad", () => {
    it("debe calificar Sostenibilidad Débil / Transición Moderada (60 <= puntaje < 85)", () => {
      sim.estado.coberturaBosque = 65;  // +15
      sim.estado.calidadAirePM25 = 40;  // +15
      sim.estado.recargaAcuifero = 60;  // +15
      sim.estado.economiaCircular = 25; // +10
      sim.estado.descontentoSocial = 50;// +5 (social y salud en rango moderado)
      sim.estado.saturacionSalud = 55;
      // Total: 15 + 15 + 15 + 10 + 5 = 60 pts

      const dictamen = sim.calcularDictamenFinal();

      expect(dictamen.puntaje).toBe(60);
      expect(dictamen.calificacion).toBe("Sostenibilidad Débil / Transición Moderada");
      expect(dictamen.paradigma).toBe("Enfoque Ambiental Neoclásico / Sustitución de Capitales");
    });

    it("debe calificar Deterioro Biofísico Acelerado (35 <= puntaje < 60)", () => {
      sim.estado.coberturaBosque = 55;  // +5
      sim.estado.calidadAirePM25 = 60;  // +5
      sim.estado.recargaAcuifero = 50;  // +5
      sim.estado.economiaCircular = 25; // +10
      sim.estado.descontentoSocial = 25;// +10
      sim.estado.saturacionSalud = 30;
      // Total: 5 + 5 + 5 + 10 + 10 = 35 pts

      const dictamen = sim.calcularDictamenFinal();

      expect(dictamen.puntaje).toBe(35);
      expect(dictamen.calificacion).toBe("Deterioro Biofísico Acelerado");
      expect(dictamen.paradigma).toBe("Extractivismo Tardío y Externalización Sistemática");
    });
  });

  describe("Ciclo de Simulación Decenal Completo (2026–2035)", () => {
    it("debe completar 10 años de gestión, finalizar el juego y generar dictamen automático", () => {
      expect(sim.juegoTerminado).toBe(false);
      expect(sim.dictamenFinal).toBeNull();

      // Ejecutar los 10 años de gestión
      for (let anio = 2026; anio <= 2035; anio++) {
        expect(sim.anioActual).toBe(anio);
        const res = sim.avanzarAnio();
        expect(res).not.toBeNull();
        expect(res.anioConcluido).toBe(anio);
      }

      // Al concluir el año 2035 (anioActual pasa a 2036)
      expect(sim.anioActual).toBe(2036);
      expect(sim.juegoTerminado).toBe(true);
      expect(sim.dictamenFinal).not.toBeNull();
      expect(sim.dictamenFinal.puntaje).toBeGreaterThanOrEqual(0);
      expect(sim.dictamenFinal.puntaje).toBeLessThanOrEqual(100);

      // Siguientes intentos de avanzar deben retornar null
      const resPosterior = sim.avanzarAnio();
      expect(resPosterior).toBeNull();
    });
  });
});
