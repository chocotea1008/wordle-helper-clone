import urllib.request
import json
payload = {'history': [], 'jamo_len': 7}
req = urllib.request.Request('https://wordle-helper-khaki.vercel.app/api/recommend', data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
response = urllib.request.urlopen(req)
data = json.loads(response.read().decode('utf-8'))
print(f"jamo_len: 7, remain_count: {data['remain_count']}")
