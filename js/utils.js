function decomposeKoreanWord(word) {
            const CHOSUNG_MAP = {
                0: 'ㄱ', 1: 'ㄲ', 2: 'ㄴ', 3: 'ㄷ', 4: 'ㄸ', 5: 'ㄹ', 6: 'ㅁ', 7: 'ㅂ', 8: 'ㅃ',
                9: 'ㅅ', 10: 'ㅆ', 11: 'ㅇ', 12: 'ㅈ', 13: 'ㅉ', 14: 'ㅊ', 15: 'ㅋ', 16: 'ㅌ', 17: 'ㅍ', 18: 'ㅎ'
            };
            const JUNGSUNG_MAP = {
                0: 'ㅏ', 1: 'ㅐ', 2: 'ㅑ', 3: 'ㅒ', 4: 'ㅓ', 5: 'ㅔ', 6: 'ㅕ', 7: 'ㅖ', 8: 'ㅗ',
                9: 'ㅘ', 10: 'ㅙ', 11: 'ㅚ', 12: 'ㅛ', 13: 'ㅜ', 14: 'ㅝ', 15: 'ㅞ', 16: 'ㅟ', 17: 'ㅠ',
                18: 'ㅡ', 19: 'ㅢ', 20: 'ㅣ'
            };
            const JONGSUNG_MAP = {
                0: '', 1: 'ㄱ', 2: 'ㄲ', 3: 'ㄳ', 4: 'ㄴ', 5: 'ㄴㅈ', 6: 'ㄴㅎ', 7: 'ㄷ', 8: 'ㄹ',
                9: 'ㄹㄱ', 10: 'ㄹㅁ', 11: 'ㄹㅂ', 12: 'ㄹㅅ', 13: 'ㄹㅌ', 14: 'ㄹㄿ', 15: 'ㄹㅎ', 16: 'ㅁ',
                17: 'ㅂ', 18: 'ㅄ', 19: 'ㅅ', 20: 'ㅆ', 21: 'ㅇ', 22: 'ㅈ', 23: 'ㅊ', 24: 'ㅋ', 25: 'ㅌ',
                26: 'ㅍ', 27: 'ㅎ'
            };

            const CHOSUNG_SUB = { 'ㄲ': ['ㄱ', 'ㄱ'], 'ㄸ': ['ㄷ', 'ㄷ'], 'ㅃ': ['ㅂ', 'ㅂ'], 'ㅆ': ['ㅅ', 'ㅅ'], 'ㅉ': ['ㅈ', 'ㅈ'] };
            const JUNGSUNG_SUB = {
                'ㅐ': ['ㅏ', 'ㅣ'], 'ㅒ': ['ㅑ', 'ㅣ'], 'ㅔ': ['ㅓ', 'ㅣ'], 'ㅖ': ['ㅕ', 'ㅣ'],
                'ㅘ': ['ㅗ', 'ㅏ'], 'ㅙ': ['ㅗ', 'ㅏ', 'ㅣ'], 'ㅚ': ['ㅗ', 'ㅣ'], 'ㅝ': ['ㅜ', 'ㅓ'],
                'ㅞ': ['ㅜ', 'ㅓ', 'ㅣ'], 'ㅟ': ['ㅜ', 'ㅣ'], 'ㅢ': ['ㅡ', 'ㅣ']
            };
            const JONGSUNG_SUB = {
                'ㄲ': ['ㄱ', 'ㄱ'], 'ㄳ': ['ㄱ', 'ㅅ'], 'ㄴㅈ': ['ㄴ', 'ㅈ'], 'ㄴㅎ': ['ㄴ', 'ㅎ'],
                'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'],
                'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'], 'ㅆ': ['ㅅ', 'ㅅ']
            };

            let result = [];
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const code = char.charCodeAt(0);
                if (code >= 0xac00 && code <= 0xd7a3) {
                    const charCode = code - 0xac00;
                    const cho = Math.floor(charCode / 588);
                    const jung = Math.floor((charCode % 588) / 28);
                    const jong = charCode % 28;

                    const choChar = CHOSUNG_MAP[cho];
                    const jungChar = JUNGSUNG_MAP[jung];
                    const jongChar = JONGSUNG_MAP[jong];

                    const choDecom = CHOSUNG_SUB[choChar] || [choChar];
                    const jungDecom = JUNGSUNG_SUB[jungChar] || [jungChar];
                    const jongDecom = JONGSUNG_SUB[jongChar] || (jongChar ? [jongChar] : []);

                    result = result.concat(choDecom, jungDecom, jongDecom);
                } else {
                    result.push(char);
                }
            }
            return result;
        }

        // 추천 단어 클릭 시 인풋에 자모 자동 분해 입력
        
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = "position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 5px; z-index: 9999; font-size: 0.9rem; transition: opacity 0.3s; opacity: 0;";
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 2000);
}
