import urllib.request
req = urllib.request.Request('https://wordle-helper-khaki.vercel.app/', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    html = response.read().decode('utf-8')
    with open('frontend.html', 'w', encoding='utf-8') as f:
        f.write(html)
