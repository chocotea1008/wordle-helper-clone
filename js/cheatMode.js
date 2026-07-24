// --- 치트키 (Wordle Solver) 모드 컨트롤러 ---

// 1. 기본 추천 단어 (첫 턴) 렌더링
function renderDefaultRecommendations(len) {
    const recContainer = document.getElementById('recommendations-container');
    if (!recContainer) return;

    if (len === 5) {
        document.getElementById('cand-count').innerText = '23,713';
        recContainer.innerHTML = `
            <div class="recommend-item" onclick="selectRecommendWord('기낭')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">균형 추천 (최적)</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">기낭</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">첫 턴에 수학적으로 가장 안정적이고 많은 정보를 얻을 수 있는 추천 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남는 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">526.3개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('가외')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">직접 타격 (정답 후보)</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">가외</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">첫 턴에 바로 정답을 노려볼 수 있으면서도 매우 높은 정보 획득량을 가집니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남는 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">426.8개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('가위')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">일상 단어 우선</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">가위</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">가장 친숙한 일상 단어 중 정보 획득량이 가장 높은 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남는 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">460.5개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('구애')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">모음 집중 탐색</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">구애</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">모음(ㅜ, ㅏ, ㅣ)을 집중적으로 탐색하여 모음 구성을 빠르게 파악합니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남는 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">462.0개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('강리')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">자모 다양성 (필터링)</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">강리</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">다양한 자음과 모음을 골고루 사용하여 초반 넓은 범위를 필터링합니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남는 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">491.3개</span>
                </div>
            </div>
        `;
    } else if (len === 6) {
        document.getElementById('cand-count').innerText = '45,163';
        recContainer.innerHTML = `
            <div class="recommend-item" onclick="selectRecommendWord('한국')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">최고 추천 (총점)</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">한국</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">정확히 6자모(ㅎ,ㅏ,ㄴ,ㄱ,ㅜ,ㄱ)로 구성된 최적의 첫 추천 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">125.4개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('삭제')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">직접 타격 (정답 후보)</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">삭제</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">복합모음 ㅔ(ㅓ+ㅣ)를 포함한 6자모(ㅅ,ㅏ,ㄱ,ㅈ,ㅓ,ㅣ) 강력한 탐색 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">142.0개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('바나나')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">3글자 6자모 추천</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">바나나</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">3글자 6자모(ㅂ,ㅏ,ㄴ,ㅏ,ㄴ,ㅏ)로 친숙한 일상 대표 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">158.2개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('산길')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">자음/모음 균형</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">산길</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">받침 ㄴ, ㄹ을 테스트할 수 있는 6자모(ㅅ,ㅏ,ㄴ,ㄱ,ㅣ,ㄹ) 추천 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">130.5개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('물결')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">자모 다양성</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">물결</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">모음 ㅜ, ㅕ를 테스트하는 6자모(ㅁ,ㅜ,ㄹ,ㄱ,ㅕ,ㄹ) 추천 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">135.1개</span>
                </div>
            </div>
        `;
    } else if (len === 7) {
        document.getElementById('cand-count').innerText = '23,435';
        recContainer.innerHTML = `
            <div class="recommend-item" onclick="selectRecommendWord('손뼉')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">2글자 7자모 (최고)</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">손뼉</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">2글자 7자모(ㅅ,ㅗ,ㄴ,ㅂ,ㅂ,ㅕ,ㄱ) 쌍자음 ㅃ을 포함한 강력 추천 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">110.2개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('상고지')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">3글자 7자모 (최적)</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">상고지</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">3글자 7자모(ㅅ,ㅏ,ㅇ,ㄱ,ㅗ,ㅈ,ㅣ) 높은 정보 획득량 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">69.2개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('고동로')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">정답 타격 (단어 후보)</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">고동로</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">7자모(ㄱ,ㅗ,ㄷ,ㅗ,ㅇ,ㄹ,ㅗ) 유력한 탐색 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">470.8개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('알구지')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">일반 추천</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">알구지</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">안정적인 필터링 능력을 보여주는 7자모 추천 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">69.7개</span>
                </div>
            </div>
            <div class="recommend-item" onclick="selectRecommendWord('오락지')">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">일반 추천</span>
                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">오락지</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">안정적인 필터링 능력을 보여주는 7자모 추천 단어입니다.</p>
                </div>
                <div style="text-align: right; min-width: 85px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">70.0개</span>
                </div>
            </div>
        `;
    } else {
        recContainer.innerHTML = '<div class="placeholder-text" style="padding: 2rem; color: var(--text-secondary); grid-column: 1 / -1; width: 100%;">알 수 없는 자모 길이입니다.</div>';
    }

    const candContainer = document.getElementById('candidates-container');
    if (candContainer) {
        candContainer.innerHTML = `
            <div class="placeholder-text" style="grid-column: 1 / -1; width: 100%;">
                후보 단어가 30개 이하가 되면 전체 목록이 여기에 표시됩니다.
            </div>
        `;
    }
}

