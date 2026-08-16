// --- 직접 플레이 (Wordle Game) 모드 컨트롤러 ---

let lastSubmittedRow = -1;

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
        currentTypedJamos.push(jamo);
        renderGameBoard();
    }
}

function vkBackspace() {
    if (gameOver) return;
    lastSubmittedRow = -1;

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

function submitGameGuess() {
    if (gameOver) return;

    if (currentTypedJamos.length !== currentGameLen) {
        // 행 흔들림 애니메이션 피드백
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

    lastSubmittedRow = gameHistory.length;
    gameHistory.push({ word: '', jamos, pattern });
    currentTypedJamos = [];

    renderGameBoard();

    const msg = document.getElementById('game-message');
    const isWin = patternStr === '초'.repeat(currentGameLen);
    const isLoss = !isWin && gameHistory.length >= MAX_GUESSES;

    const animDuration = (currentGameLen * 180) + 400;

    if (isWin) {
        gameOver = true;
        setTimeout(() => {
            const rows = document.querySelectorAll('.game-row');
            const winningRow = rows[gameHistory.length - 1];
            if (winningRow) {
                winningRow.querySelectorAll('.game-tile').forEach((t, i) => {
                    t.classList.add('win-bounce');
                    t.style.animationDelay = `${i * 0.08}s`;
                });
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

function updateKeyboardState() {
    const kbState = {};
    gameHistory.forEach(guess => {
        guess.jamos.forEach((jamo, idx) => {
            const status = guess.pattern[idx];
            const current = kbState[jamo];
            if (status === '초') {
                kbState[jamo] = 'state-green';
            } else if (status === '노') {
                if (current !== 'state-green') kbState[jamo] = 'state-yellow';
            } else if (status === '회') {
                if (current !== 'state-green' && current !== 'state-yellow') kbState[jamo] = 'state-grey';
            }
        });
    });

    document.querySelectorAll('.vk-key').forEach(btn => {
        const char = btn.innerText.trim();
        btn.classList.remove('state-green', 'state-yellow', 'state-grey', 'key-green', 'key-yellow', 'key-grey');
        if (kbState[char]) {
            btn.classList.add(kbState[char]);
        }
    });
    return kbState;
}

function renderGameBoard() {
    updateKeyboardState();
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
                // 이미 제출된 과거 추측 타일
                tile.innerText = guessJamos[j] || '';
                tile.classList.add('filled');
                if (guessPattern[j] === '초') tile.classList.add('state-green');
                else if (guessPattern[j] === '노') tile.classList.add('state-yellow');
                else tile.classList.add('state-grey');

                // 방금 제출한 행만 플립 회전 애니메이션 적용
                if (i === lastSubmittedRow) {
                    tile.classList.add('tile-flip');
                    tile.style.animationDelay = `${j * 0.18}s`;
                }
            } else if (i === gameHistory.length) {
                // 현재 입력 중인 행
                const char = guessJamos[j] || '';
                tile.innerText = char;
                if (char) {
                    tile.classList.add('active-input', 'tile-pop');
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
