const CARD_SCHEMA = {
  name: 'newsletter_cards',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      cards: {
        type: 'array',
        minItems: 1,
        maxItems: 6,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            cardType: { type: 'string', enum: ['saving', 'support', 'income'] },
            title: { type: 'string' },
            summary: { type: 'string' },
            reason: { type: 'string' },
            actionTip: { type: 'string' },
            sourceTitle: { type: 'string' },
            sourceUrl: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            confidenceScore: { type: 'number' },
          },
          required: [
            'cardType',
            'title',
            'summary',
            'reason',
            'actionTip',
            'sourceTitle',
            'sourceUrl',
            'tags',
            'confidenceScore',
          ],
        },
      },
    },
    required: ['cards'],
  },
};

const SIGNAL_DESCRIPTIONS_KO = {
  weekly_spend_rising: '최근 7일 지출 합이 그 전 주보다 크게 늘어난 편',
  high_food_spending: '이번 주 지출에서 식비·외식 비중이 두드러짐',
  transport_cost_rising: '교통비 관련 지출이 상대적으로 큼',
  stable_spending_pattern: '최근 지출이 비교적 안정적인 편',
  budget_pressure_high: '이번 달 누적 지출이 월 예산 대비 부담이 큼',
  single_category_heavy: '특정 카테고리에 지출이 한곳으로 몰림',
  recent_activity_started: '최근에 거래 기록이 새로 쌓이기 시작함',
};

function signalsToKoreanSummary(signals) {
  const list = Array.isArray(signals) ? signals : [];
  if (list.length === 0) return '특이 패턴 없음';
  return list
    .map((s) => SIGNAL_DESCRIPTIONS_KO[s] || s)
    .filter(Boolean)
    .join(' · ');
}

function buildPrompt({ totalExpense, topCategories, signals, budget }, count) {
  const today = new Date().toISOString().slice(0, 10);
  const signalSummaryKo = signalsToKoreanSummary(signals);
  return [
    '당신은 개인 가계부 AI 소식지 작성자입니다.',
    '사용자 소비 데이터를 기반으로 실천 가능한 카드뉴스를 작성하세요.',
    '반드시 웹 검색 결과를 참고해 최신 정보를 반영하세요.',
    '',
    '[사용자 소비 요약]',
    `- 총 지출: ${Number(totalExpense || 0).toLocaleString('ko-KR')}원`,
    `- 상위 카테고리: ${(topCategories || []).join(', ') || '데이터 없음'}`,
    `- 소비 패턴(한글 요약, 아래 문장만 참고하고 영문 코드는 사용 금지): ${signalSummaryKo}`,
    `- 월 예산: ${Number(budget || 0).toLocaleString('ko-KR')}원`,
    `- 기준 날짜: ${today}`,
    '',
    `[작성 규칙]`,
    `1) 정확히 ${count}개의 카드 작성`,
    '2) 과장 금지, 실용적 문장 사용',
    '3) 각 카드의 actionTip은 오늘 바로 할 수 있는 행동으로 작성',
    '4) 카드끼리 제목·요약·이유 문장 구조가 겹치지 않게 다르게 작성(같은 문장 틀 반복 금지)',
    '5) 한국어로 작성',
    '6) summary, reason, actionTip에 weekly_spend_rising 같은 영문 코드나 스네이크케이스 키를 절대 넣지 말 것',
    '7) 각 카드에 실제 참고 출처를 sourceTitle/sourceUrl로 제공',
    '8) sourceUrl은 유효한 http/https URL만 사용, 모르면 빈 문자열("")',
    '9) 2025년 이후(가능하면 최근 6개월 내) 정보만 사용',
    '10) 종료/만료/폐지된 혜택은 제외',
    '11) 카드 내용과 출처가 직접적으로 연결되어야 함(카드 핵심 키워드가 출처 제목에 포함되도록 우선)',
    '12) 출처는 구체 페이지를 사용하고 메인 홈페이지/검색결과 페이지는 지양',
    '13) reason은 2~3문장으로, 위 한글 소비 패턴 요약 중 이 카드와 맞는 한 가지 관점만 짚어 설명(모든 카드가 같은 추세 문장을 복붙하지 말 것)',
    '',
    '[검색 우선순위]',
    '- 정부 지원/정책: 정부 공식 사이트, 지자체 공식 사이트',
    '- 할인/행사: 편의점 공식 채널, 카드사/은행 공식 사이트',
    '- 금융 혜택: 은행/카드사/공공기관 공식 페이지',
  ].join('\n');
}

function readOutputText(responseData) {
  if (typeof responseData?.output_text === 'string' && responseData.output_text.trim()) {
    return responseData.output_text;
  }

  const output = Array.isArray(responseData?.output) ? responseData.output : [];
  const textParts = [];
  for (const item of output) {
    const contents = Array.isArray(item?.content) ? item.content : [];
    for (const content of contents) {
      if (content?.type === 'output_text' && typeof content?.text === 'string') {
        textParts.push(content.text);
      }
      if (content?.type === 'text' && typeof content?.text === 'string') {
        textParts.push(content.text);
      }
    }
  }
  return textParts.join('\n').trim();
}

