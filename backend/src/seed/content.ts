import { ScenarioInformation } from '../scenarios/scenario.entity';

export interface SeedDecision {
  code: string;
  label: string;
  consequence: string;
  feedback: string;
  score: number;
  nextScenarioCode: string | null; // null = fin de la simulación
}

export interface SeedScenario {
  code: string;
  title: string;
  context: string;
  information: ScenarioInformation;
  question: string;
  decisions: SeedDecision[];
}

export interface SeedSimulation {
  slug: string;
  title: string;
  objective: string;
  description: string;
  scenarios: SeedScenario[];
}

export const PILOT_SIMULATION: SeedSimulation = {
  slug: 'supervision-cartera-mora',
  title: 'Análisis de supervisión: crecimiento de cartera y aumento de mora',
  objective:
    'Desarrollar la capacidad de analizar una situación de supervisión prudencial priorizando información, identificando riesgos subyacentes y decidiendo el requerimiento apropiado a la entidad.',
  description:
    'Asumes el rol de supervisor de una entidad de intermediación financiera que presenta un crecimiento acelerado de su cartera de créditos concurrente con un aumento del índice de mora. Deberás decidir qué analizar, cómo profundizar y qué medida de supervisión requerir. Tus decisiones determinan el rumbo del caso.',
  scenarios: [
    {
      code: 'E1',
      title: 'Alerta inicial en el tablero de supervisión',
      context:
        'En la revisión trimestral del sistema de alertas tempranas, la entidad FINANZAS DEL VALLE S.A. presenta dos señales simultáneas: su cartera de créditos creció 38% en los últimos doce meses (muy por encima del crecimiento del sistema, de 11%) y su índice de mora pasó de 3,1% a 5,4% en el mismo período. La gerencia de la entidad atribuye el aumento de mora a un "ajuste transitorio de temporada".',
      information: {
        indicators: [
          { name: 'Crecimiento de cartera (12 meses)', value: '38%', trend: '↑', note: 'Sistema: 11%' },
          { name: 'Índice de mora', value: '5,4%', trend: '↑', note: 'Hace 12 meses: 3,1%' },
          { name: 'Cartera total', value: 'BS 420 millones', trend: '↑' },
          { name: 'Ratio de patrimonio efectivo', value: '12,8%', trend: '→', note: 'Requisito mínimo: 10%' },
        ],
        notes: [
          'Nota del gerente de crédito: "El aumento de mora responde a factores estacionales; se corregirá en el próximo trimestre".',
          'La entidad abrió 6 agencias nuevas en el último año.',
        ],
      },
      question: 'Como supervisor responsable del caso, ¿qué deberías analizar primero?',
      decisions: [
        {
          code: 'A',
          label: 'Desagregar la cartera y la mora por segmento, producto, zona y antigüedad para localizar el foco del problema',
          consequence:
            'El análisis desagregado revela que el crecimiento se concentra en créditos de consumo de libre disponibilidad otorgados en las agencias nuevas, y que la mora se concentra en operaciones de menos de 6 meses de antigüedad: la cartera nueva es la que entra en mora.',
          feedback:
            'Antes de interpretar causas o actuar, la desagregación de indicadores permite distinguir dónde se origina el problema. Atribuir el fenómeno a un "factor estacional" sin evidencia es precisamente lo que debía contrastarse. Este es el punto de partida correcto del análisis.',
          score: 90,
          nextScenarioCode: 'E2A',
        },
        {
          code: 'B',
          label: 'Revisar las políticas de crédito de la entidad y la concentración de la cartera por deudor',
          consequence:
            'La revisión muestra que las políticas formales están actualizadas y la concentración por deudor está dentro de límites. Sin embargo, esta mirada no explica por qué crece la mora: las políticas escritas pueden estar bien y aun así no aplicarse en la originación diaria.',
          feedback:
            'Es una línea de análisis válida y complementaria, pero parte de una hipótesis (falla de política o concentración) que los indicadores primarios no sugieren como primera explicación. Analizar primero la composición de la cartera habría orientado mejor esta revisión.',
          score: 65,
          nextScenarioCode: 'E2B',
        },
        {
          code: 'C',
          label: 'Solicitar de inmediato una visita de inspección in situ a la entidad',
          consequence:
            'La visita se programa, pero consume varias semanas de coordinación. Al llegar, los inspectores encuentran una entidad en operación normal y la visita devuelve hallazgos genéricos, sin foco: no había hipótesis de riesgo concreta que verificar.',
          feedback:
            'La inspección in situ es una herramienta de profundización valiosa, pero no de primer diagnóstico. Dirigirla requiere hipótesis formadas a partir del análisis de la información disponible; sin ellas, el recurso de supervisión se dispersa.',
          score: 35,
          nextScenarioCode: 'E2C',
        },
      ],
    },
    {
      code: 'E2A',
      title: 'El foco del problema: originación acelerada en agencias nuevas',
      context:
        'Tu desagregación confirma que el problema está en la originación reciente: la mora de la cartera otorgada en los últimos 6 meses (9,8%) casi duplica la de la cartera previa (5,0%). En las 6 agencias nuevas la rotación de oficiales de crédito es alta y several de ellos fueron incorporados sin experiencia previa en análisis crediticio.',
      information: {
        indicators: [
          { name: 'Mora cartera < 6 meses', value: '9,8%', trend: '↑' },
          { name: 'Mora cartera > 6 meses', value: '5,0%', trend: '→' },
          { name: 'Créditos de consumo / cartera total', value: '58%', trend: '↑' },
          { name: 'Rotación anual de oficiales (agencias nuevas)', value: '45%', trend: '↑' },
        ],
        notes: [
          'El crecimiento se explica casi en su totalidad por créditos de consumo de libre disponibilidad.',
          'La política de crédito exige capacidad de pago demostrada, pero no hay evidencia de su control en la originación reciente.',
        ],
      },
      question: 'Con este diagnóstico, ¿cuál es la siguiente profundización más pertinente?',
      decisions: [
        {
          code: 'A',
          label: 'Evaluar el proceso de originación: muestra de expedientes de créditos recientes para verificar capacidad de pago y cumplimiento de estándares',
          consequence:
            'La muestra de 60 expedientes muestra que en 38% de los casos la capacidad de pago declarada no está sustentada o el nivel de endeudamiento supera los parámetros de la propia política de la entidad. El hallazgo es verificable y documentable.',
          feedback:
            'Verificar el proceso real de originación conecta directamente el indicador (mora en cartera nueva) con su causa operativa (estándares no aplicados). Es la evidencia que sustenta cualquier requerimiento posterior de supervisión.',
          score: 95,
          nextScenarioCode: 'E3',
        },
        {
          code: 'B',
          label: 'Solicitar a la entidad un informe explicativo sobre el aumento de la mora',
          consequence:
            'La entidad presenta un informe que reitera la explicación estacional y compromete "reforzar los controles". El documento no aporta evidencia nueva ni compromisos verificables.',
          feedback:
            'Pedir explicaciones a la entidad es un paso legítimo, pero confiar en su autodiagnóstico cuando la evidencia apunta a debilidades en su propio proceso de originación limita el valor supervisorio. La verificación independiente suele ser necesaria.',
          score: 55,
          nextScenarioCode: 'E3',
        },
        {
          code: 'C',
          label: 'Comparar los indicadores de la entidad con el promedio del sistema y dar por suficientemente analizado el caso',
          consequence:
            'La comparación confirma que la entidad está por encima del promedio del sistema en mora y en crecimiento, pero cerrar el análisis aquí deja sin explicar el mecanismo que genera el problema ni respalda una medida concreta.',
          feedback:
            'El benchmarking contextualiza, no sustituye al diagnóstico. Haber identificado el foco (originación reciente) y no profundizar en él desaprovecha el avance logrado en el análisis.',
          score: 30,
          nextScenarioCode: 'E3',
        },
      ],
    },
    {
      code: 'E2B',
      title: 'Políticas correctas sobre el papel',
      context:
        'La revisión documental confirma que la política de crédito está actualizada, aprobada por directorio y dentro de los límites regulatorios. Sin embargo, al examinar la evolución de los desembolsos por agencia, observas que las 6 agencias nuevas concentran el crecimiento y que sus volúmenes por oficial son los más altos de la red.',
      information: {
        indicators: [
          { name: 'Desembolsos mensuales por oficial (agencias nuevas)', value: 'BS 1,9 M', trend: '↑', note: 'Promedio de la red: BS 0,8 M' },
          { name: 'Cumplimiento documental de política', value: 'Aprobado por directorio', trend: '→' },
          { name: 'Índice de mora agregado', value: '5,4%', trend: '↑' },
        ],
        notes: [
          'La política exige capacidad de pago demostrada para créditos de consumo.',
          'No existe evidencia de verificación del cumplimiento de esa exigencia en la originación reciente.',
        ],
      },
      question: '¿Cómo continuar el análisis a partir de este hallazgo?',
      decisions: [
        {
          code: 'A',
          label: 'Verificar la aplicación efectiva de la política: examinar expedientes de créditos recientes en las agencias de mayor volumen',
          consequence:
            'El examen de expedientes detecta que una parte relevante de los créditos recientes carece de sustento de capacidad de pago, pese a lo que exige la política. La debilidad no es normativa sino operativa.',
          feedback:
            'La brecha entre política escrita y práctica efectiva es un hallazgo clásico de supervisión. Verificar la aplicación real es el camino correcto para transformar una observación documental en evidencia accionable.',
          score: 90,
          nextScenarioCode: 'E3',
        },
        {
          code: 'B',
          label: 'Elevar el hallazgo directamente al directorio de la entidad pidiendo explicaciones formales',
          consequence:
            'El directorio responde con un compromiso genérico de "supervisión reforzada de las agencias". Sin evidencia de incumplimiento concreto, el requerimiento pierde fuerza y trazabilidad.',
          feedback:
            'Comunicarse con el directorio es una vía apropiada, pero la efectividad del requerimiento depende de la evidencia que lo sustente. Escalar antes de verificar debilita la posición del supervisor.',
          score: 50,
          nextScenarioCode: 'E3',
        },
        {
          code: 'C',
          label: 'Cerrar esta línea de análisis y examinar la calidad del colateral de la cartera',
          consequence:
            'El análisis de colateral muestra garantías razonables en promedio, pero los créditos de consumo de libre disponibilidad son en gran parte quirografarios. El hallazgo es útil, aunque no ataca la causa del deterioro.',
          feedback:
            'El colateral mitiga la pérdida dado el incumplimiento, pero no frena la originación de créditos que no pueden pagarse. Es una dimensión complementaria, no el eje del caso.',
          score: 45,
          nextScenarioCode: 'E3',
        },
      ],
    },
    {
      code: 'E2C',
      title: 'Visa sin foco: resultados genéricos',
      context:
        'La visita de inspección, programada sin hipótesis previas, devolvió hallazgos genéricos: demoras administrativas y oportunas oportunidades de mejora en atención. El tiempo transcurrido permite, eso sí, observar que la mora siguió subiendo (5,9%) mientras tanto.',
      information: {
        indicators: [
          { name: 'Índice de mora (actualizado)', value: '5,9%', trend: '↑' },
          { name: 'Tiempo transcurrido desde la alerta', value: '6 semanas', trend: '→' },
          { name: 'Hallazgos accionables de la visita', value: 'Ninguno específico', trend: '→' },
        ],
        notes: [
          'El inspector sugiere retomar el trabajo de gabinete con la información disponible.',
        ],
      },
      question: 'La visita no aportó foco y la mora sigue subiendo. ¿Cómo retomar el caso?',
      decisions: [
        {
          code: 'A',
          label: 'Retomar el análisis de gabinete: desagregar cartera y mora para formar hipótesis verificables y, con base en ellas, planificar una nueva intervención',
          consequence:
            'La desagregación identifica el foco (originación reciente en agencias nuevas) y permite preparar una verificación dirigida de expedientes. El caso recupera dirección.',
          feedback:
            'Reconocer que la herramienta elegida no produjo información y volver a la base analítica es una corrección de curso valiosa en supervisión. Toda intervención de campo debería sustentarse en hipótesis verificables.',
          score: 80,
          nextScenarioCode: 'E3',
        },
        {
          code: 'B',
          label: 'Insistir con una segunda visita inmediata, ahora a las agencias nuevas',
          consequence:
            'La segunda visita mejora el foco geográfico, pero sin hipótesis sobre el mecanismo del problema los hallazgos siguen siendo descriptivos y el costo de supervisión se duplica.',
          feedback:
            'Aproximarse al lugar del problema es razonable, pero la eficiencia supervisoria depende de qué se va a verificar. Una visita sin hipótesis formadas repite el error de la primera.',
          score: 45,
          nextScenarioCode: 'E3',
        },
        {
          code: 'C',
          label: 'Esperar el próximo informe trimestral de la entidad para ver si la mora se corrige sola',
          consequence:
            'Ocho semanas después la mora alcanza 6,3%. El deterioro se consolidó mientras el caso permanecía en espera.',
          feedback:
            'La inacción frente a señales concurrentes de riesgo (crecimiento acelerado + mora creciente) permite que el problema se instaure. La supervisión prudencial exige actuar sobre la evidencia disponible, no esperar su confirmación tardía.',
          score: 20,
          nextScenarioCode: 'E3',
        },
      ],
    },
    {
      code: 'E3',
      title: 'Síntesis del diagnóstico',
      context:
        'Con independencia del camino recorrido, la evidencia converge: la entidad creció su cartera de consumo a un ritmo no sustentado por su capacidad de originación — créditos sin capacidad de pago demostrada, oficiales sin experiencia suficiente y controles operativos débiles en agencias nuevas — y ese deterioro de la calidad de originación es el motor del aumento de mora.',
      information: {
        indicators: [
          { name: 'Índice de mora', value: '5,6% – 6,3% (según evolución)', trend: '↑' },
          { name: 'Créditos recientes sin sustento de capacidad de pago (muestra)', value: '30% – 40%', trend: '↑' },
          { name: 'Ratio de patrimonio efectivo', value: '12,1%', trend: '↓', note: 'Aún sobre el mínimo de 10%' },
        ],
        notes: [
          'La explicación "estacional" de la entidad quedó descartada por la evidencia.',
          'El capital aún absorbe la pérdida esperada, pero la tendencia es descendente.',
        ],
      },
      question: 'El diagnóstico está formado. ¿Cuál es el curso de acción de supervisión apropiado?',
      decisions: [
        {
          code: 'A',
          label: 'Emitir un requerimiento formal y trazable a la entidad: plan de corrección de la originación, sustentado en la evidencia, con plazos y seguimiento',
          consequence:
            'El requerimiento obliga a la entidad a presentar en 30 días un plan que corrija la verificación de capacidad de pago, la capacitación de oficiales y los controles de las agencias nuevas, con hitos verificables de reducción de mora.',
          feedback:
            'El requerimiento formal convierte el diagnóstico en acción: define responsable, plazo y evidencia de cumplimiento, y deja constancia para el expediente supervisorio. Es la medida proporcional al hallazgo.',
          score: 95,
          nextScenarioCode: 'E4',
        },
        {
          code: 'B',
          label: 'Recomendación prudencial informal a la gerencia, sin formalización en expediente',
          consequence:
            'La gerencia agradece la recomendación, pero sin obligación formal no se asigna presupuesto ni responsables. Dos meses después los indicadores continúan deteriorándose sin trazabilidad de la gestión supervisora.',
          feedback:
            'Las recomendaciones informales pueden acompañar, pero no sustituir, la medida formal cuando existe evidencia documentada de debilidades. La trazabilidad protege tanto a la entidad como al supervisor.',
          score: 40,
          nextScenarioCode: 'E4',
        },
        {
          code: 'C',
          label: 'Sancionar inmediatamente a la entidad por el aumento de la mora',
          consequence:
            'El proceso sancionador se inicia, pero la mora elevada por sí misma no configura infracción: el expediente queda débil y la entidad lo recurre, desviando el caso hacia una disputa legal en lugar de la corrección operativa.',
          feedback:
            'La potestad sancionadora es la última ratio de la supervisión: exige infracción acreditada a una norma concreta. Ante debilidades prudenciales, la herramienta correcta es el requerimiento correctivo; escalar de más resta eficacia.',
          score: 25,
          nextScenarioCode: 'E4',
        },
      ],
    },
    {
      code: 'E4',
      title: 'Ejecución del requerimiento',
      context:
        'El requerimiento formal fue emitido y la entidad presentó su plan de corrección. La calidad del plan varía: compromete reforzar la verificación de capacidad de pago y capacitar a los oficiales, pero algunos hitos carecen de métricas y el área de riesgo de la entidad tiene limitada capacidad de seguimiento.',
      information: {
        indicators: [
          { name: 'Plan presentado dentro del plazo', value: 'Sí (30 días)', trend: '→' },
          { name: 'Hitos con métrica verificable', value: '2 de 5', trend: '→' },
          { name: 'Mora proyectada sin corrección', value: '7,5% a fin de año', trend: '↑' },
        ],
        notes: [
          'La entidad propone que el propio área de crédito monitoree el plan.',
        ],
      },
      question: '¿Cómo asegurar que el plan de corrección se cumpla efectivamente?',
      decisions: [
        {
          code: 'A',
          label: 'Exigir el fortalecimiento del plan: métricas verificables en todos los hitos y un área de seguimiento independiente del área de crédito',
          consequence:
            'La entidad ajusta el plan: los cinco hitos quedan medibles, el seguimiento pasa al área de riesgos y se reporta a la superintendencia con frecuencia mensual. El plan se vuelve auditable.',
          feedback:
            'Un plan es tan bueno como su verificabilidad. Separar la ejecución (crédito) del control (riesgos) es un principio básico de gobierno del riesgo: quien ejecuta no debe ser el único que mide.',
          score: 95,
          nextScenarioCode: 'E5',
        },
        {
          code: 'B',
          label: 'Aceptar el plan tal como fue presentado y revisar los resultados en el próximo ciclo trimestral',
          consequence:
            'El plan se ejecuta parcialmente: sin métricas, los avances se reportan en términos cualitativos y el seguimiento pierde rigor. La mora desciende levemente, pero la originación débil persiste.',
          feedback:
            'Aceptar un plan sin verificabilidad transfiere el riesgo al siguiente ciclo. La experiencia supervisoria muestra que los planes sin métricas tienden a cumplirse "en el informe" y no en la operación.',
          score: 50,
          nextScenarioCode: 'E5',
        },
        {
          code: 'C',
          label: 'Complementar con una inspección in situ dirigida a verificar el proceso de originación corregido',
          consequence:
            'La inspección dirigida —ahora con hipótesis y alcance definidos— verifica en campo la nueva rutina de originación y valida que la corrección efectivamente opera. El caso combina requerimiento y verificación independiente.',
          feedback:
            'La verificación independiente del cumplimiento es una combinación sólida con el requerimiento. Como cierre, habría sido aún más completa exigiendo antes la verificabilidad del plan (métricas y seguimiento independiente).',
          score: 80,
          nextScenarioCode: 'E5',
        },
      ],
    },
    {
      code: 'E5',
      title: 'Cierre del caso',
      context:
        'Seis meses después, los indicadores muestran el efecto acumulado del caso: la mora de la cartera nueva descendió, la originación con sustento de capacidad de pago se normalizó en la mayor parte de la red y el expediente supervisorio quedó documentado de punta a punta. En la sesión de cierre participan la gerencia de la entidad y el equipo de supervisión.',
      information: {
        indicators: [
          { name: 'Índice de mora (actual)', value: '4,9% – 5,8% (según camino)', trend: '↓' },
          { name: 'Mora cartera nueva', value: '7,8% – 9,1% (según camino)', trend: '↓' },
          { name: 'Expediente supervisorio', value: 'Completo y trazable', trend: '→' },
        ],
        notes: [
          'La entidad incorporó el caso a su capacitación interna de oficiales de crédito.',
        ],
      },
      question: '¿Qué cierre del caso deja mayor valor de aprendizaje para el sistema?',
      decisions: [
        {
          code: 'A',
          label: 'Documentar lecciones aprendidas y compartirlas como caso de referencia para la supervisión de crecimiento acelerado de cartera',
          consequence:
            'El caso se convierte en material de referencia: la secuencia alerta → desagregación → verificación → requerimiento → seguimiento queda documentada como buena práctica replicable.',
          feedback:
            'Institutionalizar el aprendizaje multiplica el valor del caso más allá de la entidad supervisada. Convertir la experiencia en método es la marca de una supervisión madura.',
          score: 95,
          nextScenarioCode: null,
        },
        {
          code: 'B',
          label: 'Cerrar el expediente y pasar al siguiente caso: el resultado ya habla por sí mismo',
          consequence:
            'El expediente se cierra correctamente, pero el conocimiento generado se queda en el equipo que lo trabajó. Ante el siguiente caso similar, la institución vuelve a empezar de cero.',
          feedback:
            'Cerrar en orden es necesario, pero no suficiente. El conocimiento supervisorio no documentado se pierde con la rotación de equipos; sistematizarlo es lo que diferencia la gestión del caso de la generación de capacidad.',
          score: 60,
          nextScenarioCode: null,
        },
        {
          code: 'C',
          label: 'Mantener el caso abierto de forma indefinida para precaución adicional',
          consequence:
            'El caso permanece abierto consumiendo capacidad de supervisión, aunque los indicadores estén corregidos y el requerimiento cumplido. Los recursos no se reasignan a nuevas alertas.',
          feedback:
            'La supervisión es un recurso escaso: mantener casos abiertos sin criterio de cierre resta capacidad para atender riesgos emergentes. El cierre oportuno con documentación adecuada también es una competencia supervisora.',
          score: 30,
          nextScenarioCode: null,
        },
      ],
    },
  ],
};
