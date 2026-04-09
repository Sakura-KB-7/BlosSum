import axios from 'axios';

/**
 * Vercel Serverless Function 호출
 * POST /api/newsletter/generate
 */
export async function generateNewsletter(spendingSummary, count = 4) {
  const response = await axios.post('/api/newsletter/generate', {
    spendingSummary,
    count,
  });

  return response.data;
}
