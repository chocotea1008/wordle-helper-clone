// --- 치트키 (Wordle Solver) 모드 컨트롤러 ---

// 궁극의 베스트 스타팅 단어 (5종 지표 종합 100점 평점 + 2-Step Recursive Lookahead)
const PRECALCULATED_STARTERS = {
    5: {
        total: "24,205",
        list: [
            { word: "가위", strategy: "종합 1위 (96.1점)", reason: "5종 지표 종합 압도적 1위! ㄱ,ㅏ,ㅇ,ㅜ,ㅣ", remain: "1.2개" },
            { word: "가외", strategy: "종합 2위 (95.1점)", reason: "이중모음(ㅚ→ㅗ+ㅣ) 구조 빠른 구분", remain: "1.2개" },
            { word: "아귀", strategy: "종합 3위 (92.8점)", reason: "ㅇ,ㅏ,ㄱ,ㅜ,ㅣ 5자모 108개 패턴 분할", remain: "1.2개" },
            { word: "기낭", strategy: "일상단어 추천 (84.1점)", reason: "ㄱ,ㅣ,ㄴ,ㅏ,ㅇ 자음 ㄴ 커버", remain: "1.2개" },
            { word: "인사", strategy: "친숙 단어 추천", reason: "친숙한 일상 단어로 쉬운 시작", remain: "1.2개" }
        ]
    },
    6: {
        total: "45,163",
        list: [
            { word: "안식", strategy: "종합 1위 (94.5점)", reason: "6자모 핵심 자모 포함", remain: "1.0개" },
            { word: "악신", strategy: "종합 2위 (93.5점)", reason: "안정적인 분할", remain: "1.0개" },
            { word: "과일", strategy: "일상단어 추천", reason: "이중모음(ㅘ)과 받침(ㄹ) 탐색", remain: "1.0개" },
            { word: "신발", strategy: "친숙 단어 추천", reason: "자음(ㅅ,ㄴ,ㅂ,ㄹ) 고루 탐색", remain: "1.0개" },
            { word: "식당", strategy: "친숙 단어 추천", reason: "친숙한 일상 단어", remain: "1.0개" }
        ]
    },
    7: {
        total: "33,004",
        list: [
            { word: "옷가지", strategy: "종합 1위 (96.4점)", reason: "7자모 절대 1위", remain: "1.0개" },
            { word: "옷가리", strategy: "종합 2위 (96.1점)", reason: "초안정 단어", remain: "1.0개" },
            { word: "안소리", strategy: "종합 3위 (93.1점)", reason: "253개 패턴 분할", remain: "1.0개" },
            { word: "강아지", strategy: "친숙 단어 추천", reason: "친숙한 7자모 단어", remain: "1.0개" },
            { word: "독수리", strategy: "일상 대표 단어", reason: "친숙한 3글자 7자모 단어", remain: "1.0개" }
        ]
    }
};

// --- LocalStorage Calculation Caching ---
function getCalcCacheKey(historyArr, len = currentJamoLen) {
    return `wordle_calc_cache_v2_${len}_` + JSON.stringify(historyArr);
}

function getCachedRecommendation(historyArr, len = currentJamoLen) {
    try {
        const key = getCalcCacheKey(historyArr, len);
        const cachedStr = localStorage.getItem(key);
        if (cachedStr) {
            return JSON.parse(cachedStr);
        }
    } catch (e) {}
    return null;
}

