/**
 * EcoMetrópolis Santa Cruz - Base de Datos de Simulación
 * Parámetros biofísicos, medidas de política, eventos de crisis y fundamentación teórica.
 */

const CONFIG_INICIAL = {
  anioInicio: 2026,
  anioFin: 2035,
  presupuestoBaseAnual: 100, // Puntos de asignación presupuestaria (Millones BOB normalizados)
  valoresIniciales: {
    coberturaBosque: 82, // Porcentaje de bosque primario y reserva forestal conservada
    calidadAirePM25: 35, // Concentración en µg/m³ (Calidad moderada inicial)
    recargaAcuifero: 80, // Porcentaje de capacidad de recarga freática (Urubó / Piraí)
    economiaCircular: 12, // Porcentaje de residuos recuperados mediante estrategia 9R
    saturacionSalud: 28, // Porcentaje de ocupación hospitalaria por afecciones respiratorias
    descontentoSocial: 24, // Porcentaje de tensión social y protesta ciudadana
    indicePIB: 100 // Índice base de actividad económica
  }
};

const MEDIDAS_POLITICA = [
  // --- EJE 1: REGULACIÓN AGROPECUARIA Y CHIQUITANIA ---
  {
    id: "moratoria_quemas",
    eje: "agroforestal",
    nombre: "Moratoria e inspección severa a quemas agropecuarias",
    descripcion: "Suspensión de autorizaciones de desmonte y multas proporcionales al valor de la tierra para infractores.",
    costoPresupuesto: 25,
    impactos: {
      coberturaBosque: +4,
      calidadAirePM25: -18,
      recargaAcuifero: +2,
      indicePIB: -3,
      descontentoSocial: +8, // Fricción con sectores agropecuarios tradicionales
      saturacionSalud: -12
    },
    teoriaId: "pigou_externalidades"
  },
  {
    id: "subsidio_agroecologia",
    eje: "agroforestal",
    nombre: "Fondo de intensificación ecológica y agricultura regenerativa",
    descripcion: "Incentivo tributario y asistencia técnica a productores que incorporen cortinas rompevientos y silvopastoreo.",
    costoPresupuesto: 20,
    impactos: {
      coberturaBosque: +3,
      calidadAirePM25: -8,
      recargaAcuifero: +3,
      indicePIB: +4,
      descontentoSocial: -4,
      saturacionSalud: -4
    },
    teoriaId: "dasgupta_capital_natural"
  },
  {
    id: "desregulacion_agropecuaria",
    eje: "agroforestal",
    nombre: "Flexibilización de desmontes para expansión agroexportadora",
    descripcion: "Autorización exprés de chaqueos y reducción de exigencias de la Función Económico-Social (FES).",
    costoPresupuesto: -15, // Aporta ingresos fiscales inmediatos por regalías
    impactos: {
      coberturaBosque: -10,
      calidadAirePM25: +32,
      recargaAcuifero: -6,
      indicePIB: +12,
      descontentoSocial: +14, // Protestas de colectivos ciudadanos y médicos
      saturacionSalud: +22
    },
    teoriaId: "hardin_tragedia_comunes"
  },

  // --- EJE 2: PROTECCIÓN HIDROLÓGICA Y CUENCA URUBÓ-PIRAÍ ---
  {
    id: "blindaje_urubo",
    eje: "hidrologica",
    nombre: "Blindaje legal y pausa ecológica en colinas del Urubó",
    descripcion: "Prohibición de nuevas urbanizaciones sobre zonas de infiltración freática y dunas del cordón biológico.",
    costoPresupuesto: 20,
    impactos: {
      coberturaBosque: +2,
      recargaAcuifero: +9,
      calidadAirePM25: -3,
      indicePIB: -4,
      descontentoSocial: +5, // Oposición del sector de la construcción
      saturacionSalud: -2
    },
    teoriaId: "ostrom_gobernanza_comunes"
  },
  {
    id: "restauracion_cordon_pirai",
    eje: "hidrologica",
    nombre: "Reforestación ribereña del Cordón Ecológico del Río Piraí",
    descripcion: "Recuperación biológica de los defensivos naturales con especies nativas para mitigar inundaciones e islas de calor.",
    costoPresupuesto: 18,
    impactos: {
      coberturaBosque: +3,
      recargaAcuifero: +6,
      calidadAirePM25: -6,
      indicePIB: +1,
      descontentoSocial: -8,
      saturacionSalud: -5
    },
    teoriaId: "rockstrom_fronteras_planetarias"
  },
  {
    id: "permisividad_inmobiliaria",
    eje: "hidrologica",
    nombre: "Concesión de licencias urbanísticas sobre humedales metropolitanos",
    descripcion: "Habilitación de proyectos habitacionales cerrados sobre zonas de escorrentía natural.",
    costoPresupuesto: -20, // Ingreso masivo por tasas de edificación
    impactos: {
      coberturaBosque: -5,
      recargaAcuifero: -14,
      calidadAirePM25: +6,
      indicePIB: +9,
      descontentoSocial: +12,
      saturacionSalud: +6
    },
    teoriaId: "georgescu_entropia"
  },

  // --- EJE 3: CALIDAD DEL AIRE Y MOVILIDAD METROPOLITANA ---
  {
    id: "impuesto_pigouviano_emisiones",
    eje: "movilidad_aire",
    nombre: "Impuesto ambiental a fuentes fijas y parque vehicular obsoleto",
    descripcion: "Gravamen a vehículos sin convertidor catalítico y calderas industriales con chimeneas desprovistas de filtros.",
    costoPresupuesto: -10, // Genera recaudación directa
    impactos: {
      calidadAirePM25: -15,
      coberturaBosque: 0,
      recargaAcuifero: +1,
      indicePIB: -2,
      descontentoSocial: +10, // Reacción del transporte sindicalizado
      saturacionSalud: -14
    },
    teoriaId: "pigou_externalidades"
  },
  {
    id: "red_brt_electrico",
    eje: "movilidad_aire",
    nombre: "Red troncal de autobuses eléctricos y ciclorrutas seguras",
    descripcion: "Priorización de carriles confinados para transporte público masivo no contaminante entre anillos metropolitanos.",
    costoPresupuesto: 35,
    impactos: {
      calidadAirePM25: -20,
      coberturaBosque: +1,
      recargaAcuifero: +2,
      indicePIB: +6,
      descontentoSocial: -10,
      saturacionSalud: -18
    },
    teoriaId: "daly_estado_estacionario"
  },

  // --- EJE 4: ECONOMÍA CIRCULAR 9R Y RESIDUOS SÓLIDOS ---
  {
    id: "planta_biogas_compostaje",
    eje: "residuos_circular",
    nombre: "Complejo metropolitano de compostaje y captura de biogás",
    descripcion: "Aprovechamiento de la fracción orgánica de mercados para abono de suelos agrícolas y energía limpia.",
    costoPresupuesto: 25,
    impactos: {
      economiaCircular: +22,
      calidadAirePM25: -7,
      recargaAcuifero: +4,
      indicePIB: +5,
      descontentoSocial: -6,
      saturacionSalud: -8
    },
    teoriaId: "georgescu_entropia"
  },
  {
    id: "inclusion_recicladores",
    eje: "residuos_circular",
    nombre: "Formalización e infraestructura para cooperativas de reciclaje",
    descripcion: "Puntos verdes barriales, maquinaria de prensado y seguro de salud para trabajadores de recolección selectiva.",
    costoPresupuesto: 15,
    impactos: {
      economiaCircular: +16,
      calidadAirePM25: -3,
      recargaAcuifero: +3,
      indicePIB: +3,
      descontentoSocial: -9,
      saturacionSalud: -6
    },
    teoriaId: "ostrom_gobernanza_comunes"
  },

  // --- EJE 5: EDUCACIÓN AMBIENTAL CRÍTICA Y PARTICIPACIÓN ---
  {
    id: "catedra_biofisica_escolar",
    eje: "educacion_comunitaria",
    nombre: "Programa departamental de alfabetización biofísica y ecológica",
    descripcion: "Formación en escuelas y juntas vecinales sobre separación en origen, prevención del fuego y justicia climática.",
    costoPresupuesto: 12,
    impactos: {
      economiaCircular: +8,
      calidadAirePM25: -5,
      recargaAcuifero: +3,
      coberturaBosque: +2,
      indicePIB: +2,
      descontentoSocial: -12,
      saturacionSalud: -7
    },
    teoriaId: "dasgupta_capital_natural"
  },
  {
    id: "red_monitores_ciudadanos",
    eje: "educacion_comunitaria",
    nombre: "Red comunitaria de monitoreo de PM2.5 y veeduría hídrica",
    descripcion: "Sensores de bajo costo autogestionados en barrios y distritos para auditoría pública en tiempo real.",
    costoPresupuesto: 10,
    impactos: {
      calidadAirePM25: -4,
      recargaAcuifero: +2,
      descontentoSocial: -5,
      saturacionSalud: -5,
      indicePIB: 0
    },
    teoriaId: "ostrom_gobernanza_comunes"
  }
];

