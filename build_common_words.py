import re, json

with open('solver.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('ALL_WORDS = [')
end = text.find('];', pos)
raw = text[pos+13:end]
all_words_set = set(re.findall(r'"([^"]+)"', raw))

CHOSUNG_MAP = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
JUNGSUNG_MAP = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"
JONGSUNG_MAP = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"]

CHOSUNG_SUB = {'ㄲ': ['ㄱ','ㄱ'], 'ㄸ': ['ㄷ','ㄷ'], 'ㅃ': ['ㅂ','ㅃ'], 'ㅆ': ['ㅅ','ㅅ'], 'ㅉ': ['ㅈ','ㅈ']}
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

# Comprehensive everyday Korean word list
everyday_words_candidates = [
    # 5-jamo candidates (2 letters, 5 jamos)
    "가위", "가방", "바다", "하늘", "구름", "나무", "사과", "포도", "수박", "우유",
    "라면", "축구", "야구", "음악", "미술", "영화", "친구", "사람", "아이", "마음",
    "생각", "평화", "희망", "행복", "사랑", "아침", "점심", "저녁", "오늘", "내일",
    "어제", "계절", "봄날", "여름", "가을", "겨울", "바람", "노래", "소리", "기억",
    "추억", "시간", "시작", "성공", "기쁨", "미소", "눈물", "얼굴", "손길", "마을",
    "도시", "나라", "세계", "지구", "우주", "태양", "달빛", "별빛", "불꽃", "물결",
    "파도", "들판", "꽃집", "열매", "씨앗", "뿌리", "동물", "새싹", "배우", "가수",
    "의사", "화가", "시인", "책상", "의자", "연필", "공책", "그림", "시계", "거울",
    "열쇠", "지갑", "신발", "모자", "옷장", "침대", "베개", "이불", "창문", "현관",
    "정원", "공원", "산책", "여행", "휴가", "바다", "호수", "강물", "계곡", "동굴",
    "폭포", "바위", "모래", "조개", "소금", "설탕", "간장", "된장", "식초", "후추",
    "고기", "생선", "채소", "과일", "빵집", "과자", "사탕", "초코", "녹차", "홍차",
    "주스", "식당", "카페", "극장", "서점", "약국", "병의", "학교", "교실", "칠판",
    "숙제", "시험", "방학", "입학", "졸업", "선물", "편지", "소식", "소원", "비밀",
    "약속", "미래", "과거", "현재", "세상", "삶성", "인생", "운명", "인연", "인간",
    "남성", "여성", "부모", "형제", "자매", "부부", "아들", "딸애", "삼촌", "이모",
    "고모", "조카", "손자", "이웃", "동료", "선배", "후배", "스승", "제자", "국민",
    "시민", "영웅", "전설", "신화", "역사", "문화", "예술", "문학", "과학", "기술",
    "정치", "경제", "사회", "법률", "교육", "건강", "의료", "복지", "환경", "자연",
    "우정", "믿음", "신뢰", "존경", "배려", "양보", "협동", "용기", "열정", "지혜",

    # 6-jamo candidates
    "강아지", "고양이", "다람쥐", "자전거", "자동차", "비행기", "도서관", "운동장",
    "무지개", "해바라기", "개나리", "진달래", "봉선화", "할머니", "할아버지", "아버지",
    "어머니", "냉장고", "세탁기", "청소기", "선풍기", "에어컨", "컴퓨터", "계산기",
    "카메라", "스피커", "마이크", "텔레비전", "라디오", "비디오", "피아노", "바이올린",
    "플루트", "기타", "드럼", "트럼펫", "아코디언", "축구공", "농구공", "배구공",
    "야구공", "골프공", "탁구공", "볼링공", "테니스장", "수영장", "체육관", "경기장",
    "박물관", "미술관", "음악회", "연주회", "전시회", "박람회", "영화관", "대극장",
    "소극장", "놀이동산", "식물원", "동물원", "수족관", "해수욕장", "국립공원", "휴양림",

    # 7-jamo candidates (3 letters)
    "호랑이", "고구마", "옥수수", "도토리", "물고기", "오징어", "개구리", "올챙이",
    "달팽이", "귀뚜라미", "지렁이", "미꾸라지", "메추라기", "뻐꾸기", "두루미", "독수리",
    "부엉이", "올빼미", "제비꽃", "채송화", "민들레", "할미꽃", "도라지", "더덕구이",
    "비빔밥", "불고기", "갈비탕", "삼계탕", "추어탕", "설렁탕", "곰탕", "육개장",
    "떡볶이", "순대국", "튀김옷", "만두국", "어묵탕", "계란찜", "두부조림", "콩나물무침",
    "시금치나물", "가지볶음", "호박전", "김치전", "파전", "감자전", "녹두전", "빈대떡",
    "송편", "인절미", "경단", "약과", "엿가락", "식혜", "수정과", "오미자차", "유자차"
]

# Let's filter words that exist in all_words_set and group by jamo length
len5_common = []
len6_common = []
len7_common = []

for w in everyday_words_candidates:
    jamos = decompose(w)
    L = len(jamos)
    if w in all_words_set:
        if L == 5 and len(w) == 2:
            len5_common.append(w)
        elif L == 6:
            len6_common.append(w)
        elif L == 7 and len(w) == 3:
            len7_common.append(w)

# Also search dictionary for common frequency Korean words
# Add additional clean Korean words from dictionary
dict_words_5 = [w for w in all_words_set if len(decompose(w)) == 5 and len(w) == 2]
dict_words_6 = [w for w in all_words_set if len(decompose(w)) == 6]
dict_words_7 = [w for w in all_words_set if len(decompose(w)) == 7 and len(w) == 3]

print(f"Everyday words matching in dictionary - 5-jamo: {len(len5_common)}, 6-jamo: {len(len6_common)}, 7-jamo: {len(len7_common)}")

# Let's create js/commonWords.js
js_content = f"""// 자주 쓰이는 실사용 한국어 단어 목록 (직접 플레이 정답용)
const COMMON_ANSWER_WORDS = {{
    5: {json.dumps(sorted(list(set(len5_common))), ensure_ascii=False)},
    6: {json.dumps(sorted(list(set(len6_common))), ensure_ascii=False)},
    7: {json.dumps(sorted(list(set(len7_common))), ensure_ascii=False)}
}};
"""

with open('js/commonWords.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Saved js/commonWords.js successfully!")