// 2. 입력 필드 및 힌트 선택기 초기화
function initInputFields() {
    tileStates = new Array(currentJamoLen).fill('grey');
    renderInputTiles();
    renderHintSelector();
    updateAddButtonState();
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
                input.value = val.charAt(val.length - 1);
                if (i < currentJamoLen - 1) {
                    inputs[i + 1].focus();
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
        btn.className = 'tile-hint ' + stateObj.class;
        btn.innerText = stateObj.text;
        btn.title = '클릭하여 힌트 상태 변경 (회색 -> 노랑 -> 초록)';
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

// 6. [확인 및 추가] 버튼 활성화 여부
function updateAddButtonState() {
    const btnAdd = document.getElementById('btn-add');
    if (!btnAdd) return;
    const allFilled = inputs.length === currentJamoLen && inputs.every(inp => inp.value.trim() !== '');
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
    showToast("'" + word + "' 단어가 자모(" + jamos.join('') + ")로 입력되었습니다!");
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
        showToast("모든 자모 칸을 채워주세요.");
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
    showToast("전체 기록이 초기화되었습니다.");
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
        container.innerHTML = '<div class="placeholder-text">아직 입력된 기록이 없습니다. 첫 턴 추천 단어로 시작해 보세요!</div>';
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

// 14. 프론트엔드 실시간 연산 및 추천 단어 가져오기
async function fetchRecommendation() {
    const solveId = ++currentSolveId;

    if (history.length === 0) {
        renderDefaultRecommendations(currentJamoLen);
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
            document.getElementById('cand-count').innerText = data.remain_count.toLocaleString();

            recContainer.innerHTML = '';

            if (data.recommendations && data.recommendations.length > 0) {
                data.recommendations.forEach(rec => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'recommend-item';
                    itemDiv.onclick = function() { selectRecommendWord(rec.word); };

                    itemDiv.innerHTML = '<div style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; text-align: left;"><span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">' + rec.strategy + '</span><span style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">' + rec.word + '</span><p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">' + rec.reason + '</p></div><div style="text-align: right; min-width: 85px;"><span style="font-size: 0.7rem; color: var(--text-secondary); display: block; line-height: 1.2;">평균 남은 단어</span><span style="font-size: 1rem; font-weight: 700; color: var(--color-green);">' + rec.expected_remain + '개</span></div>';
                    recContainer.appendChild(itemDiv);
                });
            } else {
                recContainer.innerHTML = '<div class="placeholder-text" style="width: 100%;">조건에 일치하는 추천 단어가 없습니다. 입력된 힌트를 다시 확인해주세요.</div>';
            }

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
        } else {
            showToast('추천 연산 중 에러가 발생했습니다.');
        }
    } catch (err) {
        console.error(err);
        showToast('연산 처리 중 오류가 발생했습니다.');
    }
}