function setCachedRecommendation(historyArr, data, len = currentJamoLen) {
    try {
        const key = getCalcCacheKey(historyArr, len);
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
}

// --- Keyboard Recommendation Selection ---
function updateSelectedRecommendUI() {
    const items = document.querySelectorAll('#recommendations-container .recommend-item');
    if (items.length === 0) return;

    if (selectedRecommendIndex >= items.length) {
        selectedRecommendIndex = items.length - 1;
    }
    if (selectedRecommendIndex < 0) {
        selectedRecommendIndex = 0;
    }

    items.forEach((item, idx) => {
        if (idx === selectedRecommendIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function navigateRecommendSelection(dir) {
    const items = document.querySelectorAll('#recommendations-container .recommend-item');
    if (items.length === 0) return;

    selectedRecommendIndex += dir;
    if (selectedRecommendIndex < 0) selectedRecommendIndex = 0;
    if (selectedRecommendIndex >= items.length) selectedRecommendIndex = items.length - 1;

    updateSelectedRecommendUI();
}

function fillSelectedRecommendation() {
    const items = document.querySelectorAll('#recommendations-container .recommend-item');
    if (items.length === 0) return;

    if (selectedRecommendIndex < 0 || selectedRecommendIndex >= items.length) {
        selectedRecommendIndex = 0;
    }

    const targetItem = items[selectedRecommendIndex];
    if (targetItem) {
        targetItem.click();
    }
}

// 1. 첫 턴 사전 계산 추천 단어 즉시 렌더링 (0ms 대기)
function renderDefaultRecommendations(len) {
    const data = PRECALCULATED_STARTERS[len] || PRECALCULATED_STARTERS[5];
    document.getElementById('cand-count').innerText = data.total;

    const recContainer = document.getElementById('recommendations-container');
    if (!recContainer) return;

    recContainer.innerHTML = '';
    data.list.forEach((rec, idx) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'recommend-item';
        itemDiv.onclick = function() {
            selectedRecommendIndex = idx;
            updateSelectedRecommendUI();
            selectRecommendWord(rec.word);
        };

        itemDiv.innerHTML = `
            <span class="rec-word">${rec.word}</span>
            <span class="rec-remain-val">${rec.remain}</span>
        `;
        recContainer.appendChild(itemDiv);
    });

    selectedRecommendIndex = 0;
    updateSelectedRecommendUI();

    const candContainer = document.getElementById('candidates-container');
    if (candContainer) {
        candContainer.innerHTML = '<div class="placeholder-text" style="grid-column: 1 / -1; width: 100%;">후보 단어가 30개 이하가 되면 전체 목록이 여기에 표시됩니다.</div>';
    }
}

// 2. 입력 필드 및 힌트 선택기 초기화
function initInputFields() {
    tileStates = new Array(currentJamoLen).fill('grey');
    renderNumberLabels();
    renderInputTiles();
    renderHintSelector();
    updateAddButtonState();
}

// 2-1. 숫자 레이블 렌더링 (힌트 타일 위 1~7 표시)
function renderNumberLabels() {
    const container = document.getElementById('hint-number-label');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < currentJamoLen; i++) {
        const label = document.createElement('span');
        label.className = 'hint-number';
        label.innerText = (i + 1);
        container.appendChild(label);
    }
}

// 3. 자모 입력 타일 렌더링
function renderInputTiles() {
    const container = document.getElementById('input-tiles-container');
    if (!container) return;
    container.innerHTML = '';
    inputs = [];

    for (let i = 0; i < currentJamoLen; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tile-input';
        input.maxLength = 2; // 한글 결합 대응
        input.dataset.index = i;

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.length > 0) {
                const char = val.charAt(val.length - 1);
                if (char === 'ㅐ') {
                    input.value = 'ㅏ';
                    if (i < currentJamoLen - 1) {
                        inputs[i + 1].value = 'ㅣ';
                        if (i < currentJamoLen - 2) {
                            inputs[i + 2].focus();
                        } else {
                            inputs[i + 1].focus();
                        }
                    }
                } else if (char === 'ㅔ') {
                    input.value = 'ㅓ';
                    if (i < currentJamoLen - 1) {
                        inputs[i + 1].value = 'ㅣ';
                        if (i < currentJamoLen - 2) {
                            inputs[i + 2].focus();
                        } else {
                            inputs[i + 1].focus();
                        }
                    }
                } else {
                    input.value = char;
                    if (i < currentJamoLen - 1) {
                        inputs[i + 1].focus();
                    }
                }
            }
            updateAddButtonState();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && i > 0) {
                inputs[i - 1].focus();
            } else if (e.key === 'ArrowLeft' && i > 0) {
                inputs[i - 1].focus();
            } else if (e.key === 'ArrowRight' && i < currentJamoLen - 1) {
                inputs[i + 1].focus();
            }
        });

        container.appendChild(input);
        inputs.push(input);
    }
}

