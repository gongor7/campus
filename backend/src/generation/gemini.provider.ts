import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  BankInput,
  GradeInput,
  GradeOutput,
  LessonContent,
  LessonInput,
  OutlineInput,
  OutlineProposal,
  QuestionDraft,
  VariantInput,
  VariantOutput,
} from './ai-provider';

/**
 * Implementacion de AIProvider sobre la API de Gemini (Generative Language API).
 * Regla de contexto cerrado (SPEC-ai-generation): el request incluye unicamente
 * las fuentes recibidas, la plantilla y los datos del curso; no se activa
 * ninguna herramienta de busqueda externa y la temperatura es baja.
 */
@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  readonly name = 'gemini';

  constructor(
    private readonly config: ConfigService,
    private readonly settings: SettingsService,
  ) {}

  /**
   * Modelo activo: configuracion (pestana) > variable de entorno > alias
   * estable que siempre apunta al Flash vigente (evita modelos retirados
   * como gemini-2.5-flash, que devuelve 404 para keys nuevas).
   */
  get model(): string {
    return (
      this.settings.snapshot().geminiModel ??
      this.config.get<string>('GEMINI_MODEL') ??
      'gemini-flash-latest'
    );
  }

  async generateOutline(input: OutlineInput): Promise<OutlineProposal> {
    const prompt =
      'Eres un disenador instruccional institucional. Propone la estructura de un curso de formacion.\n' +
      'REGLAS OBLIGATORIAS:\n' +
      '- Usa EXCLUSIVAMENTE la informacion de los documentos adjuntos y los datos del curso. No inventes normativa, cifras ni procedimientos.\n' +
      '- No actives ni sugieras busqueda externa: tu unico universo son los documentos adjuntos.\n' +
      '- Si un tema necesario no esta cubierto por las fuentes, incluyelo en coverageGaps; no lo inventes.\n' +
      '- La cantidad de modulos y lecciones debe respetar las restricciones de la plantilla.\n' +
      '- Cada modulo debe citar en sourceRefs los nombres de archivo que lo sustentan.\n' +
      '- La suma de minutos debe aproximarse al objetivo de horas del curso.\n' +
      'Responde SOLO con JSON valido con esta forma exacta:\n' +
      '{"modules":[{"title":"","objective":"","estimatedMinutes":0,"sourceRefs":["archivo.pdf"],"lessons":[{"title":"","objective":"","estimatedMinutes":0}]}],' +
      '"sections":[{"type":"INTRODUCTION","title":"","content":""},{"type":"PRACTICE","title":"","content":""},{"type":"EVALUATION","title":"","content":""},{"type":"CLOSING","title":"","content":""}],' +
      '"totalEstimatedMinutes":0,"coverageGaps":[{"topic":"","reason":""}]}\n\n' +
      `DATOS DEL CURSO:\n${JSON.stringify(input.course, null, 2)}\n\n` +
      `PLANTILLA INSTITUCIONAL (restricciones):\n${JSON.stringify(input.templateSections, null, 2)}`;

    const parsed = await this.call(prompt, input.sources);
    return this.expectShape<OutlineProposal>(parsed, ['modules', 'sections', 'totalEstimatedMinutes', 'coverageGaps'], 'generateOutline');
  }

  async generateLessonContent(input: LessonInput): Promise<LessonContent> {
    const prompt =
      'Eres un disenador instruccional institucional. Redacta UNA leccion de un curso.\n' +
      'REGLAS OBLIGATORIAS:\n' +
      '- Usa EXCLUSIVAMENTE la informacion de los documentos adjuntos y los datos del curso. No inventes normativa, cifras ni procedimientos.\n' +
      '- Cita en sourceRefs los nombres de archivo que sustentan el contenido.\n' +
      '- Si las fuentes no alcanzan para cubrir la leccion, senalalo en el contenido; no lo inventes.\n' +
      'Responde SOLO con JSON valido con esta forma exacta:\n' +
      '{"objective":"","content":"","sourceRefs":["archivo.pdf"]}\n\n' +
      `CURSO:\n${JSON.stringify(input.course, null, 2)}\n\n` +
      `MODULO: ${input.moduleTitle}\nOBJETIVO DEL MODULO: ${input.moduleObjective}\n` +
      `LECCION A REDACTAR: ${input.lessonTitle}`;

    const parsed = await this.call(prompt, input.sources);
    return this.expectShape<LessonContent>(parsed, ['objective', 'content', 'sourceRefs'], 'generateLessonContent');
  }

  async generateQuestionBank(input: BankInput): Promise<{ questions: QuestionDraft[] }> {
    const prompt =
      'Eres un disenador de evaluaciones institucionales. Genera un banco de preguntas de CASO con RESPUESTA ABIERTA.\n' +
      'REGLAS OBLIGATORIAS:\n' +
      '- Usa EXCLUSIVAMENTE el contenido del curso y los documentos adjuntos. No inventes normativa ni cifras.\n' +
      '- Cada pregunta plantea un caso concreto cuyo analisis exige APLICAR conceptos del material: una respuesta generica copiada de otra IA no debe bastar.\n' +
      '- expectedConcepts enumera los conceptos del material que una buena respuesta debe cubrir (2 a 4).\n' +
      '- sourceRefs cita el documento o leccion que sustenta la respuesta correcta.\n' +
      '- variationTemplate define que puede variar del caso entre intentos (entidad, monto, situacion) manteniendo el concepto evaluado.\n' +
      'Responde SOLO JSON: {"questions":[{"caseText":"","prompt":"","expectedConcepts":[""],"sourceRefs":[""],"variationTemplate":{"variableAspects":[""],"constraints":""}}]}\n' +
      `Genera entre 5 y 8 preguntas.\n\nCURSO:\n${JSON.stringify(input.course, null, 2)}\n\n` +
      `LECCIONES:\n${JSON.stringify(input.lessons.map((l) => ({ title: l.title, content: (l.content ?? '').slice(0, 2000), sourceRefs: l.sourceRefs })), null, 2)}`;

    const parsed = await this.call(prompt, input.sources);
    const shaped = this.expectShape<{ questions: QuestionDraft[] }>(parsed, ['questions'], 'generateQuestionBank');
    if (!Array.isArray(shaped.questions) || shaped.questions.length === 0) {
      throw new BadGatewayException('El proveedor Gemini no devolvio preguntas');
    }
    return shaped;
  }

  async generateVariants(input: VariantInput): Promise<VariantOutput> {
    const prompt =
      'Transforma cada caso de examen segun su plantilla de variacion, cambiando SOLO los aspectos variables ' +
      '(entidad, monto, plazo, situacion) y manteniendo identico el concepto evaluado y la dificultad.\n' +
      'Responde SOLO JSON: {"variants":[{"questionId":0,"caseText":""}]}\n\n' +
      `PREGUNTAS:\n${JSON.stringify(input.questions, null, 2)}`;

    const parsed = await this.call(prompt, []);
    const shaped = this.expectShape<VariantOutput>(parsed, ['variants'], 'generateVariants');
    if (shaped.variants.length !== input.questions.length) {
      throw new BadGatewayException('El proveedor Gemini no devolvio una variante por pregunta');
    }
    return shaped;
  }

  async gradeAnswer(input: GradeInput): Promise<GradeOutput> {
    const prompt =
      'Eres calificador institucional. Evalua la respuesta del estudiante aplicando esta rubrica:\n' +
      '- Puntaje 0-100 segun cuantos conceptos esperados cubre y la calidad del analisis del caso.\n' +
      '- Si la respuesta no se sustenta en el material del curso (conceptos genericos sin anclaje institucional), sustained=false y el puntaje no puede superar 50.\n' +
      '- feedback: conceptos faltantes y la referencia del curso que los desarrolla. Tono formativo que invite a reintentar.\n' +
      'Responde SOLO JSON: {"score":0,"sustained":true,"feedback":""}\n\n' +
      `CURSO:\n${JSON.stringify(input.course, null, 2)}\n\nPREGUNTA:\n${JSON.stringify(input.question, null, 2)}\n\nRESPUESTA DEL ESTUDIANTE:\n${input.answer}`;

    const parsed = await this.call(prompt, []);
    const graded = this.expectShape<GradeOutput>(parsed, ['score', 'sustained', 'feedback'], 'gradeAnswer');
    if (graded.sustained === false && graded.score > 50) graded.score = 50;
    return graded;
  }

  /** Prueba minima de conectividad para la pestana Configuracion. */
  async ping(): Promise<string> {
    const parsed = await this.call('Responde exactamente con la palabra: CONECTADO', []);
    return typeof parsed === 'object' && parsed !== null
      ? 'respuesta recibida'
      : String(parsed).slice(0, 100);
  }

  private async currentKey(): Promise<string | null> {
    const fromSettings = await this.settings.get('GEMINI_API_KEY');
    return fromSettings ?? this.config.get<string>('GEMINI_API_KEY') ?? null;
  }

  private async call(prompt: string, sources: { filename: string; mimeType: string; base64: string }[]): Promise<unknown> {
    const apiKey = await this.currentKey();
    if (!apiKey) {
      throw new BadGatewayException('Sin API key de Gemini: ingresala en Configuracion (o define GEMINI_API_KEY) para usar la IA real');
    }

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            ...sources.map((s) => ({
              inline_data: { mime_type: s.mimeType, data: s.base64 },
            })),
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;

    // 429/5xx son transitorios frecuentes en el tier gratuito: se reintenta.
    const TRANSIENT = new Set([429, 500, 502, 503, 504]);
    const ATTEMPTS = 3;
    let response: Response | null = null;
    let lastStatus = 0;

    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        lastStatus = response.status;
        if (response.ok || !TRANSIENT.has(response.status)) break;
        this.logger.warn(`Gemini HTTP ${response.status} (intento ${attempt}/${ATTEMPTS}); reintentando`);
      } catch (error) {
        this.logger.warn(`Gemini: fallo de red (intento ${attempt}/${ATTEMPTS}): ${(error as Error).message}`);
        response = null;
      }
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }

    if (!response) {
      throw new BadGatewayException('No se pudo contactar al proveedor Gemini');
    }
    if (!response.ok) {
      const detail = await response.text();
      this.logger.error(`Gemini HTTP ${lastStatus}: ${detail.slice(0, 500)}`);
      throw new BadGatewayException(`El proveedor Gemini respondio con error ${lastStatus}`);
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    try {
      return JSON.parse(text);
    } catch {
      throw new BadGatewayException('El proveedor Gemini devolvio una respuesta no interpretable como JSON');
    }
  }

  private expectShape<T>(parsed: unknown, requiredKeys: string[], operation: string): T {
    if (typeof parsed !== 'object' || parsed === null) {
      throw new BadGatewayException(`Respuesta de Gemini invalida en ${operation}`);
    }
    for (const key of requiredKeys) {
      if (!(key in (parsed as Record<string, unknown>))) {
        throw new BadGatewayException(`Respuesta de Gemini invalida en ${operation}: falta ${key}`);
      }
    }
    return parsed as T;
  }
}
