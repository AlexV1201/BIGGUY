import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ddf400a0`;

// ==================== TEST MODE ====================
// Cambia a false cuando quieras usar la API real y gastar créditos
const TEST_MODE = true;

// ==================== SUPABASE CLIENT ====================

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== USER PROFILE API ====================

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  progress: number;
}

export interface UserProfile {
  userId: string;
  career: string;
  firstName: string;
  lastName: string;
  age?: number;
  university?: string;
  weeklyStudyHours?: number;
  profilePhotoUrl?: string;
  goals?: Goal[];
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const profileAPI = {
  get: (userId: string): Promise<UserProfile> =>
    apiCall(`/profile/${userId}`),

  save: (profile: Partial<UserProfile>): Promise<UserProfile> =>
    apiCall('/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),
};

// ==================== FILE MANAGEMENT API ====================

export interface StudyFile {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  career: string;
  category: string;
  hasSummary: boolean;
  hasExtractedTerms: boolean;
  uploadDate: string;
  summary?: string;
}

export const filesAPI = {
  getAll: (userId: string): Promise<StudyFile[]> =>
    apiCall(`/files/${userId}`),

  create: (metadata: Partial<StudyFile>): Promise<StudyFile> =>
    apiCall('/files', {
      method: 'POST',
      body: JSON.stringify(metadata),
    }),

  getDownloadUrl: (fileId: string): Promise<{ url: string; fileName: string }> =>
    apiCall(`/files/${fileId}/download`),

  delete: (fileId: string): Promise<{ success: boolean }> =>
    apiCall(`/files/${fileId}`, {
      method: 'DELETE',
    }),

  upload: async (userId: string, file: File, career: string): Promise<StudyFile> => {
    const storagePath = `${userId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('make-ddf400a0-study-files')
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Error al subir archivo: ${uploadError.message}`);
    }

    return filesAPI.create({
      userId,
      fileName: file.name,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      fileSize: file.size,
      storagePath,
      career,
      category: 'General',
    });
  },
};

// ==================== WORDS OF THE DAY API ====================

export interface WordOfDay {
  term: string;
  definition: string;
}

export const wordsAPI = {
  getToday: (userId: string): Promise<WordOfDay[]> =>
    apiCall(`/words-of-day/${userId}`),

  generate: (userId: string, career: string): Promise<{ terms: WordOfDay[] }> => {
    if (TEST_MODE) {
      return Promise.resolve({
        terms: [
          { term: 'Homeostasis', definition: 'Capacidad del organismo de mantener un equilibrio interno estable.' },
          { term: 'Mitosis', definition: 'Proceso de división celular que produce dos células hijas idénticas.' },
          { term: 'Catálisis', definition: 'Aceleración de una reacción química mediante un catalizador.' },
        ],
      });
    }
    return apiCall('/words-of-day/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, career }),
    });
  },
};

// ==================== RECOMMENDATIONS API ====================

export interface ArticleRecommendation {
  title: string;
  url: string;
  description: string;
  source: string;
}

export const recommendationsAPI = {
  get: (userId: string): Promise<ArticleRecommendation[]> =>
    apiCall(`/recommendations/${userId}`),

  generate: (userId: string, career: string): Promise<{ recommendations: ArticleRecommendation[] }> => {
    if (TEST_MODE) {
      return Promise.resolve({
        recommendations: [
          {
            title: 'Avances en Inteligencia Artificial Médica',
            description: 'Cómo los modelos de IA están transformando el diagnóstico clínico.',
            source: 'Nature Medicine',
            url: '#',
          },
          {
            title: 'Nuevas Técnicas en Biología Molecular',
            description: 'Revisión de los métodos más recientes en edición genética.',
            source: 'Cell Journal',
            url: '#',
          },
        ],
      });
    }
    return apiCall('/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, career }),
    });
  },
};

// ==================== EVALUATIONS API ====================

export interface Evaluation {
  id: string;
  userId: string;
  title: string;
  questions: EvaluationQuestion[];
  sourceFiles: string[];
  career: string;
  createdAt: string;
}

export interface EvaluationQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'open-ended';
  options?: string[];
  correctAnswer?: string | number;
}

export interface EvaluationResult {
  id: string;
  evaluationId: string;
  userId: string;
  answers: Record<string, unknown>;
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    adaptiveInsights: string[];
  };
  completedAt: string;
}

export const evaluationsAPI = {
  create: (evaluation: Partial<Evaluation>): Promise<Evaluation> =>
    apiCall('/evaluations', {
      method: 'POST',
      body: JSON.stringify(evaluation),
    }),

  submitResults: (evaluationId: string, result: Partial<EvaluationResult>): Promise<EvaluationResult> =>
    apiCall(`/evaluations/${evaluationId}/results`, {
      method: 'POST',
      body: JSON.stringify(result),
    }),

  getResults: (userId: string): Promise<EvaluationResult[]> =>
    apiCall(`/results/${userId}`),
};

// ==================== AI API ====================

export const aiAPI = {
  summarize: (content: string, career?: string, fileId?: string): Promise<{ summary: string }> => {
    if (TEST_MODE) {
      return Promise.resolve({
        summary: `# Resumen de prueba\n\nEste es un resumen generado en modo TEST para **${career || 'tu carrera'}**.\n\n## Puntos clave\n\n- Concepto 1: Descripción de prueba\n- Concepto 2: Descripción de prueba\n- Concepto 3: Descripción de prueba\n\n> Cambia TEST_MODE a false en src/utils/api.ts para usar la IA real.`,
      });
    }
    return apiCall('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ content, career, fileId }),
    });
  },

  extractTerms: (content: string, career?: string, count?: number): Promise<{ terms: WordOfDay[] }> => {
    if (TEST_MODE) {
      return Promise.resolve({
        terms: [
          { term: 'Término de prueba 1', definition: 'Definición de ejemplo para testear la UI.' },
          { term: 'Término de prueba 2', definition: 'Otra definición de ejemplo sin consumir créditos.' },
          { term: 'Término de prueba 3', definition: 'Un tercer término para ver cómo se ve la lista.' },
        ],
      });
    }
    return apiCall('/ai/extract-terms', {
      method: 'POST',
      body: JSON.stringify({ content, career, count }),
    });
  },

  getDefinition: (term: string, context?: string, career?: string): Promise<{ term: string; definition: string }> => {
    if (TEST_MODE) {
      return Promise.resolve({
        term,
        definition: `Definición de prueba para "${term}". En modo TEST no se consume ningún crédito de la API.`,
      });
    }
    return apiCall('/ai/define', {
      method: 'POST',
      body: JSON.stringify({ term, context, career }),
    });
  },

  evaluateFlashcard: (
    userAnswer: string,
    correctAnswer: string,
    concept: string,
    career?: string
  ): Promise<{
    status: 'correct' | 'partial' | 'incorrect';
    feedback: string;
    missingPoints?: string[];
    score: number;
  }> => {
    if (TEST_MODE) {
      return Promise.resolve({
        status: 'partial',
        feedback: 'Respuesta de prueba: tu respuesta tiene elementos correctos. Recuerda cambiar TEST_MODE a false para evaluaciones reales.',
        missingPoints: ['Punto de prueba A', 'Punto de prueba B'],
        score: 70,
      });
    }
    return apiCall('/evaluate-flashcard', {
      method: 'POST',
      body: JSON.stringify({ userAnswer, correctAnswer, concept, career }),
    });
  },
};
