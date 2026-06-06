import { Hono } from "npm:hono";
import Anthropic from "npm:@anthropic-ai/sdk";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Anthropic client
function getAnthropicClient() {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }
  return new Anthropic({ apiKey });
}

// Generate words of the day from user's files
export async function generateWordsOfDay(userId: string, career: string) {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Eres un asistente de estudio especializado en ${career || 'educación'}. Genera entre 1 y 5 términos técnicos importantes que un estudiante de ${career} debería aprender hoy. Para cada término, proporciona una definición clara y concisa. Responde SOLO con un JSON array: [{"term": "término", "definition": "definición"}]

Genera términos importantes de estudio para ${career}`,
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
    terms = [];
  }

  const today = new Date().toISOString().split('T')[0];
  await kv.set(`words:${userId}:${today}`, terms);

  return terms;
}

// Generate article recommendations
export async function generateRecommendations(userId: string, career: string) {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Eres un asistente de investigación académica. Recomienda 3-5 artículos o recursos académicos relevantes para estudiantes de ${career}. Incluye título, una breve descripción y la fuente. Responde SOLO con un JSON array: [{"title": "título", "description": "descripción", "source": "fuente", "url": "#"}]

Recomienda artículos académicos actuales para estudiantes de ${career}`,
      },
    ],
  });

  const recsText = message.content[0].type === 'text' ? message.content[0].text : '';
  let recommendations = [];

  try {
    const jsonMatch = recsText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      recommendations = JSON.parse(jsonMatch[0]);
    } else {
      recommendations = JSON.parse(recsText);
    }
  } catch (error) {
    console.error('Failed to parse recommendations JSON:', recsText, error);
    recommendations = [];
  }

  await kv.set(`recommendations:${userId}`, recommendations);

  return recommendations;
}

export { app };
