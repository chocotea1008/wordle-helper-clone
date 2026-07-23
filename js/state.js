const stateMap = {
    'grey': { class: 'state-grey', text: '회색', value: '회', next: 'yellow' },
    'yellow': { class: 'state-yellow', text: '노랑', value: '노', next: 'green' },
    'green': { class: 'state-green', text: '초록', value: '초', next: 'grey' }
};

let currentJamoLen = 5;
let tileStates = [];
let inputs = [];
let history = [];

let currentGameLen = 5;
let gameAnswer = "";
let gameAnswerJamos = [];
let gameHistory = [];
let currentTypedJamos = [];
const MAX_GUESSES = 5; // 5번의 기회
let gameOver = false;