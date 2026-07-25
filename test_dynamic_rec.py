import re, json

with open('solver.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('ALL_WORDS = [')
end = text.find('];', pos)
raw = text[pos+13:end]
all_words = set(re.findall(r'"([^"]+)"', raw))

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

def decompose(word: str) -> list:
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

for jamo_len in [5, 6, 7]:
    cands = [w for w in all_words if len(decompose(w)) == jamo_len]
    print(f"Jamo length {jamo_len}: total candidate words = {len(cands)}")
