function switchMainTab(tab) {
    document.getElementById('top-tab-cheat').classList.toggle('active', tab === 'cheat');
    document.getElementById('top-tab-game').classList.toggle('active', tab === 'game');

    document.getElementById('cheat-view').style.display = tab === 'cheat' ? 'grid' : 'none';
    document.getElementById('game-view').style.display = tab === 'game' ? 'grid' : 'none';

    if (tab === 'game' && !gameAnswer) {
        initGame(5);
    }
}

// 글로벌 키보드 입력 감지 (인풋 포커스 없이도 편리하게 타이핑 가능)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const tag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter' && e.key !== 'Process') return;

    const cheatView = document.getElementById('cheat-view');
    const gameView = document.getElementById('game-view');

    if (cheatView && cheatView.style.display !== 'none') {
        if (e.key === 'Enter') {
            const btnAdd = document.getElementById('btn-add');
            if (btnAdd && !btnAdd.disabled) {
                e.preventDefault();
                btnAdd.click();
            }
            return;
        }

        if (e.key === 'Backspace') {
            let lastFilled = null;
            for (let i = inputs.length - 1; i >= 0; i--) {
                if (inputs[i] && inputs[i].value) {
                    lastFilled = inputs[i];
                    break;
                }
            }
            if (lastFilled) lastFilled.focus();
            else if (inputs.length > 0) inputs[0].focus();
        } else {
            const firstEmpty = inputs.find(inp => !inp.value);
            if (firstEmpty) {
                firstEmpty.focus();
            } else if (inputs.length > 0) {
                inputs[inputs.length - 1].focus();
            }
        }
    } else if (gameView && gameView.style.display !== 'none') {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitGameGuess();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            vkBackspace();
        } else {
            const jamoMap = {
                'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
                'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
                'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ'
            };
            const lowerKey = e.key.toLowerCase();
            if (/^[ㄱ-ㅎㅏ-ㅣ]$/.test(e.key)) {
                vkClick(e.key);
            } else if (jamoMap[lowerKey]) {
                vkClick(jamoMap[lowerKey]);
            }
        }
    }
});

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    initInputFields();
    renderDefaultRecommendations(currentJamoLen);
});