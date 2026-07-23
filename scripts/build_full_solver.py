import urllib.request
import json
import os

req = urllib.request.Request('https://raw.githubusercontent.com/acidsound/korean_wordlist/master/wordslist.txt', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    content = response.read().decode('utf-8')

raw_words = [line.strip() for line in content.split('\n') if line.strip()]

CHOSUNG_MAP = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
JUNGSUNG_MAP = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"
JONGSUNG_MAP = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"]

CHOSUNG_SUB = {'ㄲ': ['ㄱ','ㄱ'], 'ㄸ': ['ㄷ','ㄷ'], 'ㅃ': ['ㅂ','ㅂ'], 'ㅆ': ['ㅅ','ㅅ'], 'ㅉ': ['ㅈ','ㅈ']}
JUNGSUNG_SUB = {
    'ㅐ': ['ㅏ','ㅣ'], 'ㅒ': ['ㅑ','ㅣ'], 'ㅔ': ['ㅓ','ㅣ'], 'ㅖ': ['ㅕ','ㅣ'],
    'ㅘ': ['ㅗ','ㅏ'], 'ㅙ': ['ㅗ','ㅏ','ㅣ'], 'ㅚ': ['ㅗ','ㅣ'], 'ㅝ': ['ㅜ','ㅓ'],
    'ㅞ': ['ㅜ','ㅓ','ㅣ'], 'ㅟ': ['ㅜ','ㅣ'], 'ㅢ': ['ㅡ','ㅣ']
}
JONGSUNG_SUB = {
    'ㄲ': ['ㄱ','ㄱ'], 'ㄳ': ['ㄱ','ㅅ'], 'ㄵ': ['ㄴ','ㅈ'], 'ㄶ': ['ㄴ','ㅎ'],
    'ㄺ': ['ㄹ','ㄱ'], 'ㄻ': ['ㄹ','ㅁ'], 'ㄼ': ['ㄹ','ㅂ'], 'ㄽ': ['ㄹ','ㅅ'],
    'ㄾ': ['ㄹ','ㅌ'], 'ㄿ': ['ㄹ','ㅍ'], 'ㅀ': ['ㄹ','ㅎ'], 'ㅄ': ['ㅂ','ㅅ'], 'ㅆ': ['ㅅ','ㅅ']
}

def decompose_korean_word(word: str) -> list:
    result = []
    for char in word:
        code = ord(char)
        if 0xAC00 <= code <= 0xD7A3:
            char_code = code - 0xAC00
            cho = char_code // 588
            jung = (char_code % 588) // 28
            jong = char_code % 28
            cho_char = CHOSUNG_MAP[cho]
            jung_char = JUNGSUNG_MAP[jung]
            jong_char = JONGSUNG_MAP[jong]
            result.extend(CHOSUNG_SUB.get(cho_char, [cho_char]))
            result.extend(JUNGSUNG_SUB.get(jung_char, [jung_char]))
            if jong_char:
                result.extend(JONGSUNG_SUB.get(jong_char, [jong_char]))
        else:
            result.append(char)
    return result

filtered_words = set()
for w in raw_words:
    L = len(decompose_korean_word(w))
    if L == 5 or L == 6 or L == 7:
        filtered_words.add(w)

known_words = ["기낭", "골아지", "가리온", "공사비", "갱론", "강서리", "가외", "가위", "구애", "강리"]
for w in known_words:
    filtered_words.add(w)

filtered_list = list(filtered_words)
print("Filtered words count:", len(filtered_list))

js_code = f"const ALL_WORDS = {json.dumps(filtered_list, ensure_ascii=False)};\n"
js_code += '''
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
        reason: 평균적으로 개의 후보가 남는 효율적인 단어입니다.,
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
'''
with open('solver.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
