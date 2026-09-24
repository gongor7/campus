// Cliente HTTP mínimo (sin dependencias externas, Constitución #6).

export interface Simulation {
  id: number;
  slug: string;
  title: string;
  objective: string;
  description: string;
}

export interface Indicator {
  name: string;
  value: string;
  trend?: string;
  note?: string;
}

export interface ScenarioInformation {
  indicators: Indicator[];
  documents?: { title: string; summary: string }[];
  notes?: string[];
}

export interface PublicScenario {
  id: number;
  code: string;
  title: string;
  context: string;
  information: ScenarioInformation;
  question: string;
  decisions: { id: number; code: string; label: string }[];
}

export interface Attempt {
  id: string;
  simulationId: number;
  status: 'in_progress' | 'completed';
}

export interface DecisionOutcome {
  consequence: string;
  feedback: string;
  stepMaxScore: number;
  completed: boolean;
  nextScenario: PublicScenario | null;
}

export interface AttemptResult {
  attemptId: string;
  simulationId: number;
  score: number;
  maxScore: number;
  steps: {
    position: number;
    scenarioTitle: string;
    question: string;
    decisionLabel: string;
    feedback: string;
    score: number;
  }[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  simulations: () => request<Simulation[]>('/simulations'),
  simulation: (id: number) => request<Simulation>(`/simulations/${id}`),
  startAttempt: (simulationId: number, sessionId: string) =>
    request<{ attempt: Attempt; scenario: PublicScenario }>('/attempts', {
      method: 'POST',
      body: JSON.stringify({ simulationId, sessionId }),
    }),
  attemptState: (attemptId: string) =>
    request<{ attempt: Attempt; scenario: PublicScenario | null }>(`/attempts/${attemptId}`),
  decide: (attemptId: string, decisionId: number) =>
    request<DecisionOutcome>(`/attempts/${attemptId}/decisions`, {
      method: 'POST',
      body: JSON.stringify({ decisionId }),
    }),
  result: (attemptId: string) => request<AttemptResult>(`/attempts/${attemptId}/result`),
};

/** Sesión anónima persistida (SPEC D2). */
export function getSessionId(): string {
  let id = localStorage.getItem('campus-asfi-session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('campus-asfi-session', id);
  }
  return id;
}
