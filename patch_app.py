import sys

path = 'src/App.tsx'
lines = open(path, encoding='utf-8').readlines()
print('Before:', len(lines))

# Verify line 255 is the wallet state comment
print('Line 255:', lines[254].rstrip()[:60])
print('Line 422:', lines[421].rstrip()[:60])
print('Line 525:', lines[524].rstrip()[:60])
print('Line 758:', lines[757].rstrip()[:60])

# Replace from bottom to top

# 1. inventoryMovements block: 0-indexed 757-801
lines[757:802] = [
    '  // InventoryMovements - owned by inventory controller\n',
    '  const inventoryMovements = invCtrl.inventoryMovements;\n',
]

# 2. transactions block: 0-indexed 524-540
lines[524:541] = [
    '  // Transactions - owned by wallet controller\n',
    '  const transactions = walletCtrl.transactions;\n',
    '  const setTransactions = walletCtrl.setTransactions;\n',
]

# 3. inventory block: 0-indexed 421-440
lines[421:441] = [
    '  // Inventory - owned by feature controller\n',
    '  const invCtrl = useInventoryController(currentUser);\n',
    '  const inventory = invCtrl.inventory;\n',
    '  const setInventory = invCtrl.setInventory;\n',
]

# 4. wallets block: 0-indexed 254-317
lines[254:318] = [
    '  // Wallets - owned by feature controller\n',
    '  const walletCtrl = useWalletController(currentUser);\n',
    '  const wallets = walletCtrl.wallets;\n',
    '  const setWallets = walletCtrl.setWallets;\n',
]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('After:', len(lines))
print('walletCtrl lines:', [i+1 for i,l in enumerate(lines) if 'walletCtrl' in l][:5])
print('invCtrl lines:', [i+1 for i,l in enumerate(lines) if 'invCtrl' in l][:5])