const EVENTOS_HISTORICOS = {
  2026: {
    titulo: "Surazo seco y quemas descontroladas en el Norte Integrado",
    descripcion: "Un frente frío sin lluvia transporta densas masas de humo hacia la mancha urbana de Santa Cruz, disparando el índice de material particulado.",
    impactoForzado: { calidadAirePM25: +30, saturacionSalud: +18, coberturaBosque: -4 }
  },
  2027: {
    titulo: "Anomalía climática: Estiaje prolongado por fenómeno de El Niño",
    descripcion: "Ocho meses sin precipitaciones significativas reducen drásticamente el caudal del río Piraí y aceleran la evaporación en los humedales del este.",
    impactoForzado: { recargaAcuifero: -12, calidadAirePM25: +15, coberturaBosque: -3 }
  },
  2028: {
    titulo: "Tensión social: Marcha de comités vecinales por racionamiento hídrico",
    descripcion: "La baja presión en los grifos de los distritos periurbanos detona movilizaciones ciudadanas exigiendo frenar las urbanizaciones privadas en zonas de recarga.",
    impactoForzado: { descontentoSocial: +20, indicePIB: -4 }
  },
  2029: {
    titulo: "Ola de calor con inversión térmica atmosférica",
    descripcion: "Temperaturas sostenidas superiores a 41 °C atrapan los gases de combustión vehicular a ras de suelo durante dos semanas seguidas.",
    impactoForzado: { calidadAirePM25: +22, saturacionSalud: +20, descontentoSocial: +8 }
  },
  2030: {
    titulo: "Evaluación de medio término: Auditoría de metas ODS y límites planetarios",
    descripcion: "Organismos internacionales evalúan el balance entre crecimiento del PIB y pérdida irreversible de capital natural en la cuenca amazónica-platense.",
    impactoForzado: { presupuestoBonus: +15 }
  },
  2031: {
    titulo: "Filtro de lixiviados en pozos de abastecimiento comunitario",
    descripcion: "Se detectan trazas de metales pesados en napas freáticas cercanas al antiguo botadero, obligando a destinar recursos de contingencia inmediata.",
    impactoForzado: { recargaAcuifero: -8, saturacionSalud: +14, descontentoSocial: +15 }
  },
  2032: {
    titulo: "Paro gremial y bloqueos de transporte urbano",
    descripcion: "Sectores del autotransporte demandan subsidios directos a combustibles fósiles y la anulación de inspecciones técnicas de emisión de humo.",
    impactoForzado: { descontentoSocial: +18, indicePIB: -6, calidadAirePM25: -5 }
  },
  2033: {
    titulo: "Temporada de lluvias torrenciales y anegamiento metropolitano",
    descripcion: "El sellado artificial del suelo por asfalto y cemento impide la absorción freática, inundando avenidas y canales principales.",
    impactoForzado: { recargaAcuifero: +4, descontentoSocial: +14, indicePIB: -5 }
  },
  2034: {
    titulo: "Cooperación internacional para conservación del Bosque Seco Chiquitano",
    descripcion: "Fondos verdes de resiliencia climática premian las medidas de contención de desmontes con recursos no reembolsables para gestión ambiental.",
    impactoForzado: { presupuestoBonus: +30, descontentoSocial: -10 }
  },
  2035: {
    titulo: "Cierre de la Década: Presentación del Balance ante el Tribunal Evaluador UAGRM",
    descripcion: "Culmina el período de planificación. El Consejo Territorial comparece ante la comunidad académica para dictaminar la sostenibilidad de la gestión.",
    impactoForzado: {}
  }
};