// 4. 힌트 색상 선택 버튼 렌더링
function renderHintSelector() {
    const container = document.getElementById('hint-selector-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < currentJamoLen; i++) {
        const stateKey = tileStates[i] || 'grey';
        const stateObj = stateMap[stateKey] || stateMap['grey'];

        const btn = document.createElement('div');
        btn.className = 'hint-btn ' + stateObj.class;
        btn.innerText = stateObj.text;
        btn.title = `${i+1}번 키 또는 클릭으로 상태 변경`;
        btn.onclick = (function(index) {
            return function() { toggleTileState(index); };
        })(i);

        container.appendChild(btn);
    }
}

// 5. 힌트 타일 상태 토글 (회색 -> 노랑 -> 초록 -> 회색)
function toggleTileState(idx) {
    const currentState = tileStates[idx] || 'grey';
    const nextState = stateMap[currentState].next;
    tileStates[idx] = nextState;
    renderHintSelector();
}

// 6. [추가] 버튼 활성화 여부
function updateAddButtonState() {
    const btnAdd = document.getElementById('btn-add');
    if (!btnAdd) return;
    const allFilled = inputs.length === currentJamoLen && inputs.every(inp => inp && inp.value.trim() !== '');
    btnAdd.disabled = !allFilled;
}

// 7. 추천 단어 클릭 시 입력 칸에 자모 분해하여 자동 채우기
function selectRecommendWord(word) {
    const jamos = decomposeKoreanWord(word);
    initInputFields();

    for (let i = 0; i < Math.min(jamos.length, currentJamoLen); i++) {
        if (inputs[i]) {
            inputs[i].value = jamos[i];
        }
    }
    updateAddButtonState();
    showToast("'" + word + "' 단어가 자모(" + jamos.join('') + ")로 입력되었습니다!", "info");
}

// 8. 현재 입력행 비우기
function resetInputRow() {
    initInputFields();
}

// 9. 자모 모드 전환 (5자모, 6자모, 7자모)
function switchMode(len) {
    if (currentJamoLen === len) return;
    currentJamoLen = len;

    document.getElementById('tab-5').classList.toggle('active', len === 5);
    document.getElementById('tab-6').classList.toggle('active', len === 6);
    document.getElementById('tab-7').classList.toggle('active', len === 7);

    history = [];
    initInputFields();
    updateHistoryUI();
    renderDefaultRecommendations(len);
}

// 10. 현재 추측 추가 및 추천 실행
function addCurrentGuess() {
    const currentJamos = inputs.map(inp => inp.value.trim());
    if (currentJamos.length !== currentJamoLen || currentJamos.some(j => !j)) {
        showToast("모든 자모 칸을 채워주세요.", "warning");
        return;
    }

    const hintValues = tileStates.map(st => stateMap[st].value); // '회', '노', '초'
    const wordStr = currentJamos.join('');

    history.push({
        word: wordStr,
        hint: hintValues
    });

    initInputFields();
    updateHistoryUI();
    fetchRecommendation();
}

// 11. 전체 초기화
function resetAll() {
    history = [];
    initInputFields();
    updateHistoryUI();
    renderDefaultRecommendations(currentJamoLen);
    showToast("전체 기록이 초기화되었습니다.", "info");
}

// 12. 히스토리 항목 삭제
function deleteHistoryItem(index) {
    history.splice(index, 1);
    updateHistoryUI();
    if (history.length === 0) {
        renderDefaultRecommendations(currentJamoLen);
    } else {
        fetchRecommendation();
    }
}

// 13. 히스토리 UI 업데이트
function updateHistoryUI() {
    const container = document.getElementById('history-container');
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = '<div class="placeholder-text">아직 입력된 기록이 없습니다. 추천 단어로 시작해 보세요!</div>';
        return;
    }

    container.innerHTML = '';
    history.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';

        const wordDiv = document.createElement('div');
        wordDiv.className = 'history-word';

        const jamos = item.word.split('');
        for (let i = 0; i < currentJamoLen; i++) {
            const tile = document.createElement('div');
            const hintVal = item.hint[i];
            let stateClass = 'state-grey';
            if (hintVal === '노') stateClass = 'state-yellow';
            if (hintVal === '초') stateClass = 'state-green';

            tile.className = 'history-tile ' + stateClass;
            tile.innerText = jamos[i] || '';
            wordDiv.appendChild(tile);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.innerText = '삭제';
        deleteBtn.onclick = function() { deleteHistoryItem(index); };

        itemDiv.appendChild(wordDiv);
        itemDiv.appendChild(deleteBtn);
        container.appendChild(itemDiv);
    });
}