function normalizeCards(cards) {
  if (!Array.isArray(cards)) return [];
  return cards.map((card, idx) => ({
    cardType: card?.cardType || 'saving',
    title: card?.title || `맞춤 카드 ${idx + 1}`,
    summary: card?.summary || '요약 정보가 비어 있습니다.',
    reason: card?.reason || '소비 신호와 연관된 항목을 기반으로 작성되었습니다.',
    actionTip: card?.actionTip || '이번 주에 바로 실행할 수 있는 작은 행동부터 시작해보세요.',
    sourceTitle: card?.sourceTitle || '검색 출처',
    sourceUrl: typeof card?.sourceUrl === 'string' ? card.sourceUrl : '',
    tags: Array.isArray(card?.tags) ? card.tags : [],
    confidenceScore: Number(card?.confidenceScore || 0.7),
  }));
}

const TRUSTED_HOST_HINTS = ['go.kr', 'or.kr', 'bank', 'card', 'pay', 'korea.kr', 'gov'];

const SIGNAL_KEYWORDS = {
  weekly_spend_rising: ['절약', '할인', '혜택', '지원'],
  high_food_spending: ['식비', '외식', '편의점', '마트', '배달', '푸드'],
  transport_cost_rising: ['교통', '대중교통', '지하철', '버스', '주유'],
  stable_spending_pattern: ['저축', '자산', '관리'],
  budget_pressure_high: ['예산', '절약', '한도', '통제'],
  single_category_heavy: ['비중', '집중', '관리', '조정'],
  recent_activity_started: ['시작', '기록', '습관'],
};

const CARD_TYPE_KEYWORDS = {
  saving: ['절약', '할인', '쿠폰', '1+1', '행사'],
  support: ['지원금', '지원', '정책', '복지', '신청'],
  income: ['수입', '부업', '리워드', '캐시백', '포인트'],
};

function isHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function tokenize(text) {
  if (typeof text !== 'string') return [];
  const normalized = text.toLowerCase();
  const tokens = normalized.match(/[a-z0-9가-힣+]+/g) || [];
  return tokens.filter((t) => t.length >= 2);
}

function extractYears(text) {
  if (typeof text !== 'string') return [];
  const years = text.match(/20\d{2}/g) || [];
  return years.map((y) => Number(y)).filter((y) => Number.isFinite(y));
}

function buildCardKeywords(card, spendingSummary) {
  const set = new Set();
  for (const token of tokenize([card.title, card.summary, card.reason, card.actionTip].join(' '))) {
    set.add(token);
  }

  if (Array.isArray(card.tags)) {
    for (const tag of card.tags) {
      for (const token of tokenize(String(tag).replace(/^#/, ''))) set.add(token);
    }
  }

  for (const kw of CARD_TYPE_KEYWORDS[card.cardType] || []) set.add(kw.toLowerCase());

  for (const signal of spendingSummary?.signals || []) {
    for (const kw of SIGNAL_KEYWORDS[signal] || []) set.add(kw.toLowerCase());
  }

  for (const cat of spendingSummary?.topCategories || []) {
    for (const token of tokenize(cat)) set.add(token);
  }

  return set;
}

function sourceScore(card, source, spendingSummary) {
  const sourceText = [source.sourceTitle || '', source.sourceUrl || ''].join(' ');
  const sourceTokens = new Set(tokenize(sourceText));
  const cardTokens = buildCardKeywords(card, spendingSummary);

  let overlap = 0;
  for (const token of cardTokens) {
    if (sourceTokens.has(token)) overlap += 1;
  }

  let trustedBonus = 0;
  try {
    const host = new URL(source.sourceUrl).hostname.toLowerCase();
    if (TRUSTED_HOST_HINTS.some((hint) => host.includes(hint))) trustedBonus += 1.5;
  } catch {
    // invalid URL is handled elsewhere
  }

  let recencyScore = 0;
  const years = extractYears(sourceText);
  if (years.length > 0) {
    const maxYear = Math.max(...years);
    if (maxYear >= 2025) recencyScore += 1;
    if (maxYear <= 2023) recencyScore -= 2;
  }

  return overlap + trustedBonus + recencyScore;
}

function extractCitationSources(responseData) {
  const sources = [];
  const seen = new Set();

  function pushSource(url, title) {
    if (!isHttpUrl(url)) return;
    const clean = String(url).trim();
    if (seen.has(clean)) return;
    seen.add(clean);
    sources.push({
      sourceUrl: clean,
      sourceTitle: typeof title === 'string' && title.trim() ? title.trim() : '검색 출처',
    });
  }

  function walk(node) {
    if (!node) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (typeof node !== 'object') return;

    if (typeof node.url === 'string') {
      pushSource(node.url, node.title || node.name || node.sourceTitle);
    }

    for (const value of Object.values(node)) {
      walk(value);
    }
  }

  walk(responseData?.output || []);
  return sources;
}

async function verifyUrlAlive(url) {
  if (!isHttpUrl(url)) return false;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);
  try {
    const headRes = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });
    if (headRes.ok) return true;
  } catch {
    // HEAD를 막는 사이트가 있어 GET 재시도
  } finally {
    clearTimeout(timeoutId);
  }

  const controller2 = new AbortController();
  const timeoutId2 = setTimeout(() => controller2.abort(), 4500);
  try {
    const getRes = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller2.signal,
    });
    return getRes.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId2);
  }
}

