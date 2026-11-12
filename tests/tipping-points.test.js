import { describe, it, expect, beforeEach } from "vitest";
const { MotorSimulacion } = require("../js/engine.js");
const { resolverEventoDinamico } = require("../js/data.js");

describe("Módulo de Puntos de Inflexión No Lineales (Tipping Points) y Eventos Dinámicos", () => {
  let sim;

  beforeEach(() => {
    sim = new MotorSimulacion();
  });

  describe("Punto de Inflexión 1: Sabanización del Bosque Seco Chiquitano (Bt < 60%)", () => {
    it("debe acelerar la degradación forestal a -1.8% y elevar el PM2.5 cuando el bosque cae de 60%", () => {
      sim.anioActual = 2035; // Sin eventos forzados
      sim.estado.coberturaBosque = 55; // < 60%
      sim.estado.calidadAirePM25 = 20;

      // Inercia normal: -0.8 -> 54.2
      // Tipping point: -1.0 adicional -> 53.2%
      // PM2.5 inercia: 20 + 2.5 = 22.5
      // PM2.5 tipping point: +3.0 -> 25.5 µg/m³
      const res = sim.avanzarAnio();

      expect(res.estadoResultante.coberturaBosque).toBe(53.2);
      expect(res.estadoResultante.calidadAirePM25).toBe(25.5);
      expect(res.alertas.some(a => a.includes("Sabanización del Bosque Chiquitano"))).toBe(true);
    });

    it("no debe activar el punto de inflexión si la cobertura boscosa se mantiene >= 60%", () => {
      sim.anioActual = 2035;
      sim.estado.coberturaBosque = 70;
      const res = sim.avanzarAnio();

      expect(res.estadoResultante.coberturaBosque).toBe(69.2); // 70 - 0.8
      expect(res.alertas.some(a => a.includes("Sabanización del Bosque Chiquitano"))).toBe(false);
    });
  });

  describe("Punto de Inflexión 2: Compactación y Daño Estructural al Acuífero Urubó/Piraí (Wt < 40%)", () => {
    it("debe acelerar el sellado freático y contraer el PIB cuando la recarga cae de 40%", () => {
      sim.anioActual = 2035;
      sim.estado.recargaAcuifero = 38; // < 40%
      sim.estado.indicePIB = 100;
      sim.estado.descontentoSocial = 20;

      // Inercia normal: 38 - 1.2 = 36.8
      // Estrés hídrico (Wt < 50): deficit = (50 - 36.8) * 0.6 = 7.92 -> descontento += 7.92, PIB -= 1.584
      // Tipping point (Wt < 40): recarga -= 1.0 -> 35.8%
      // Tipping point PIB: -= 3.0
      // PIB = 100 + 1.0 (inercia) - 1.584 - 3.0 = 96.416 -> 96.4
      const res = sim.avanzarAnio();

      expect(res.estadoResultante.recargaAcuifero).toBe(35.8);
      expect(res.estadoResultante.indicePIB).toBe(96.4);
      expect(res.alertas.some(a => a.includes("Colapso de poros freáticos en el Urubó"))).toBe(true);
    });
  });

  describe("Punto de Inflexión 3: Colapso del Sistema Sanitario Metropolitano (Ht > 75%)", () => {
    it("debe disparar el descontento social por pánico de triage y deprimir la economía", () => {
      sim.anioActual = 2035;
      sim.estado.saturacionSalud = 80; // > 75%
      sim.estado.descontentoSocial = 20;
      sim.estado.indicePIB = 100;

      // Tipping point salud:
      // descontentoSocial += 6.0 -> 26.0%
      // PIB -= 4.0; inercia PIB: +1.0 -> 97.0
      const res = sim.avanzarAnio();

      expect(res.estadoResultante.descontentoSocial).toBe(26.0);
      expect(res.estadoResultante.indicePIB).toBe(97.0);
      expect(res.alertas.some(a => a.includes("Colapso del sistema hospitalario metropolitano"))).toBe(true);
    });
  });

  describe("Resolución de Eventos Dinámicos Contextuales", () => {
    it("debe atenuar el evento de surazo e incendios 2026 si el usuario activó la moratoria de quemas", () => {
      sim.medidasSeleccionadas.add("moratoria_quemas");
      const evento = sim.obtenerEventoActual();

      expect(evento.titulo).toContain("Alerta temprana y moratoria contienen quemas");
      expect(evento.impactoForzado.calidadAirePM25).toBe(10); // En vez de 30
      expect(evento.impactoForzado.coberturaBosque).toBe(-1);  // En vez de -4
    });

    it("debe amplificar a Megaincendio en 2026 si el usuario aprueba desregulación agropecuaria", () => {
      sim.medidasSeleccionadas.add("desregulacion_agropecuaria");
      const evento = sim.obtenerEventoActual();

      expect(evento.titulo).toContain("Megaincendio descontrolado");
      expect(evento.impactoForzado.calidadAirePM25).toBe(48);
      expect(evento.impactoForzado.coberturaBosque).toBe(-7);
    });

    it("debe amortiguar el estiaje en 2027 si se blindó el Urubó", () => {
      sim.anioActual = 2027;
      sim.medidasSeleccionadas.add("blindaje_urubo");
      const evento = sim.obtenerEventoActual();

      expect(evento.titulo).toContain("amortiguado por la protección del Urubó");
      expect(evento.impactoForzado.recargaAcuifero).toBe(-5); // En vez de -12
    });

    it("debe premiar con financiamiento récord en 2034 si se preservó la cobertura boscosa (>= 75%)", () => {
      sim.anioActual = 2034;
      sim.estado.coberturaBosque = 80;
      const evento = sim.obtenerEventoActual();

      expect(evento.titulo).toContain("Fondo Verde Mundial premia con máxima subvención");
      expect(evento.impactoForzado.presupuestoBonus).toBe(45);
    });
  });
});
