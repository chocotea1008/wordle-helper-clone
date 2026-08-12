"""
Full Recursive Optimal Solve Simulation — TRUE PARALLEL (16 cores)
"""
import json, time, sys, io, re, os
from collections import defaultdict, Counter
from multiprocessing import Pool, cpu_count

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# --- Jamo ---
CHOSUNG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
JUNGSUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"
JONGSUNG = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"]
CHO_SUB = {'ㄲ':['ㄱ','ㄱ'],'ㄸ':['ㄷ','ㄷ'],'ㅃ':['ㅂ','ㅂ'],'ㅆ':['ㅅ','ㅅ'],'ㅉ':['ㅈ','ㅈ']}
JUNG_SUB = {'ㅐ':['ㅏ','ㅣ'],'ㅒ':['ㅑ','ㅣ'],'ㅔ':['ㅓ','ㅣ'],'ㅖ':['ㅕ','ㅣ'],'ㅘ':['ㅗ','ㅏ'],'ㅙ':['ㅗ','ㅏ','ㅣ'],'ㅚ':['ㅗ','ㅣ'],'ㅝ':['ㅜ','ㅓ'],'ㅞ':['ㅜ','ㅓ','ㅣ'],'ㅟ':['ㅜ','ㅣ'],'ㅢ':['ㅡ','ㅣ']}
JONG_SUB = {'ㄲ':['ㄱ','ㄱ'],'ㄳ':['ㄱ','ㅅ'],'ㄵ':['ㄴ','ㅈ'],'ㄶ':['ㄴ','ㅎ'],'ㄺ':['ㄹ','ㄱ'],'ㄻ':['ㄹ','ㅁ'],'ㄼ':['ㄹ','ㅂ'],'ㄽ':['ㄹ','ㅅ'],'ㄾ':['ㄹ','ㅌ'],'ㄿ':['ㄹ','ㅍ'],'ㅀ':['ㄹ','ㅎ'],'ㅄ':['ㅂ','ㅅ'],'ㅆ':['ㅅ','ㅅ']}

def decompose(word):
    result = []
    for ch in word:
        code = ord(ch)
        if 0xAC00 <= code <= 0xD7A3:
            c = code - 0xAC00
            cho, jung, jong = c//588, (c%588)//28, c%28
            cho_c, jung_c, jong_c = CHOSUNG[cho], JUNGSUNG[jung], JONGSUNG[jong]
            result.extend(CHO_SUB.get(cho_c, [cho_c]))
            result.extend(JUNG_SUB.get(jung_c, [jung_c]))
            if jong_c: result.extend(JONG_SUB.get(jong_c, [jong_c]))
        else: result.append(ch)
    return tuple(result)

def get_pattern(gj, aj):
    n = len(gj)
    pat = [0]*n; au = [False]*n; gu = [False]*n
    for i in range(n):
        if gj[i] == aj[i]: pat[i] = 2; au[i] = True; gu[i] = True
    for i in range(n):
        if not gu[i]:
            for j in range(n):
                if not au[j] and gj[i] == aj[j]: pat[i] = 1; au[j] = True; break
    return tuple(pat)

def find_best_guess(remaining):
    """Greedy: pick word minimizing expected remaining."""
    if len(remaining) <= 2:
        return remaining[0]
    best = None; best_s = float('inf')
    for gw, gj in remaining:
        bk = defaultdict(int)
        for _, tj in remaining:
            bk[get_pattern(gj, tj)] += 1
        s = sum(c*c for c in bk.values()) / len(remaining) - 0.01  # bonus for being a candidate
        if s < best_s: best_s = s; best = (gw, gj)
    return best

def simulate_one(args):
    """Simulate one game. Called per worker."""
    tw, tj_list, sj_list, cands = args
    tj = tuple(tj_list); sj = tuple(sj_list)
    # Reconstruct cands as list of tuples
    remaining = [(w, tuple(j)) for w, j in cands]
    
    # Turn 1
    p = get_pattern(sj, tj)
    if all(x == 2 for x in p): return (tw, 1)
    remaining = [(w, j) for w, j in remaining if get_pattern(sj, j) == p]
    
    for turn in range(2, 11):
        if len(remaining) == 0: return (tw, 10)
        if len(remaining) == 1: return (tw, turn)
        g = find_best_guess(remaining)
        p = get_pattern(g[1], tj)
        if all(x == 2 for x in p): return (tw, turn)
        remaining = [(w, j) for w, j in remaining if get_pattern(g[1], j) == p]
    return (tw, 10)

