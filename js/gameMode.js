function switchGameMode(len) {
            if (currentGameLen === len) return;
            currentGameLen = len;
            document.getElementById('game-tab-5').classList.toggle('active', len === 5);
            document.getElementById('game-tab-6').classList.toggle('active', len === 6);
            document.getElementById('game-tab-7').classList.toggle('active', len === 7);
            initGame(len);
        }

        function initGame(len = currentGameLen) {
            gameHistory = [];
            currentTypedJamos = [];
            gameOver = false;
            document.getElementById('game-message').innerText = "";
            document.getElementById('game-message').style.color = "var(--color-yellow)";

            // 정답 무작위 채택
            const validWords = ALL_WORDS.filter(w => {
                const jamos = decomposeKoreanWord(w);
                if (jamos.length !== len) return false;
                if (len === 5 && w.length !== 2) return false;
                if (len === 7 && w.length !== 3) return false;
                return true;
            });
            if (validWords.length > 0) {
                gameAnswer = validWords[Math.floor(Math.random() * validWords.length)];
                gameAnswerJamos = decomposeKoreanWord(gameAnswer);
            } else {
                gameAnswer = "";
                gameAnswerJamos = [];
            }

            renderGameBoard();
        }

        function vkClick(jamo) {
            if (currentTypedJamos.length < currentGameLen) {
                currentTypedJamos.push(jamo);
                renderGameBoard();
            }
        }

        function vkBackspace() {
            if (currentTypedJamos.length > 0) {
                currentTypedJamos.pop();
                renderGameBoard();
            }
        }

        function getPattern(guess, answer) {
            const pattern = new Array(guess.length).fill('회');
            const ansArr = [...answer];
            
            for (let i = 0; i < guess.length; i++) {
                if (guess[i] === ansArr[i]) {
                    pattern[i] = '초';
                    ansArr[i] = null;
                }
            }
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
                const msg = document.getElementById('game-message');
                msg.innerText = "자모를 모두 입력해주세요.";
                msg.style.color = "var(--color-yellow)";
                setTimeout(() => { if (!gameOver) msg.innerText = ""; }, 2000);
                return;
            }

            const jamos = currentTypedJamos.slice();
            const patternStr = getPattern(jamos, gameAnswerJamos);
            const pattern = patternStr.split('');
            
            gameHistory.push({ word: '', jamos, pattern });
            currentTypedJamos = [];
            
            renderGameBoard();

            const msg = document.getElementById('game-message');
            if (patternStr === '초'.repeat(currentGameLen)) {
                gameOver = true;
                msg.innerText = "정답입니다!";
                msg.style.color = "var(--color-green)";
            } else if (gameHistory.length >= MAX_GUESSES) {
                gameOver = true;
                msg.innerText = "아쉽네요! 정답은: " + gameAnswer;
                msg.style.color = "var(--color-yellow)";
            }
        }

        function handleGameInput(event) {
            // Deprecated, input removed
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
                const char = btn.innerText;
                btn.classList.remove('state-green', 'state-yellow', 'state-grey');
                if (kbState[char]) {
                    btn.classList.add(kbState[char]);
                }
            });
            return kbState;
        }

        function renderGameBoard() {
            const kbState = updateKeyboardState();
            const board = document.getElementById('game-board');
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
                        if (guessPattern[j] === '초') tile.classList.add('state-green');
                        else if (guessPattern[j] === '노') tile.classList.add('state-yellow');
                        else tile.classList.add('state-grey');
                    } else if (i === gameHistory.length) {
                        tile.innerText = guessJamos[j] || '';
                        if (guessJamos[j]) {
                            if (kbState[guessJamos[j]] === 'state-grey') {
                                tile.style.backgroundColor = "var(--color-grey)";
                                tile.style.color = "#fff";
                                tile.style.borderColor = "var(--color-grey)";
                                tile.style.opacity = "0.7";
                            } else {
                                tile.style.borderColor = "var(--text-secondary)";
                                tile.style.backgroundColor = "#fff";
                                tile.style.color = "var(--text-primary)";
                                tile.style.opacity = "1";
                            }
                            tile.style.transform = "scale(1.05)";
                            setTimeout(() => tile.style.transform = "scale(1)", 100);
                        } else {
                            tile.style.backgroundColor = "#fff";
                            tile.style.color = "var(--text-primary)";
                            tile.style.borderColor = "#cbd5e1";
                            tile.style.opacity = "1";
                        }
                        tile.style.transition = "transform 0.1s";
                    }
                    row.appendChild(tile);
                }
                board.appendChild(row);
            }
        }



        