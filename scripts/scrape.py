import asyncio
import aiohttp
import json
import itertools

WORDS_5 = set()
WORDS_7 = set()

async def fetch(session, history, jamo_len):
    payload = {'history': history, 'jamo_len': jamo_len}
    try:
        async with session.post('https://wordle-helper-khaki.vercel.app/api/recommend', json=payload) as resp:
            data = await resp.json()
            return data
    except:
        return None

async def explore(session, jamo_len, target_words_set):
    # Just do a random walk or systematic? 
    # Actually, if we just send random hints for a few random words, we might not get everything.
    # To get everything, we need to cover all 22847 words.
    pass

