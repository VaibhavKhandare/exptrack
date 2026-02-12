import { NextRequest, NextResponse } from 'next/server';
import { EXPENSE_CATEGORIES } from '@/commons';

// Smart rule-based classification patterns
const CLASSIFICATION_PATTERNS = {
  'Zomato Food': {
    keywords: ['zomato', 'swiggy', 'foodpanda', 'ubereats', 'food delivery', 'restaurant', 'meal', 'lunch', 'dinner', 'breakfast'],
    patterns: [
      /zomato/i, /swiggy/i, /food.*delivery/i, /restaurant.*payment/i, 
      /meal.*order/i, /online.*food/i, /delivery.*food/i
    ],
    weight: 0.9
  },
  'Necessary Travel': {
    keywords: ['uber', 'ola', 'taxi', 'auto', 'cab', 'bus', 'metro', 'train', 'transport', 'commute', 'office', 'work'],
    patterns: [
      /uber/i, /ola/i, /taxi/i, /auto.*ride/i, /cab.*fare/i, 
      /metro.*card/i, /bus.*ticket/i, /transport/i, /travel.*work/i, /office.*trip/i
    ],
    weight: 0.85
  },
  'Hotel Food': {
    keywords: ['hotel', 'restaurant', 'cafe', 'coffee', 'dining', 'bar', 'pub', 'fast food', 'kfc', 'mcdonalds', 'dominos'],
    patterns: [
      /hotel.*dining/i, /restaurant/i, /cafe/i, /coffee.*shop/i, 
      /dining.*out/i, /fast.*food/i, /kfc/i, /mcdonalds/i, /dominos/i
    ],
    weight: 0.8
  },
  'Basic Food': {
    keywords: ['grocery', 'supermarket', 'vegetables', 'fruits', 'milk', 'bread', 'rice', 'dal', 'kitchen', 'cooking', 'ingredients'],
    patterns: [
      /grocery/i, /supermarket/i, /vegetable/i, /fruits/i, /kitchen.*items/i,
      /cooking.*ingredients/i, /home.*supplies/i, /food.*shopping/i
    ],
    weight: 0.75
  },
  'Rent': {
    keywords: ['rent', 'house rent', 'apartment', 'flat', 'accommodation', 'landlord'],
    patterns: [
      /monthly.*rent/i, /house.*rent/i, /apartment.*rent/i, /accommodation/i,
      /landlord/i, /rent.*payment/i, /rental/i
    ],
    weight: 0.95
  },
  'House': {
    keywords: ['electricity', 'water', 'gas', 'utilities', 'maintenance', 'family', 'home', 'household'],
    patterns: [
      /electricity.*bill/i, /water.*bill/i, /gas.*bill/i, /utility.*payment/i,
      /home.*maintenance/i, /household.*expenses/i, /family.*expenses/i
    ],
    weight: 0.8
  },
  'Dessert': {
    keywords: ['ice cream', 'dessert', 'sweet', 'cake', 'chocolate', 'pastry', 'bakery', 'candy'],
    patterns: [
      /ice.*cream/i, /dessert/i, /sweet.*shop/i, /cake/i, /chocolate/i,
      /pastry/i, /bakery/i, /candy/i, /mithai/i
    ],
    weight: 0.85
  },
  'Friends Travel': {
    keywords: ['friends', 'trip', 'vacation', 'holiday', 'outing', 'group', 'leisure', 'fun', 'weekend'],
    patterns: [
      /friends.*trip/i, /group.*travel/i, /vacation/i, /holiday.*trip/i,
      /weekend.*outing/i, /leisure.*travel/i, /fun.*trip/i
    ],
    weight: 0.8
  },
  'Other Travel': {
    keywords: ['flight', 'hotel booking', 'tourism', 'sightseeing', 'travel booking', 'journey'],
    patterns: [
      /flight.*booking/i, /hotel.*booking/i, /travel.*booking/i, /tourism/i,
      /sightseeing/i, /journey/i, /trip.*booking/i
    ],
    weight: 0.75
  },
  'Invest': {
    keywords: ['investment', 'mutual fund', 'sip', 'stocks', 'fd', 'savings', 'bank', 'finance'],
    patterns: [
      /investment/i, /mutual.*fund/i, /sip.*payment/i, /stock.*purchase/i,
      /fd.*deposit/i, /savings.*account/i, /financial.*planning/i
    ],
    weight: 0.9
  },
  'TFG': {
    keywords: ['girlfriend', 'boyfriend', 'date', 'gift', 'flowers', 'surprise', 'love', 'romantic'],
    patterns: [
      /gift.*purchase/i, /flower.*delivery/i, /romantic.*dinner/i, /date.*expense/i,
      /surprise.*gift/i, /love.*gift/i, /valentine/i
    ],
    weight: 0.85
  }
} as const;