const TEORIAS_ACADEMICAS = {
  pigou_externalidades: {
    autor: "Arthur Cecil Pigou (1920) · La Economía del Bienestar",
    postulado: "Cuando la actividad productiva genera daños ecológicos que el precio comercial no registra (externalidad negativa), el mercado asigna recursos de forma ineficiente. Los impuestos ambientales corrigen esta fractura obligando al contaminador a internalizar el costo social."
  },
  dasgupta_capital_natural: {
    autor: "Sir Partha Dasgupta (2021) · La Economía de la Biodiversidad",
    postulado: "La biosfera es finita. Tratar a la naturaleza como un insumo gratuito e infinito en los modelos macroeconómicos estándar destruye el capital natural que sostiene la supervivencia humana a largo plazo."
  },
  hardin_tragedia_comunes: {
    autor: "Garrett Hardin (1968) · La Tragedia de los Bienes Comunes",
    postulado: "En recursos de libre acceso y rivales en el consumo (como el aire limpio, pasturas o mantos acuíferos), la búsqueda irrestricta de lucro individual conduce de manera inexorable a la sobreexplotación y la ruina colectiva."
  },
  ostrom_gobernanza_comunes: {
    autor: "Elinor Ostrom (1990) · El Gobierno de los Bienes Comunes",
    postulado: "Frente a la dicotomía entre privatización total y control estatal punitivo, la gestión comunitaria organizada mediante reglas locales claras y veeduría mutua logra conservar los recursos comunes de forma equitativa y duradera."
  },
  georgescu_entropia: {
    autor: "Nicholas Georgescu-Roegen (1971) · La Ley de la Entropía y el Proceso Económico",
    postulado: "El sistema económico está subordinado a las leyes de la termodinámica. Todo proceso material transforma recursos de baja entropía en residuos degradados de alta entropía. La idea de un crecimiento económico material infinito es una imposibilidad física."
  },
  rockstrom_fronteras_planetarias: {
    autor: "Johan Rockström et al. (2009) · Stockholm Resilience Centre",
    postulado: "La estabilidad del sistema terrestre depende de no traspasar umbrales críticos en variables biofísicas clave (integridad de la biosfera, ciclos de nitrógeno y fósforo, cambio en el uso del suelo). Traspasar estos límites desencadena colapsos ambientales abruptos."
  },
  daly_estado_estacionario: {
    autor: "Herman Daly (1996) · Más Allá del Crecimiento",
    postulado: "La economía debe orientarse hacia un estado estacionario donde el flujo de energía y materiales se mantenga dentro de las tasas naturales de regeneración y asimilación de la biosfera, priorizando el desarrollo cualitativo sobre la acumulación cuantitativa."
  }
};

