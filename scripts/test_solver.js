const fs = require('fs');
const html = fs.readFileSync('frontend.html', 'utf-8');
let solverJS = fs.readFileSync('solver.js', 'utf-8');
solverJS = solverJS.replace('const ALL_WORDS', 'var ALL_WORDS');

const start = html.indexOf('function decomposeKoreanWord');
const end = html.indexOf('}', html.indexOf('return result;', start)) + 1;
const decomposeFunc = html.substring(start, end);

eval(decomposeFunc);
eval(solverJS);

console.log("Decomposed '기낭':", decomposeKoreanWord('기낭'));
console.log("All words count:", ALL_WORDS.length);

const candidates = [];
for (let i = 0; i < ALL_WORDS.length; i++) {
    const word = ALL_WORDS[i];
    const jamos = decomposeKoreanWord(word);
    if (jamos.length === 5) candidates.push(word);
}
console.log("Words with length 5:", candidates.length);

const history = [{ word: '기낭', hint: ['노', '회', '회', '회', '회'] }];
console.log("Solve Wordle:", solveWordle(history, 5));
