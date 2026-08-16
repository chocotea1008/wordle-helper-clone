let lastSubmittedRow = -1;
let lastTypedIndex = -1;
let keyboardColorMap = {};

// --- 애니메이션 ON/OFF 쿠키 및 LocalStorage 영구 저장 ---
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days = 365) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function getGameAnimSetting() {
    try {
        const cookieVal = getCookie('wordle_game_anim');
        if (cookieVal !== null) return cookieVal === 'true';
        const localVal = localStorage.getItem('wordle_game_anim');
        if (localVal !== null) return localVal === 'true';
    } catch(e) {}
    return true; // 기본값: ON
}

function setGameAnimSetting(enabled) {
    try {
        setCookie('wordle_game_anim', enabled ? 'true' : 'false', 365);
        localStorage.setItem('wordle_game_anim', enabled ? 'true' : 'false');
    } catch(e) {}
}

let isGameAnimEnabled = getGameAnimSetting();

function updateAnimToggleButtonUI() {
    const btn = document.getElementById('btn-toggle-anim');
    if (!btn) return;
    if (isGameAnimEnabled) {
        btn.innerHTML = '애니메이션 ON 🎬';
        btn.style.color = 'var(--color-green)';
        btn.style.borderColor = 'var(--color-green)';
    } else {
        btn.innerHTML = '애니메이션 OFF ⏸️';
        btn.style.color = 'var(--text-muted)';
        btn.style.borderColor = 'var(--border-color)';
    }
}

function toggleGameAnimation() {
    isGameAnimEnabled = !isGameAnimEnabled;
    setGameAnimSetting(isGameAnimEnabled);
    updateAnimToggleButtonUI();
    if (typeof showToast === 'function') {
        showToast(`애니메이션이 ${isGameAnimEnabled ? '켜졌습니다 (ON 🎬)' : '꺼졌습니다 (OFF ⏸️)'}`);
    }
}

function switchGameMode(len) {
    if (currentGameLen === len && gameAnswer) return;
    currentGameLen = len;
    document.getElementById('game-tab-5').classList.toggle('active', len === 5);
    document.getElementById('game-tab-6').classList.toggle('active', len === 6);
    document.getElementById('game-tab-7').classList.toggle('active', len === 7);
    initGame(len);
}

function initGame(len = currentGameLen) {
    currentGameLen = len;
    gameHistory = [];
    currentTypedJamos = [];
    gameOver = false;
    lastSubmittedRow = -1;
    lastTypedIndex = -1;
    keyboardColorMap = {};

    updateAnimToggleButtonUI();

    const msg = document.getElementById('game-message');
    if (msg) {
        msg.innerText = "";
        msg.style.color = "var(--color-yellow)";
    }

    // 가상 키보드 상태 초기화
    document.querySelectorAll('.vk-key').forEach(btn => {
        btn.classList.remove('state-green', 'state-yellow', 'state-grey', 'key-green', 'key-yellow', 'key-grey');
    });

    // 실사용 친숙한 단어 우선 채택
    let commonList = (typeof COMMON_ANSWER_WORDS !== 'undefined' && COMMON_ANSWER_WORDS[len]) ? COMMON_ANSWER_WORDS[len] : [];

    let validWords = commonList.filter(w => {
        const jamos = decomposeKoreanWord(w);
        return jamos.length === len;
    });

    // Fallback to ALL_WORDS if no match in common list
    if (validWords.length === 0 && typeof ALL_WORDS !== 'undefined') {
        validWords = ALL_WORDS.filter(w => {
            const jamos = decomposeKoreanWord(w);
            return jamos.length === len;
        });
    }

    if (validWords.length > 0) {
        gameAnswer = validWords[Math.floor(Math.random() * validWords.length)];
        gameAnswerJamos = decomposeKoreanWord(gameAnswer);
    } else {
        gameAnswer = "가위";
        gameAnswerJamos = decomposeKoreanWord(gameAnswer);
    }

    renderGameBoard();
}

function vkClick(jamo) {
    if (gameOver) return;
    lastSubmittedRow = -1;

    if (jamo === 'ㅐ') {
        vkClick('ㅏ');
        vkClick('ㅣ');
        return;
    }
    if (jamo === 'ㅔ') {
        vkClick('ㅓ');
        vkClick('ㅣ');
        return;
    }
    if (currentTypedJamos.length < currentGameLen) {
        lastTypedIndex = currentTypedJamos.length;
        currentTypedJamos.push(jamo);
        renderGameBoard();
    }
}

function vkBackspace() {
    if (gameOver) return;
    lastSubmittedRow = -1;
    lastTypedIndex = -1;

    if (currentTypedJamos.length > 0) {
        currentTypedJamos.pop();
        renderGameBoard();
    }
}

