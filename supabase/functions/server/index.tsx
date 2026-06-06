import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import Anthropic from "npm:@anthropic-ai/sdk";
import * as kv from "./kv_store.tsx";
import { generateWordsOfDay, generateRecommendations } from "./ai_helpers.tsx";

const app = new Hono();

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Initialize Anthropic client
function getAnthropicClient() {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }
  return new Anthropic({ apiKey });
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage buckets on startup
const initializeStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const studyFilesBucket = 'make-ddf400a0-study-files';
    const bucketExists = buckets?.some(bucket => bucket.name === studyFilesBucket);

    if (!bucketExists) {
      await supabase.storage.createBucket(studyFilesBucket, { public: false });
      console.log(`Created private bucket: ${studyFilesBucket}`);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

initializeStorage();

// Health check endpoint
app.get("/make-server-ddf400a0/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== USER PROFILE ROUTES ====================

app.get("/make-server-ddf400a0/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const profile = await kv.get(`profile:${userId}`);

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

app.post("/make-server-ddf400a0/profile", async (c) => {
  try {
    const body = await c.req.json();
    const {
      userId,
      career,
      firstName,
      lastName,
      age,
      university,
      weeklyStudyHours,
      profilePhotoUrl,
      goals,
      preferences
    } = body;

    if (!userId || !career) {
      return c.json({ error: 'userId and career are required' }, 400);
    }

    // Get existing profile to preserve createdAt
    const existingProfile = await kv.get(`profile:${userId}`);

    const profile = {
      userId,
      career,
      firstName: firstName || '',
      lastName: lastName || '',
      age: age || undefined,
      university: university || '',
      weeklyStudyHours: weeklyStudyHours || undefined,
      profilePhotoUrl: profilePhotoUrl || '',
      goals: goals || [],
      preferences: preferences || {},
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`profile:${userId}`, profile);
    return c.json(profile);
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    return c.json({ error: 'Failed to save profile' }, 500);
  }
});

// ==================== FILE MANAGEMENT ROUTES ====================

app.post("/make-server-ddf400a0/files", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, fileName, fileType, fileSize, storagePath, career, category } = body;

    if (!userId || !fileName || !storagePath) {
      return c.json({ error: 'userId, fileName, and storagePath are required' }, 400);
    }

    const fileId = crypto.randomUUID();
    const fileMetadata = {
      id: fileId,
      userId,
      fileName,
      fileType: fileType || 'unknown',
      fileSize: fileSize || 0,
      storagePath,
      career: career || '',
      category: category || 'General',
      hasSummary: false,
      hasExtractedTerms: false,
      uploadDate: new Date().toISOString(),
    };

    await kv.set(`file:${fileId}`, fileMetadata);

    const userFiles = await kv.get(`user:${userId}:files`) || [];
    userFiles.push(fileId);
    await kv.set(`user:${userId}:files`, userFiles);

    return c.json(fileMetadata);
  } catch (error) {
    console.error('Error uploading file metadata:', error);
    return c.json({ error: 'Failed to upload file metadata' }, 500);
  }
});

app.get("/make-server-ddf400a0/files/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const fileIds = await kv.get(`user:${userId}:files`) || [];

    const files = await Promise.all(
      fileIds.map(async (id: string) => await kv.get(`file:${id}`))
    );

    return c.json(files.filter(Boolean));
  } catch (error) {
    console.error('Error getting files:', error);
    return c.json({ error: 'Failed to get files' }, 500);
  }
});

app.get("/make-server-ddf400a0/files/:fileId/download", async (c) => {
  try {
    const fileId = c.req.param('fileId');
    const file = await kv.get(`file:${fileId}`);

    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }

    const { data, error } = await supabase.storage
      .from('make-ddf400a0-study-files')
      .createSignedUrl(file.storagePath, 3600);

    if (error) {
      console.error('Error creating signed URL:', error);
      return c.json({ error: 'Failed to create download URL' }, 500);
    }

    return c.json({ url: data.signedUrl, fileName: file.fileName });
  } catch (error) {
    console.error('Error getting download URL:', error);
    return c.json({ error: 'Failed to get download URL' }, 500);
  }
});