// Smart keyword-based classification
function calculateCategoryScore(message: string, category: keyof typeof CLASSIFICATION_PATTERNS): number {
  const patterns = CLASSIFICATION_PATTERNS[category];
  const lowerMessage = message.toLowerCase();
  let score = 0;
  let matches = 0;

  // Check keyword matches
  for (const keyword of patterns.keywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      score += 1;
      matches++;
    }
  }

  // Check regex patterns with higher weight
  for (const pattern of patterns.patterns) {
    if (pattern.test(message)) {
      score += 2; // Regex matches get higher score
      matches++;
    }
  }

  // Apply category weight and normalize
  if (matches > 0) {
    score = (score * patterns.weight) / Math.max(1, Math.log(lowerMessage.length / 10));
    return Math.min(1, score / 3); // Normalize to 0-1
  }

  return 0;
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
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  return 0;
}

function extractDescription(message: string): string {
  // Remove common SMS prefixes/suffixes
  let description = message
    .replace(/^(SMS:|Alert:|Transaction:|Payment:)/gi, '')
    .replace(/\b(rs\.?|₹|inr)\s*\d+(?:,\d{3})*(?:\.\d{2})?\b/gi, '')
    .replace(/\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:rs\.?|₹|inr)\b/gi, '')
    .replace(/\b(?:debited|credited|paid|amount|cost|price|total)\b/gi, '')
    .replace(/\b(?:from|to|at|on)\s+\d{2}\/\d{2}\/\d{4}/gi, '')
    .replace(/\b\d{4}XX\d{4}\b/gi, '') // Card numbers
    .replace(/\b[A-Z]{3}\d{11}\b/gi, '') // Transaction IDs
    .trim();

  // Extract merchant/vendor name
  const merchantPatterns = [
    /(?:at|to|from)\s+([A-Za-z\s]+?)(?:\s+(?:on|at|\d))/gi,
    /(?:zomato|swiggy|uber|ola|paytm)\s*([A-Za-z\s]*)/gi,
  ];

  for (const pattern of merchantPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      description = match[1].trim();
      break;
    }
  }

  return description.substring(0, 100) || 'SMS expense';
}

function classifyExpense(message: string) {
  console.log('Classifying message:', message.substring(0, 100) + '...');
  
  // Calculate scores for all categories
  const scores: Array<{ category: string; score: number }> = [];
  
  for (const [category] of Object.entries(CLASSIFICATION_PATTERNS)) {
    const score = calculateCategoryScore(message, category as keyof typeof CLASSIFICATION_PATTERNS);
    if (score > 0) {
      scores.push({ category, score });
    }
  }
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // Get best match
  const bestMatch = scores[0];
  
  if (bestMatch && bestMatch.score > 0.1) {
    console.log(`Best match: ${bestMatch.category} (${bestMatch.score.toFixed(3)})`);
    return {
      category: bestMatch.category as typeof EXPENSE_CATEGORIES[number],
      confidence: bestMatch.score,
      method: 'smart_rules',
      allScores: scores.slice(0, 3) // Top 3 matches for debugging
    };
  }
  
  // Fallback to basic rule matching
  console.log('No strong pattern match, using basic rules');
  const basicResult = basicRuleClassification(message);
  return {
    ...basicResult,
    allScores: scores.slice(0, 3)
  };
}

function basicRuleClassification(message: string) {
  const basicRules = [
    { pattern: /zomato|swiggy/i, category: 'Zomato Food', confidence: 0.8 },
    { pattern: /uber|ola|taxi/i, category: 'Necessary Travel', confidence: 0.8 },
    { pattern: /rent/i, category: 'Rent', confidence: 0.9 },
    { pattern: /restaurant|hotel.*food/i, category: 'Hotel Food', confidence: 0.7 },
    { pattern: /grocery|supermarket/i, category: 'Basic Food', confidence: 0.7 },
    { pattern: /dessert|ice.*cream/i, category: 'Dessert', confidence: 0.7 },
    { pattern: /investment|mutual.*fund/i, category: 'Invest', confidence: 0.8 },
    { pattern: /electricity|water.*bill|utility/i, category: 'House', confidence: 0.7 }
  ];

  for (const rule of basicRules) {
    if (rule.pattern.test(message)) {
      return {
        category: rule.category as typeof EXPENSE_CATEGORIES[number],
        confidence: rule.confidence,
        method: 'basic_rules'
      };
    }
  }
  
  return {
    category: 'Other' as typeof EXPENSE_CATEGORIES[number],
    confidence: 0.3,
    method: 'default'
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, smsBody } = await request.json();
    
    if (!message && !smsBody) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }
    
    const textToClassify = message || smsBody;
    
    // Extract components
    const amount = extractAmount(textToClassify);
    const description = extractDescription(textToClassify);
    
    // Classify category
    const classification = classifyExpense(textToClassify);
    
    return NextResponse.json({
      success: true,
      data: {
        amount,
        description,
        category: classification.category,
        confidence: classification.confidence,
        method: classification.method,
        originalMessage: textToClassify,
        debug: {
          allScores: classification.allScores || []
        }
      }
    });
    
  } catch (error) {
    console.error('SMS Classification Error:', error);
    return NextResponse.json(
      { error: 'Classification failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'SMS Classification API is running',
    method: 'Smart Rule-based Classification',
    categories: Object.keys(CLASSIFICATION_PATTERNS),
    totalPatterns: Object.values(CLASSIFICATION_PATTERNS).reduce(
      (sum, pattern) => sum + pattern.keywords.length + pattern.patterns.length, 
      0
    )
  });
}