function getPattern(guess, answer) {
    const pattern = new Array(guess.length).fill('회');
    const ansArr = [...answer];

    // 1st Pass: Green (초록색) 정확 일치
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === ansArr[i]) {
            pattern[i] = '초';
            ansArr[i] = null;
        }
    }

    // 2nd Pass: Yellow (노란색) 위치 불일치 포함
    for (let i = 0; i < guess.length; i++) {
        if (pattern[i] !== '초' && ansArr.includes(guess[i])) {
            pattern[i] = '노';
            ansArr[ansArr.indexOf(guess[i])] = null;
        }
    }
    return pattern.join('');
}

function updateKeyboardSingleKey(jamo, status) {
    const current = keyboardColorMap[jamo];
    if (status === '초') {
        keyboardColorMap[jamo] = 'state-green';
    } else if (status === '노') {
        if (current !== 'state-green') keyboardColorMap[jamo] = 'state-yellow';
    } else if (status === '회') {
        if (current !== 'state-green' && current !== 'state-yellow') keyboardColorMap[jamo] = 'state-grey';
    }

    document.querySelectorAll('.vk-key').forEach(btn => {
        const char = btn.innerText.trim();
        if (char === jamo && keyboardColorMap[char]) {
            btn.classList.remove('state-green', 'state-yellow', 'state-grey');
            btn.classList.add(keyboardColorMap[char]);
        }
    });
}

function syncAllKeyboardKeys() {
    document.querySelectorAll('.vk-key').forEach(btn => {
        const char = btn.innerText.trim();
        btn.classList.remove('state-green', 'state-yellow', 'state-grey');
        if (keyboardColorMap[char]) {
            btn.classList.add(keyboardColorMap[char]);
        }
    });
}

function submitGameGuess() {
    if (gameOver) return;

    if (currentTypedJamos.length !== currentGameLen) {
        // 행 흔들림 피드백
        const rows = document.querySelectorAll('.game-row');
        const currentRow = rows[gameHistory.length];
        if (currentRow) {
            currentRow.classList.remove('row-shake');
            void currentRow.offsetWidth;
            currentRow.classList.add('row-shake');
        }

        const msg = document.getElementById('game-message');
        if (msg) {
            msg.innerText = "자모를 모두 입력해주세요.";
            msg.style.color = "var(--color-yellow)";
            setTimeout(() => { if (!gameOver) msg.innerText = ""; }, 2000);
        }
        if (typeof showToast === 'function') {
            showToast("자모를 모두 입력해주세요.", "warning");
        }
        return;
    }

    const jamos = currentTypedJamos.slice();
    const patternStr = getPattern(jamos, gameAnswerJamos);
    const pattern = patternStr.split('');

    lastSubmittedRow = isGameAnimEnabled ? gameHistory.length : -1;
    gameHistory.push({ word: '', jamos, pattern });
    currentTypedJamos = [];

    if (isGameAnimEnabled) {
        renderGameBoard();
        // 타일이 90도 회전하여 색상이 공개되는 순간 가상 키보드 색상도 일치하여 변경
        pattern.forEach((pat, j) => {
            setTimeout(() => {
                updateKeyboardSingleKey(jamos[j], pat);
            }, (j * 200) + 250);
        });
    } else {
        // 애니메이션 OFF 시 즉시 키보드 색상 및 타일 반영
        pattern.forEach((pat, j) => {
            updateKeyboardSingleKey(jamos[j], pat);
        });
        renderGameBoard();
    }

    const msg = document.getElementById('game-message');
    const isWin = patternStr === '초'.repeat(currentGameLen);
    const isLoss = !isWin && gameHistory.length >= MAX_GUESSES;

    const animDuration = isGameAnimEnabled ? ((currentGameLen * 200) + 400) : 0;

    // 회전 애니메이션 완료 후 상태를 정적 클래스로 전환 (탭 전환 시 재실행 방지)
    if (isGameAnimEnabled) {
        setTimeout(() => {
            lastSubmittedRow = -1;
            renderGameBoard();
        }, (currentGameLen * 200) + 600);
    }

    if (isWin) {
        gameOver = true;
        setTimeout(() => {
            if (isGameAnimEnabled) {
                const rows = document.querySelectorAll('.game-row');
                const winningRow = rows[gameHistory.length - 1];
                if (winningRow) {
                    winningRow.querySelectorAll('.game-tile').forEach((t, i) => {
                        t.classList.add('win-bounce');
                        t.style.animationDelay = `${i * 0.08}s`;
                    });
                }
            }
            if (msg) {
                msg.innerText = `🎉 정답입니다! (${gameAnswer})`;
                msg.style.color = "var(--color-green)";
            }
            if (typeof showToast === 'function') {
                showToast(`🎉 정답입니다! (${gameAnswer})`, "success");
            }
        }, animDuration);
    } else if (isLoss) {
        gameOver = true;
        setTimeout(() => {
            if (msg) {
                msg.innerText = `아쉽네요! 정답은: ${gameAnswer}`;
                msg.style.color = "var(--color-yellow)";
            }
            if (typeof showToast === 'function') {
                showToast(`정답은 '${gameAnswer}' 였습니다.`, "info");
            }
        }, animDuration);
    }
}

