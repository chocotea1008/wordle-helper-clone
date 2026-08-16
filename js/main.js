function switchMainTab(tab) {
    document.getElementById('top-tab-cheat').classList.toggle('active', tab === 'cheat');
    document.getElementById('top-tab-game').classList.toggle('active', tab === 'game');

    document.getElementById('cheat-view').style.display = tab === 'cheat' ? 'grid' : 'none';
    document.getElementById('game-view').style.display = tab === 'game' ? 'grid' : 'none';

    if (tab === 'game') {
        if (!gameAnswer) {
            initGame(5);
        } else {
            // 탭 전환 시 과거 행의 애니메이션이 재실행되지 않도록 정적 렌더링
            lastSubmittedRow = -1;
            lastTypedIndex = -1;
            renderGameBoard();
        }
    }
}

// 글로벌 키보드 입력 감지
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const activeEl = document.activeElement;
    const tag = activeEl ? activeEl.tagName.toUpperCase() : '';
    if (tag === 'TEXTAREA' || tag === 'SELECT') return;

    // 커스텀 정답 입력창 내 타이핑 시 예외
    if (tag === 'INPUT' && activeEl.id === 'custom-answer-input') return;

    const cheatView = document.getElementById('cheat-view');
    const gameView = document.getElementById('game-view');

    if (cheatView && cheatView.style.display !== 'none') {
        // 방향키 위/아래: 추천 단어 항목 선택 이동
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateRecommendSelection(1);
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateRecommendSelection(-1);
            return;
        }

        // 숫자키 1~7: 힌트 타일 색상 토글 (회→노→초→회)
        if (e.key >= '1' && e.key <= '7') {
            const idx = parseInt(e.key) - 1;
            if (idx < currentJamoLen) {
                e.preventDefault();
                toggleTileState(idx);
                const hintBtns = document.querySelectorAll('.hint-btn');
                if (hintBtns[idx]) {
                    hintBtns[idx].classList.add('pulse');
                    setTimeout(() => hintBtns[idx].classList.remove('pulse'), 300);
                }
            }
            return;
        }

        // 엔터키: 자모 타일이 모두 채워졌으면 [추가], 안 채워졌으면 [선택된 추천 단어 채우기]
        if (e.key === 'Enter') {
            e.preventDefault();
            const allFilled = inputs.length === currentJamoLen && inputs.every(inp => inp && inp.value.trim() !== '');
            if (allFilled) {
                const btnAdd = document.getElementById('btn-add');
                if (btnAdd && !btnAdd.disabled) {
                    btnAdd.click();
                }
            } else {
                fillSelectedRecommendation();
            }
            return;
        }

        if (tag === 'INPUT') return;

        if (e.key === 'Backspace') {
            e.preventDefault();
            let lastFilled = null;
            for (let i = inputs.length - 1; i >= 0; i--) {
                if (inputs[i] && inputs[i].value) {
                    lastFilled = inputs[i];
                    break;
                }
            }
            if (lastFilled) {
                lastFilled.value = '';
                lastFilled.focus();
                updateAddButtonState();
            } else if (inputs.length > 0) {
                inputs[0].focus();
            }
            return;
        }

        if (e.key.length > 1 && e.key !== 'Process') return;

        // 영문 입력 자동 한글 자모 변환
        const jamoMap = {
            'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
            'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
            'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
            'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ'
        };

        let targetChar = '';
        if (/^[ㄱ-ㅎㅏ-ㅣ]$/.test(e.key)) {
            targetChar = e.key;
        } else if (jamoMap[e.key]) {
            targetChar = jamoMap[e.key];
        } else if (jamoMap[e.key.toLowerCase()]) {
            targetChar = jamoMap[e.key.toLowerCase()];
        }

        if (targetChar) {
            e.preventDefault();
            const firstEmptyIdx = inputs.findIndex(inp => !inp.value);
            if (firstEmptyIdx !== -1) {
                const decomposed = decomposeKoreanWord(targetChar);
                for (let k = 0; k < decomposed.length && (firstEmptyIdx + k) < currentJamoLen; k++) {
                    inputs[firstEmptyIdx + k].value = decomposed[k];
                }
                const nextIdx = Math.min(firstEmptyIdx + decomposed.length, currentJamoLen - 1);
                if (inputs[nextIdx]) inputs[nextIdx].focus();
                updateAddButtonState();
            }
        }
    } else if (gameView && gameView.style.display !== 'none') {
        if (tag === 'INPUT') return;
        if (e.key === 'Enter') {
            e.preventDefault();
            submitGameGuess();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            vkBackspace();
        } else {
            if (e.key.length > 1 && e.key !== 'Process') return;
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
    initCheatApp();
});