app.delete("/make-server-ddf400a0/files/:fileId", async (c) => {
  try {
    const fileId = c.req.param('fileId');
    const file = await kv.get(`file:${fileId}`);

    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }

    await supabase.storage
      .from('make-ddf400a0-study-files')
      .remove([file.storagePath]);

    const userFiles = await kv.get(`user:${file.userId}:files`) || [];
    const updatedFiles = userFiles.filter((id: string) => id !== fileId);
    await kv.set(`user:${file.userId}:files`, updatedFiles);

    await kv.del(`file:${fileId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// ==================== WORDS OF THE DAY ROUTES ====================

app.get("/make-server-ddf400a0/words-of-day/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const today = new Date().toISOString().split('T')[0];
    const words = await kv.get(`words:${userId}:${today}`);

    return c.json(words || []);
  } catch (error) {
    console.error('Error getting words of day:', error);
    return c.json({ error: 'Failed to get words' }, 500);
  }
});

app.post("/make-server-ddf400a0/words-of-day/generate", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, career } = body;

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const terms = await generateWordsOfDay(userId, career);
    return c.json({ terms });
  } catch (error) {
    console.error('Error generating words of day:', error);
    return c.json({ error: 'Failed to generate words' }, 500);
  }
});

// ==================== RECOMMENDATIONS ROUTES ====================

app.get("/make-server-ddf400a0/recommendations/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const recommendations = await kv.get(`recommendations:${userId}`);

    return c.json(recommendations || []);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return c.json({ error: 'Failed to get recommendations' }, 500);
  }
});

app.post("/make-server-ddf400a0/recommendations/generate", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, career } = body;

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const recommendations = await generateRecommendations(userId, career);
    return c.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return c.json({ error: 'Failed to generate recommendations' }, 500);
  }
});

// ==================== EVALUATION ROUTES ====================

app.post("/make-server-ddf400a0/evaluations", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, title, questions, sourceFiles, career } = body;

    if (!userId || !questions) {
      return c.json({ error: 'userId and questions are required' }, 400);
    }

    const evaluationId = crypto.randomUUID();
    const evaluation = {
      id: evaluationId,
      userId,
      title: title || 'Evaluación sin título',
      questions,
      sourceFiles: sourceFiles || [],
      career: career || '',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`evaluation:${evaluationId}`, evaluation);

    const userEvals = await kv.get(`user:${userId}:evaluations`) || [];
    userEvals.push(evaluationId);
    await kv.set(`user:${userId}:evaluations`, userEvals);

    return c.json(evaluation);
  } catch (error) {
    console.error('Error creating evaluation:', error);
    return c.json({ error: 'Failed to create evaluation' }, 500);
  }
});

app.post("/make-server-ddf400a0/evaluations/:evaluationId/results", async (c) => {
  try {
    const evaluationId = c.req.param('evaluationId');
    const body = await c.req.json();
    const { userId, answers, score, feedback } = body;

    if (!userId || !answers) {
      return c.json({ error: 'userId and answers are required' }, 400);
    }

    const resultId = crypto.randomUUID();
    const result = {
      id: resultId,
      evaluationId,
      userId,
      answers,
      score: score || 0,
      feedback: feedback || {},
      completedAt: new Date().toISOString(),
    };

    await kv.set(`result:${resultId}`, result);

    const userResults = await kv.get(`user:${userId}:results`) || [];
    userResults.push(resultId);
    await kv.set(`user:${userId}:results`, userResults);

    return c.json(result);
  } catch (error) {
    console.error('Error submitting evaluation results:', error);
    return c.json({ error: 'Failed to submit results' }, 500);
  }
});

app.get("/make-server-ddf400a0/results/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const resultIds = await kv.get(`user:${userId}:results`) || [];

    const results = await Promise.all(
      resultIds.map(async (id: string) => await kv.get(`result:${id}`))
    );

    return c.json(results.filter(Boolean));
  } catch (error) {
    console.error('Error getting results:', error);
    return c.json({ error: 'Failed to get results' }, 500);
  }
});

// ==================== AI INTEGRATION ROUTES ====================

app.post("/make-server-ddf400a0/ai/summarize", async (c) => {
  try {
    const body = await c.req.json();
    const { fileId, content, career } = body;

    if (!content) {
      return c.json({ error: 'content is required' }, 400);
    }

    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Eres un asistente de estudio especializado en ${career || 'educación general'}. Resume el siguiente texto de manera clara y concisa, enfocándote en los conceptos clave que un estudiante debe aprender.

Resume este material de estudio:

${content.slice(0, 15000)}`,
        },
      ],
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text : '';

    if (fileId) {
      const file = await kv.get(`file:${fileId}`);
      if (file) {
        file.hasSummary = true;
        file.summary = summary;
        await kv.set(`file:${fileId}`, file);
      }
    }

    return c.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return c.json({ error: 'Failed to generate summary' }, 500);
  }
});