/**
 * Resuelve variantes contextuales de eventos anuales
 * según el estado biofísico y las medidas activadas.
 */
function resolverEventoDinamico(anio, estado, medidasSeleccionadas) {
  const base = EVENTOS_HISTORICOS[anio];
  if (!base) return null;

  const medidas = medidasSeleccionadas || new Set();

  if (anio === 2026) {
    if (medidas.has("moratoria_quemas") || medidas.has("subsidio_agroecologia")) {
      return {
        titulo: "Surazo seco: Alerta temprana y moratoria contienen quemas en el Norte Integrado",
        descripcion: "Pese al viento sur, la inspección rigurosa y las brigadas comunitarias mitigan en 65% los focos de calor respecto a años anteriores.",
        impactoForzado: { calidadAirePM25: +10, saturacionSalud: +6, coberturaBosque: -1 }
      };
    } else if (medidas.has("desregulacion_agropecuaria")) {
      return {
        titulo: "Surazo seco y Megaincendio descontrolado en el Norte Integrado",
        descripcion: "La flexibilización de desmontes combinada con fuertes vientos desata un megaincendio que cubre de humo denso toda la mancha metropolitana.",
        impactoForzado: { calidadAirePM25: +48, saturacionSalud: +28, coberturaBosque: -7 }
      };
    }
  }

  if (anio === 2027) {
    if (medidas.has("blindaje_urubo") || medidas.has("restauracion_cordon_pirai")) {
      return {
        titulo: "Estiaje por El Niño amortiguado por la protección del Urubó y Piraí",
        descripcion: "El cordón ecológico ribereño y la pausa urbanística en zonas de recarga amortiguan el impacto de la sequía sobre el caudal hídrico metropolitano.",
        impactoForzado: { recargaAcuifero: -5, calidadAirePM25: +7, coberturaBosque: -1 }
      };
    } else if (estado && (estado.recargaAcuifero < 65 || medidas.has("permisividad_inmobiliaria"))) {
      return {
        titulo: "Catástrofe hídrica por estiaje extremo de El Niño",
        descripcion: "El bajo nivel freático y el sellado de suelos provocan la desecación crítica de pozos vecinales y racionamiento forzado de agua potable.",
        impactoForzado: { recargaAcuifero: -18, calidadAirePM25: +20, coberturaBosque: -4, descontentoSocial: +10 }
      };
    }
  }

  if (anio === 2028) {
    if (estado && estado.recargaAcuifero >= 75 && estado.descontentoSocial < 40) {
      return {
        titulo: "Jornadas de concertación ciudadana y veeduría hídrica distrital",
        descripcion: "La estabilidad en el abastecimiento de agua potable desactiva marchas vecinales; juntas de distrito respaldan el plan de recarga freática.",
        impactoForzado: { descontentoSocial: -8, indicePIB: +2 }
      };
    } else if (estado && estado.recargaAcuifero < 55) {
      return {
        titulo: "Estallido social: Bloqueo metropolitano indefinido por colapso hídrico",
        descripcion: "Vecinos de distritos periurbanos sin agua bloquean los cuatro accesos a la ciudad exigiendo renuncia de directores y declaratoria de desastre.",
        impactoForzado: { descontentoSocial: +28, indicePIB: -8 }
      };
    }
  }

  if (anio === 2029) {
    if (medidas.has("red_brt_electrico") || medidas.has("impuesto_pigouviano_emisiones")) {
      return {
        titulo: "Ola de calor con inversión térmica atenuada por transporte limpio",
        descripcion: "A pesar de las altas temperaturas, la reducción de gases vehiculares amortigua los picos tóxicos a ras de suelo.",
        impactoForzado: { calidadAirePM25: +10, saturacionSalud: +8, descontentoSocial: +3 }
      };
    } else if (estado && estado.calidadAirePM25 > 50) {
      return {
        titulo: "Emergencia atmosférica por ola de calor e inversión térmica severa",
        descripcion: "La masa de contaminantes vehiculares e industriales queda atrapada a baja altura, triplicando las atenciones de urgencias pediátricas.",
        impactoForzado: { calidadAirePM25: +32, saturacionSalud: +28, descontentoSocial: +12 }
      };
    }
  }

  if (anio === 2031) {
    if (medidas.has("planta_biogas_compostaje") || medidas.has("inclusion_recicladores")) {
      return {
        titulo: "Contención temprana de lixiviados gracias a la segregación 9R",
        descripcion: "La reducción de materia orgánica húmeda en celdas de vertedero evita filtraciones masivas a las napas freáticas profundas.",
        impactoForzado: { recargaAcuifero: -2, saturacionSalud: +4, descontentoSocial: +4 }
      };
    }
  }

  if (anio === 2034) {
    if (estado && estado.coberturaBosque >= 75) {
      return {
        titulo: "Fondo Verde Mundial premia con máxima subvención la preservación Chiquitana",
        descripcion: "Organismos internacionales reconocen la eficacia en frenar chaqueos otorgando financiamiento récord no reembolsable.",
        impactoForzado: { presupuestoBonus: +45, descontentoSocial: -15 }
      };
    } else if (estado && estado.coberturaBosque < 55) {
      return {
        titulo: "Sanción y exclusión de fondos verdes por deforestación récord",
        descripcion: "La cooperación internacional retira su apoyo financiero ante la destrucción sostenida de áreas protegidas de la Chiquitania.",
        impactoForzado: { presupuestoBonus: 0, descontentoSocial: +10 }
      };
    }
  }

  return base;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CONFIG_INICIAL,
    MEDIDAS_POLITICA,
    EVENTOS_HISTORICOS,
    TEORIAS_ACADEMICAS,
    resolverEventoDinamico
  };
}

