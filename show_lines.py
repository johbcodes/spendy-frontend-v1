path = 'src/App.tsx'
lines = open(path, encoding='utf-8').readlines()
for i in range(573, 615):
    print(i+1, lines[i].rstrip()[:90].encode('ascii','replace').decode())