app.post("/make-server-ddf400a0/ai/extract-terms", async (c) => {
  try {
    const body = await c.req.json();
    const { content, career, count } = body;

    if (!content) {
      return c.json({ error: 'content is required' }, 400);
    }

    const anthropic = getAnthropicClient();
    const termCount = count || 5;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Eres un asistente de estudio especializado en ${career || 'educación general'}. Extrae los ${termCount} términos técnicos más importantes del texto y proporciona una definición clara y concisa de cada uno en el contexto de ${career || 'la materia'}. Responde SOLO con un JSON array de objetos con formato: [{"term": "término", "definition": "definición"}]

${content.slice(0, 15000)}`,
        },
      ],
    });

    const termsText = message.content[0].type === 'text' ? message.content[0].text : '';
    let terms = [];

    try {
      const jsonMatch = termsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        terms = JSON.parse(jsonMatch[0]);
      } else {
        terms = JSON.parse(termsText);
      }
    } catch (error) {
      console.error('Failed to parse terms JSON:', termsText, error);
    }

    return c.json({ terms });
  } catch (error) {
    console.error('Error extracting terms:', error);
    return c.json({ error: 'Failed to extract terms' }, 500);
  }
});

app.post("/make-server-ddf400a0/ai/define", async (c) => {
  try {
    const body = await c.req.json();
    const { term, context, career } = body;

    if (!term) {
      return c.json({ error: 'term is required' }, 400);
    }

    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Eres un asistente de estudio especializado en ${career || 'educación general'}. Define términos de manera clara y simple para estudiantes, usando el contexto proporcionado para dar la definición más relevante.

Define el término "${term}" en el contexto de ${career || 'esta materia'}.

Contexto del texto: ${context?.slice(0, 500) || 'No hay contexto adicional'}`,
        },
      ],
    });

    const definition = message.content[0].type === 'text' ? message.content[0].text : '';

    return c.json({ term, definition });
  } catch (error) {
    console.error('Error getting definition:', error);
    return c.json({ error: 'Failed to get definition' }, 500);
  }
});

// ==================== FLASHCARD EVALUATION ROUTE ====================

// Evaluate flashcard answer with AI
app.post("/make-server-ddf400a0/evaluate-flashcard", async (c) => {
  try {
    const body = await c.req.json();
    const { userAnswer, correctAnswer, concept, career } = body;

    if (!userAnswer || !correctAnswer || !concept) {
      return c.json({ error: 'userAnswer, correctAnswer, and concept are required' }, 400);
    }

    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Eres un evaluador educativo especializado en ${career || 'educación general'}. Tu tarea es comparar la respuesta del estudiante con la respuesta correcta y proporcionar feedback constructivo.

Debes responder SOLO con un JSON con este formato exacto:
{
  "status": "correct" | "partial" | "incorrect",
  "feedback": "mensaje de feedback específico y alentador",
  "missingPoints": ["punto 1", "punto 2"] (solo si es parcial o incorrect),
  "score": número del 0 al 100
}

Criterios:
- "correct" (score 90-100): La respuesta captura la esencia correcta, aunque use palabras diferentes
- "partial" (score 50-89): La respuesta tiene elementos correctos pero le faltan puntos clave importantes
- "incorrect" (score 0-49): La respuesta es incorrecta, incompleta o no relacionada

Concepto: ${concept}

Respuesta correcta: ${correctAnswer}

Respuesta del estudiante: ${userAnswer}

Evalúa la respuesta del estudiante.`,
        },
      ],
    });

    const evaluationText = message.content[0].type === 'text' ? message.content[0].text : '';
    let evaluation;

    try {
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        evaluation = JSON.parse(evaluationText);
      }
    } catch (error) {
      console.error('Failed to parse evaluation JSON:', evaluationText, error);
      return c.json({ error: 'Failed to parse evaluation' }, 500);
    }

    return c.json(evaluation);
  } catch (error) {
    console.error('Error evaluating flashcard:', error);
    return c.json({ error: 'Failed to evaluate flashcard' }, 500);
  }
});

Deno.serve(app.fetch);
