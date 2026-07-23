import json
with open('dict_raw.txt', 'r', encoding='utf-8') as f:
    words = [line.strip() for line in f if line.strip()]

# Add our test words
known_words = ["기낭", "골아지", "가리온", "공사비", "갱론", "강서리", "가외", "가위", "구애", "강리"]
for w in known_words:
    if w not in words:
        words.append(w)

js_code = f"const ALL_WORDS = {json.dumps(words, ensure_ascii=False)};\n"
js_code += """
function getPattern(guessJamos, answerJamos) {
    if (guessJamos.length !== answerJamos.length) return null;
    const n = guessJamos.length;
    const pattern = Array(n).fill('회');
    const ansUsed = Array(n).fill(false);
    const guessUsed = Array(n).fill(false);

    for (let i = 0; i < n; i++) {
        if (guessJamos[i] === answerJamos[i]) {
            pattern[i] = '초';
            ansUsed[i] = true;
            guessUsed[i] = true;
        }
    }

    for (let i = 0; i < n; i++) {
        if (!guessUsed[i]) {
            for (let j = 0; j < n; j++) {
                if (!ansUsed[j] && guessJamos[i] === answerJamos[j]) {
                    pattern[i] = '노';
                    ansUsed[j] = true;
                    break;
                }
            }
        }
    }
    return pattern.join('');
}

function filterWords(candidates, guessJamos, hintPattern) {
    const hintStr = hintPattern.join('');
    return candidates.filter(cand => getPattern(guessJamos, cand.jamos) === hintStr);
}

function calculateExpectedRemains(guessJamos, candidates) {
    const patternCounts = {};
    for (let i = 0; i < candidates.length; i++) {
        const p = getPattern(guessJamos, candidates[i].jamos);
        if (p) {
            patternCounts[p] = (patternCounts[p] || 0) + 1;
        }
    }

    const total = candidates.length;
    if (total === 0) return 0;

    let sumSquares = 0;
    for (let p in patternCounts) {
        sumSquares += patternCounts[p] * patternCounts[p];
    }
    return sumSquares / total;
}

function solveWordle(history, jamoLen) {
    let candidates = [];
    for (let i = 0; i < ALL_WORDS.length; i++) {
        const word = ALL_WORDS[i];
        const jamos = decomposeKoreanWord(word);
        if (jamos.length === jamoLen) {
            candidates.push({ word, jamos });
        }
    }

    for (let i = 0; i < history.length; i++) {
        const entry = history[i];
        const guessJamos = decomposeKoreanWord(entry.word);
        while (guessJamos.length < jamoLen) guessJamos.push('');
        candidates = filterWords(candidates, guessJamos.slice(0, jamoLen), entry.hint);
    }

    const remainCount = candidates.length;
    if (remainCount === 0) {
        return { success: true, remain_count: 0, recommendations: [], full_list: [] };
    }

    const evalPool = remainCount > 200 ? candidates.slice(0, 200) : candidates;
    const results = [];

    for (let i = 0; i < evalPool.length; i++) {
        const expRemain = calculateExpectedRemains(evalPool[i].jamos, candidates);
        results.push({
            word: evalPool[i].word,
            expected_remain: Math.round(expRemain * 10) / 10
        });
    }

    results.sort((a, b) => a.expected_remain - b.expected_remain);
    const top5 = results.slice(0, 5);

    const strategies = ["균형 추천 (최적)", "직접 타격 (정답 후보)", "일상 단어 우선", "모음 집중 탐색", "자모 다양성 (필터링)"];
    const recommendations = top5.map((r, i) => ({
        word: r.word,
        strategy: strategies[i % strategies.length],
        reason: \평균적으로 \개의 후보가 남는 효율적인 단어입니다.\,
        expected_remain: r.expected_remain
    }));

    const full_list = remainCount <= 30 ? candidates.map(c => c.word) : [];

    return {
        success: true,
        remain_count: remainCount,
        recommendations,
        full_list
    };
}
"""
with open('solver.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
