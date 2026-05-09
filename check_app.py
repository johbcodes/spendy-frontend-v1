import re

path = 'src/App.tsx'
lines = open(path, encoding='utf-8').readlines()
print('Lines:', len(lines))

targets = ['walletAPI', 'inventoryService', 'createTransaction', 'walletService']
for i, l in enumerate(lines):
    if any(t in l for t in targets):
        print(i+1, l.rstrip()[:100].encode('ascii','replace').decode())
