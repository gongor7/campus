import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, LessonContent, LessonInput, OutlineInput, OutlineProposal } from './ai-provider';

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

  constructor(private readonly config: ConfigService) {}

  get model(): string {
    return this.config.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
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

  private async call(prompt: string, sources: { filename: string; mimeType: string; base64: string }[]): Promise<unknown> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new BadGatewayException('GEMINI_API_KEY no configurada: no se puede generar con el proveedor gemini');
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
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      this.logger.error(`Gemini: fallo de red: ${(error as Error).message}`);
      throw new BadGatewayException('No se pudo contactar al proveedor Gemini');
    }

    if (!response.ok) {
      const detail = await response.text();
      this.logger.error(`Gemini HTTP ${response.status}: ${detail.slice(0, 500)}`);
      throw new BadGatewayException(`El proveedor Gemini respondio con error ${response.status}`);
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