function renderGameBoard() {
    syncAllKeyboardKeys();
    const board = document.getElementById('game-board');
    if (!board) return;
    board.innerHTML = "";

    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'game-row';

        const guess = gameHistory[i] || null;
        const guessJamos = guess ? guess.jamos : (i === gameHistory.length ? currentTypedJamos : []);
        const guessPattern = guess ? guess.pattern : [];

        for (let j = 0; j < currentGameLen; j++) {
            const tile = document.createElement('div');
            tile.className = 'game-tile';

            if (guess) {
                tile.innerText = guessJamos[j] || '';
                tile.classList.add('filled');

                if (i === lastSubmittedRow && isGameAnimEnabled) {
                    // 방금 제출한 행 (애니메이션 ON): 시작 시 흰색 유지 -> 90도 회전 시점에 색상 공개!
                    if (guessPattern[j] === '초') tile.classList.add('tile-flip-green');
                    else if (guessPattern[j] === '노') tile.classList.add('tile-flip-yellow');
                    else tile.classList.add('tile-flip-grey');

                    tile.style.animationDelay = `${j * 0.2}s`;
                } else {
                    // 이미 과거에 회전 완료된 행 또는 애니메이션 OFF: 즉시 정적 색상 적용
                    if (guessPattern[j] === '초') tile.classList.add('state-green');
                    else if (guessPattern[j] === '노') tile.classList.add('state-yellow');
                    else tile.classList.add('state-grey');
                }
            } else if (i === gameHistory.length) {
                // 현재 타이핑 입력 중인 행
                const char = guessJamos[j] || '';
                tile.innerText = char;
                if (char) {
                    tile.classList.add('active-input');
                    // 오직 방금 추가된 바로 그 타일 1개만 pop 애니메이션 실행!
                    if (isGameAnimEnabled && j === lastTypedIndex) {
                        tile.classList.add('tile-pop');
                    }
                    // 이미 회색(불일치)으로 판정된 자모인 경우 키보드처럼 회백색 음영으로 미리 표시
                    if (keyboardColorMap[char] === 'state-grey') {
                        tile.classList.add('typing-grey');
                    }
                }
            }
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

function toggleCustomAnswerUI() {
    const container = document.getElementById('custom-answer-container');
    if (!container) return;
    const isHidden = container.style.display === 'none' || container.style.display === '';
    container.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
        const inp = document.getElementById('custom-answer-input');
        if (inp) {
            inp.value = '';
            inp.focus();
        }
        const errDiv = document.getElementById('custom-answer-error');
        if (errDiv) errDiv.style.display = 'none';
    }
}

function setCustomAnswer() {
    const inp = document.getElementById('custom-answer-input');
    const errDiv = document.getElementById('custom-answer-error');
    if (!inp) return;

    const word = inp.value.trim();
    if (!word) {
        if (errDiv) {
            errDiv.innerText = '정답으로 지정할 단어를 입력해주세요.';
            errDiv.style.display = 'block';
        }
        return;
    }

    const jamos = decomposeKoreanWord(word);
    if (jamos.length !== currentGameLen) {
        if (errDiv) {
            errDiv.innerText = `'${word}' 단어는 ${jamos.length}자모입니다. 현재 설정된 ${currentGameLen}자모 모드와 맞지 않습니다.`;
            errDiv.style.display = 'block';
        }
        return;
    }

    gameAnswer = word;
    gameAnswerJamos = jamos;
    gameHistory = [];
    currentTypedJamos = [];
    gameOver = false;
    lastSubmittedRow = -1;
    keyboardColorMap = {};

    const msg = document.getElementById('game-message');
    if (msg) {
        msg.innerText = "🎯 정답이 '" + word + "'(으)로 지정되었습니다!";
        msg.style.color = "var(--color-green)";
    }

    renderGameBoard();

    if (errDiv) errDiv.style.display = 'none';
    const container = document.getElementById('custom-answer-container');
    if (container) container.style.display = 'none';

    if (typeof showToast === 'function') {
        showToast("정답이 '" + word + "'(으)로 지정되었습니다.");
    }
}
