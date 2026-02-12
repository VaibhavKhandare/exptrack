import { pipeline } from '@huggingface/transformers';
import { NextRequest, NextResponse } from 'next/server';
import { EXPENSE_CATEGORIES } from '@/commons';

export const runtime = 'nodejs'; // Required for @huggingface/transformers (ONNX)

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Basic Food': 'grocery supermarket vegetables fruits milk kitchen cooking groceries',
  'Dessert': 'ice cream dessert sweets cake chocolate pastry bakery candy',
  'Friends Travel': 'trip with friends vacation holiday group outing leisure',
  'Hotel Food': 'restaurant cafe dining coffee bar pub fast food mcdonalds dominos',
  'House': 'electricity water gas utilities bill home maintenance household',
  'Invest': 'investment mutual fund SIP stocks FD savings financial',
  'Necessary Travel': 'uber ola taxi cab bus metro commute transport office work',
  'Other': 'miscellaneous other expense',
  'Other Travel': 'flight hotel booking tourism sightseeing travel journey',
  'Rent': 'house rent apartment flat accommodation landlord monthly rent',
  'Savings': 'savings account deposit transfer',
  'TFG': 'gift flowers romantic date surprise',
  'Zomato Food': 'food delivery order Zomato Swiggy restaurant meal',
};

let extractor: ((texts: string | string[], opts?: object) => Promise<{ tolist(): number[][] }>) | null = null;

async function getExtractor() {
  if (!extractor) {
    extractor = (await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'fp32' })) as unknown as typeof extractor;
  }
  return extractor!;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
}

async function classifyWithTransformer(text: string) {
  const pipe = await getExtractor();
  const labels = EXPENSE_CATEGORIES.filter((c) => c !== 'Other');
  const texts = [text, ...labels.map((l) => CATEGORY_DESCRIPTIONS[l] || l)];

  const output = await pipe(texts, { pooling: 'mean', normalize: true }) as { tolist?: () => number[][] };
  const embeddings = output.tolist?.() ?? output as unknown as number[][];
  const smsEmbedding = embeddings[0] as number[];
  let bestCategory = 'Other';
  let bestScore = 0;

  for (let i = 0; i < labels.length; i++) {
    const score = cosineSimilarity(smsEmbedding, embeddings[i + 1] as number[]);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = labels[i];
    }
  }
  return { category: bestCategory, confidence: Math.min(1, bestScore), method: 'sentence_transformer' as const };
}

function extractAmount(message: string): number {
  const patterns = [
    /(?:rs\.?|₹|inr)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs\.?|₹|inr)/gi,
    /(?:paid|amount|cost|price|total)\s*(?:of|is|was)?\s*(?:rs\.?|₹)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
    /debited\s*(?:with|for)?\s*(?:rs\.?|₹)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const numStr = match[1] || match[0];
      const cleanNum = numStr.replace(/[^\d.]/g, '');
      const amount = parseFloat(cleanNum);
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return 0;
}

function extractDescription(message: string): string {
  let description = message
    .replace(/^(SMS:|Alert:|Transaction:|Payment:)/gi, '')
    .replace(/\b(rs\.?|₹|inr)\s*\d+(?:,\d{3})*(?:\.\d{2})?\b/gi, '')
    .replace(/\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:rs\.?|₹|inr)\b/gi, '')
    .replace(/\b(?:debited|credited|paid|amount|cost|price|total)\b/gi, '')
    .replace(/\b(?:from|to|at|on)\s+\d{2}\/\d{2}\/\d{4}/gi, '')
    .replace(/\b\d{4}XX\d{4}\b/gi, '')
    .replace(/\b[A-Z]{3}\d{11}\b/gi, '')
    .trim();
  const merchantPatterns = [
    /(?:at|to|from)\s+([A-Za-z\s]+?)(?:\s+(?:on|at|\d))/gi,
    /(?:zomato|swiggy|uber|ola|paytm)\s*([A-Za-z\s]*)/gi,
  ];
  for (const pattern of merchantPatterns) {
    const match = description.match(pattern);
    if (match?.[1]) return match[1].trim().substring(0, 100);
  }
  return description.substring(0, 100) || 'SMS expense';
}

export async function POST(request: NextRequest) {
  try {
    const { message, smsBody } = await request.json();
    const textToClassify = message || smsBody;
    if (!textToClassify) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    const amount = extractAmount(textToClassify);
    const description = extractDescription(textToClassify);
    let classification;

    try {
      classification = await classifyWithTransformer(textToClassify);
    } catch (err) {
      console.error('Sentence transformer failed, using rules fallback:', err);
      classification = ruleFallback(textToClassify);
    }

    return NextResponse.json({
      success: true,
      data: {
        amount,
        description,
        category: classification.category,
        confidence: classification.confidence,
        method: classification.method,
        originalMessage: textToClassify,
      },
    });
  } catch (error) {
    console.error('SMS Classification Error:', error);
    return NextResponse.json(
      { error: 'Classification failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

function ruleFallback(message: string) {
  const rules = [
    { pattern: /zomato|swiggy/i, category: 'Zomato Food', confidence: 0.8 },
    { pattern: /uber|ola|taxi/i, category: 'Necessary Travel', confidence: 0.8 },
    { pattern: /rent/i, category: 'Rent', confidence: 0.9 },
    { pattern: /restaurant|hotel.*food|dominos|mcdonald/i, category: 'Hotel Food', confidence: 0.7 },
    { pattern: /grocery|supermarket/i, category: 'Basic Food', confidence: 0.7 },
    { pattern: /dessert|ice.*cream/i, category: 'Dessert', confidence: 0.7 },
    { pattern: /investment|mutual.*fund|sip/i, category: 'Invest', confidence: 0.8 },
    { pattern: /electricity|water.*bill|utility/i, category: 'House', confidence: 0.7 },
  ];
  for (const { pattern, category, confidence } of rules) {
    if (pattern.test(message)) return { category, confidence, method: 'rules_fallback' as const };
  }
  return { category: 'Other' as const, confidence: 0.3, method: 'rules_fallback' as const };
}

export async function GET() {
  return NextResponse.json({
    status: 'SMS Classification API is running',
    method: 'Sentence Transformer (all-MiniLM-L6-v2)',
    categories: EXPENSE_CATEGORIES,
  });
}
