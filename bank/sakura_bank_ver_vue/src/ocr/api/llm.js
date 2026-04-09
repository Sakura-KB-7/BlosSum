import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

export const getRecommendedCategory = async (fullText, categories) => {
  if (!fullText || !categories || categories.length === 0) return null;

  const categoryOptions = categories
    .map((c) => `${c.id}(${c.name})`)
    .join(', ');

  const cleanText = fullText.replace(/["']/g, '').substring(0, 1500);

  // OpenAI 규격에 맞춘 Payload
  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `당신은 가계부 분류 전문가입니다. 영수증 텍스트를 분석하여 가장 적합한 카테고리 ID 숫자 하나만 응답하세요.
        [분류 가이드]
        1. 상호명 뒤에 '원', '당', '가' 등이 붙어도 식당인 경우가 많습니다 (예: 세종원, 성심당, 신선설농탕 -> '식비').
        2. 업종이 불분명할 경우, 메뉴명(짜장면, 탕수육 등)이나 단가, 부가세 정보를 참고하세요.
        3. 교육 관련 카테고리는 실제 '학원', '학교', '교재' 등의 키워드가 확실할 때만 선택하세요.
        
        [답변 규칙]
        - 답변은 오직 숫자(ID) 하나만 합니다.
        - 목록에 없는 ID는 절대 사용하지 마세요.`,
      },
      {
        role: 'user',
        content: `카테고리 목록: ${categoryOptions}\n\n영수증 텍스트: ${cleanText}`,
      },
    ],
    temperature: 0, // 0에 가까울수록 규칙 엄격하게 따름
    max_tokens: 10,
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });

    // 응답 추출
    // - OpenAI 구조: choices[0].message.content
    const rawText = response.data.choices[0].message.content.trim();
    const match = rawText.match(/\d+/);
    const finalId = match ? parseInt(match[0], 10) : null;

    // 실제 db.json 파일에 존재하는 category id 인지 확인
    return categories.some((c) => c.id === finalId) ? finalId : null;
  } catch (error) {
    console.error(
      'OpenAI API 에러 발생:',
      error.response?.data || error.message,
    );
    return null;
  }
};