function parseYearHints(card) {
  const text = [card.title, card.summary, card.reason].join(' ');
  const yearMatches = text.match(/20\d{2}년/g) || [];
  return yearMatches.map((m) => Number(m.replace('년', ''))).filter((y) => Number.isFinite(y));
}

async function attachVerifiedSources(cards, citationSources, spendingSummary) {
  const verified = [];

  for (const card of cards) {
    const yearHints = parseYearHints(card);
    const hasVeryOldYear = yearHints.some((y) => y <= 2023);
    const candidates = [];

    if (isHttpUrl(card.sourceUrl)) {
      candidates.push({
        sourceUrl: card.sourceUrl,
        sourceTitle: card.sourceTitle || '검색 출처',
      });
    }

    for (const source of citationSources) {
      candidates.push(source);
    }

    const uniqueByUrl = [];
    const seenUrls = new Set();
    for (const candidate of candidates) {
      if (!isHttpUrl(candidate.sourceUrl)) continue;
      if (seenUrls.has(candidate.sourceUrl)) continue;
      seenUrls.add(candidate.sourceUrl);
      uniqueByUrl.push(candidate);
    }

    const ranked = uniqueByUrl
      .map((candidate) => ({
        ...candidate,
        score: sourceScore(card, candidate, spendingSummary),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    let selected = null;
    for (const candidate of ranked) {
      if (candidate.score < 2) continue;

      // 2023년 이하 언급 카드라면 더 엄격하게 공식/뉴스 도메인 위주로 제한
      if (hasVeryOldYear) {
        const host = new URL(candidate.sourceUrl).hostname;
        const seemsReliable =
          host.endsWith('.go.kr') ||
          host.endsWith('.or.kr') ||
          host.includes('news') ||
          host.includes('bank') ||
          host.includes('card');
        if (!seemsReliable) continue;
      }

      // 외부 사이트가 죽어있으면 링크로 사용하지 않음
      // eslint-disable-next-line no-await-in-loop
      const alive = await verifyUrlAlive(candidate.sourceUrl);
      if (alive) {
        selected = candidate;
        break;
      }
    }

    verified.push({
      ...card,
      sourceTitle: selected?.sourceTitle || '출처 링크 확인 필요',
      sourceUrl: selected?.sourceUrl || '',
      confidenceScore: selected
        ? Math.min(0.99, Number(card.confidenceScore || 0.7) + 0.05)
        : Math.max(0.45, Number(card.confidenceScore || 0.7) - 0.25),
    });
  }

  return verified;
}

async function requestCards({ apiKey, model, spendingSummary, count, enableWebSearch }) {
  const body = {
    model,
    input: buildPrompt(spendingSummary, count),
    text: {
      format: {
        type: 'json_schema',
        name: CARD_SCHEMA.name,
        strict: CARD_SCHEMA.strict,
        schema: CARD_SCHEMA.schema,
      },
    },
  };

  if (enableWebSearch) {
    body.tools = [{ type: 'web_search_preview' }];
    body.tool_choice = 'auto';
  }

  const openaiRes = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!openaiRes.ok) {
    return {
      ok: false,
      status: openaiRes.status,
      errorText: await openaiRes.text(),
    };
  }

  const data = await openaiRes.json();
  const rawText = readOutputText(data);
  const parsed = JSON.parse(rawText);
  const citationSources = extractCitationSources(data);
  const normalized = normalizeCards(parsed.cards);
  const cards = await attachVerifiedSources(normalized, citationSources, spendingSummary);

  return {
    ok: true,
    cards,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is missing' });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const { spendingSummary = {}, count: requestedCount = 4 } = req.body || {};
  const count = Math.min(6, Math.max(1, Number(requestedCount) || 4));

  try {
    let result = await requestCards({
      apiKey,
      model,
      spendingSummary,
      count,
      enableWebSearch: true,
    });

    // 일부 계정/모델에서 web_search tool 미지원일 수 있어 fallback 제공
    if (!result.ok && result.status === 400 && result.errorText.includes('web_search_preview')) {
      result = await requestCards({
        apiKey,
        model,
        spendingSummary,
        count,
        enableWebSearch: false,
      });
    }

    if (!result.ok) {
      return res.status(result.status).json({
        error: 'OpenAI request failed',
        details: result.errorText,
      });
    }

    return res.status(200).json({
      cards: result.cards || [],
      generatedAt: new Date().toISOString(),
      model,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Newsletter generation failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
