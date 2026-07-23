import math
from typing import List, Dict

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

def decompose_korean_word(word: str) -> List[str]:
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

def get_pattern(guess_jamos, answer_jamos):
    if len(guess_jamos) != len(answer_jamos):
        return None
    
    n = len(guess_jamos)
    pattern = ['회'] * n
    ans_used = [False] * n
    guess_used = [False] * n
    
    # 1st pass: Green (초)
    for i in range(n):
        if guess_jamos[i] == answer_jamos[i]:
            pattern[i] = '초'
            ans_used[i] = True
            guess_used[i] = True
            
    # 2nd pass: Yellow (노)
    for i in range(n):
        if not guess_used[i]:
            for j in range(n):
                if not ans_used[j] and guess_jamos[i] == answer_jamos[j]:
                    pattern[i] = '노'
                    ans_used[j] = True
                    break
    return "".join(pattern)

def filter_words(candidates: List[dict], guess_jamos: List[str], hint_pattern: List[str]) -> List[dict]:
    hint_str = "".join(hint_pattern)
    filtered = []
    for cand in candidates:
        if get_pattern(guess_jamos, cand['jamos']) == hint_str:
            filtered.append(cand)
    return filtered

def calculate_expected_remains(guess_jamos: List[str], candidates: List[dict]) -> float:
    pattern_counts = {}
    for cand in candidates:
        p = get_pattern(guess_jamos, cand['jamos'])
        if p:
            pattern_counts[p] = pattern_counts.get(p, 0) + 1
            
    total = len(candidates)
    if total == 0:
        return 0.0
        
    expected_remain = sum(count * count for count in pattern_counts.values()) / total
    return expected_remain

def solve(history, jamo_len, all_words):
    candidates = []
    for word in all_words:
        jamos = decompose_korean_word(word)
        if len(jamos) == jamo_len:
            candidates.append({'word': word, 'jamos': jamos})
            
    for entry in history:
        guess_jamos = decompose_korean_word(entry['word'])
        if len(guess_jamos) < jamo_len:
            guess_jamos.extend([''] * (jamo_len - len(guess_jamos)))
        candidates = filter_words(candidates, guess_jamos[:jamo_len], entry['hint'])
        
    remain_count = len(candidates)
    
    if remain_count == 0:
        return {'success': True, 'remain_count': 0, 'recommendations': [], 'full_list': []}
        
    results = []
    eval_pool = candidates[:200] if remain_count > 200 else candidates
    
    for guess_cand in eval_pool:
        exp_remain = calculate_expected_remains(guess_cand['jamos'], candidates)
        results.append({
            'word': guess_cand['word'],
            'expected_remain': round(exp_remain, 1)
        })
        
    results.sort(key=lambda x: x['expected_remain'])
    
    top_5 = results[:5]
    recommendations = []
    strategies = ["균형 추천 (최적)", "직접 타격 (정답 후보)", "일상 단어 우선", "모음 집중 탐색", "자모 다양성 (필터링)"]
    
    for i, r in enumerate(top_5):
        recommendations.append({
            'word': r['word'],
            'strategy': strategies[i % len(strategies)],
            'reason': f"평균적으로 {r['expected_remain']}개의 후보가 남는 효율적인 단어입니다.",
            'expected_remain': r['expected_remain']
        })
        
    full_list = [c['word'] for c in candidates] if remain_count <= 30 else []
    
    return {
        'success': True,
        'remain_count': remain_count,
        'recommendations': recommendations,
        'full_list': full_list
    }