def main():
    # Load data
    with open('solver.js', 'r', encoding='utf-8') as f:
        text = f.read()
    pos = text.find('ALL_WORDS = ['); end = text.find('];', pos)
    ALL_WORDS = json.loads(f"[{text[pos+13:end]}]")
    
    with open('js/commonWords.js', 'r', encoding='utf-8') as f:
        cw_text = f.read()
    p1 = cw_text.find('{'); p2 = cw_text.rfind('}') + 1
    common_dict = json.loads(re.sub(r'(\d+):', r'"\1":', cw_text[p1:p2]))
    
    word_jamos = {w: decompose(w) for w in ALL_WORDS}
    STARTERS = {5: "가위", 6: "안식", 7: "옷가지"}
    
    print("=" * 70)
    print("  Full Parallel Optimal Solve Simulation (16 cores)")
    print("=" * 70)
    
    results = {}
    ncpu = min(cpu_count(), 14)  # Leave 2 cores free
    
    for jamo_len in [5, 6, 7]:
        starter = STARTERS[jamo_len]
        sj = list(decompose(starter))
        
        all_cands = [(w, list(word_jamos[w])) for w in ALL_WORDS if len(word_jamos[w]) == jamo_len]
        target_words = common_dict[str(jamo_len)]
        targets = [(w, list(decompose(w))) for w in target_words if len(decompose(w)) == jamo_len]
        
        print(f"\n[{jamo_len}-jamo] Starter='{starter}' | {len(targets)} targets | {len(all_cands):,} cands | {ncpu} workers")
        t0 = time.time()
        
        # Build args for each game
        args_list = [(tw, tj, sj, all_cands) for tw, tj in targets]
        
        turn_counts = []
        game_results = []
        
        with Pool(ncpu) as pool:
            for result in pool.imap_unordered(simulate_one, args_list, chunksize=4):
                game_results.append(result)
                if len(game_results) % 50 == 0:
                    avg = sum(t for _, t in game_results) / len(game_results)
                    print(f"  ... {len(game_results)}/{len(targets)} ({time.time()-t0:.1f}s) avg={avg:.2f}")
        
        elapsed = time.time() - t0
        
        turn_counts = [t for _, t in game_results]
        avg_turns = sum(turn_counts) / len(turn_counts)
        dist = Counter(turn_counts)
        hardest = sorted([(w, t) for w, t in game_results if t >= 4], key=lambda x: -x[1])
        
        r = {
            "starter": starter,
            "total": len(targets),
            "avg": round(avg_turns, 3),
            "max": max(turn_counts),
            "distribution": {str(k): v for k, v in sorted(dist.items())},
            "hardest": [{"word": w, "turns": t} for w, t in hardest[:10]],
            "rate_3": round(sum(1 for t in turn_counts if t <= 3) / len(turn_counts) * 100, 1),
            "rate_4": round(sum(1 for t in turn_counts if t <= 4) / len(turn_counts) * 100, 1),
            "rate_5": round(sum(1 for t in turn_counts if t <= 5) / len(turn_counts) * 100, 1),
            "time": round(elapsed, 1)
        }
        results[jamo_len] = r
        
        print(f"\n  [{jamo_len}-jamo] '{starter}' | avg={avg_turns:.3f} turns | {elapsed:.1f}s")
        for t in sorted(dist.keys()):
            pct = dist[t] / len(turn_counts) * 100
            print(f"    {t}T: {dist[t]:>4} ({pct:>5.1f}%) {'#'*dist[t]}")
        print(f"    <=3T: {r['rate_3']}% | <=4T: {r['rate_4']}% | <=5T: {r['rate_5']}%")
        if hardest:
            print(f"    Hardest: {', '.join(f'{w}({t}T)' for w,t in hardest[:5])}")
    
    with open('simulation_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\nDone! Saved to simulation_results.json")

if __name__ == '__main__':
    main()