let currentSolveId = 0;

// 14. 프론트엔드 실시간 연산 및 추천 단어 가져오기 (캐시 우선 검사)
async function fetchRecommendation() {
    const solveId = ++currentSolveId;

    if (history.length === 0) {
        renderDefaultRecommendations(currentJamoLen);
        return;
    }

    // 캐시 우선 확인
    const cachedData = getCachedRecommendation(history, currentJamoLen);
    if (cachedData) {
        renderRecommendationResult(cachedData);
        return;
    }

    try {
        document.getElementById('cand-count').innerText = "...";
        const recContainer = document.getElementById('recommendations-container');
        recContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-secondary); width: 100%;"><div class="spinner" style="margin: 0 auto 1rem auto; width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top: 3px solid var(--text-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>수만 가지 경우의 수를 비트마스킹 연산하여 최적 단어를 추천 중입니다...</div>';

        await new Promise(resolve => setTimeout(resolve, 50));

        const data = await solveWordle(history, currentJamoLen, () => currentSolveId !== solveId);

        if (currentSolveId !== solveId || (data && data.aborted)) {
            return;
        }

        if (data && data.success) {
            setCachedRecommendation(history, data, currentJamoLen);
            renderRecommendationResult(data);
        } else {
            showToast('추천 연산 중 에러가 발생했습니다.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('연산 처리 중 오류가 발생했습니다.', 'error');
    }
}

// 추천 결과 DOM 렌더링 헬퍼 (심플한 단어 + 평균 남은 단어 수)
function renderRecommendationResult(data) {
    document.getElementById('cand-count').innerText = data.remain_count.toLocaleString();

    const recContainer = document.getElementById('recommendations-container');
    if (!recContainer) return;

    recContainer.innerHTML = '';

    if (data.recommendations && data.recommendations.length > 0) {
        data.recommendations.forEach((rec, idx) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'recommend-item';
            itemDiv.onclick = function() {
                selectedRecommendIndex = idx;
                updateSelectedRecommendUI();
                selectRecommendWord(rec.word);
            };

            itemDiv.innerHTML = `
                <span class="rec-word">${rec.word}</span>
                <span class="rec-remain-val">${rec.expected_remain}개</span>
            `;
            recContainer.appendChild(itemDiv);
        });
    } else {
        recContainer.innerHTML = '<div class="placeholder-text" style="width: 100%;">조건에 일치하는 추천 단어가 없습니다. 입력된 힌트를 다시 확인해주세요.</div>';
    }

    selectedRecommendIndex = 0;
    updateSelectedRecommendUI();

    const candContainer = document.getElementById('candidates-container');
    if (candContainer) {
        if (data.full_list && data.full_list.length > 0) {
            candContainer.innerHTML = '';
            data.full_list.forEach(word => {
                const badge = document.createElement('div');
                badge.className = 'candidate-badge';
                badge.innerText = word;
                badge.onclick = function() { selectRecommendWord(word); };
                badge.title = '클릭하여 입력창에 채우기';
                candContainer.appendChild(badge);
            });
        } else {
            candContainer.innerHTML = '<div class="placeholder-text" style="grid-column: 1 / -1; width: 100%;">후보 단어가 30개 이하가 되면 전체 목록이 여기에 표시됩니다. (현재 남은 후보: ' + data.remain_count.toLocaleString() + '개)</div>';
        }
    }
}

// 초기 앱 로드 및 복원 (새로고침 시 항상 깨끗하게 초기화)
function initCheatApp() {
    try {
        localStorage.removeItem('wordle_cheat_history_v2_5');
        localStorage.removeItem('wordle_cheat_history_v2_6');
        localStorage.removeItem('wordle_cheat_history_v2_7');
    } catch (e) {}
    history = [];
    initInputFields();
    updateHistoryUI();
    renderDefaultRecommendations(currentJamoLen);
}
