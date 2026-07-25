import re, json

with open('solver.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Inspect solveWordle function in solver.js
pos = text.find('function solveWordle')
print(text[pos:pos+1500])
