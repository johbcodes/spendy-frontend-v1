/**
 * Migration Helper
 *
 * Run this once to migrate event categories to expense categories
 * if categories were added to the wrong place before the fix
 */

export function migrateEventCategoriesToExpenseCategories() {
  try {
    const systemDataStr = localStorage.getItem('spendy_systemdata');
    if (!systemDataStr) {
      console.log('No system data found');
      return;
    }

    const systemData = JSON.parse(systemDataStr);

    // Check if there are event categories but no expense categories
    const hasEventCategories = systemData.eventcategorys && systemData.eventcategorys.length > 0;
    const hasExpenseCategories = systemData.expensecategorys && systemData.expensecategorys.length > 0;

    console.log('Current state:');
    console.log('- Event Categories:', systemData.eventcategorys?.length || 0);
    console.log('- Expense Categories:', systemData.expensecategorys?.length || 0);
    console.log('- Operation Categories:', systemData.operationcategorys?.length || 0);
    console.log('- Activation Categories:', systemData.activationcategorys?.length || 0);

    // If you want to copy event categories to expense categories
    if (hasEventCategories && !hasExpenseCategories) {
      console.log('\nMigrating event categories to expense categories...');

      systemData.expensecategorys = [...(systemData.eventcategorys || [])];
      localStorage.setItem('spendy_systemdata', JSON.stringify(systemData));

      console.log('✅ Migration complete!');
      console.log('Copied', systemData.expensecategorys.length, 'categories to expense categories');

      return true;
    }

    console.log('\nNo migration needed.');
    return false;

  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}

/**
 * View current categories in localStorage
 */
export function viewCurrentCategories() {
  try {
    const systemDataStr = localStorage.getItem('spendy_systemdata');
    if (!systemDataStr) {
      console.log('No system data found');
      return;
    }

    const systemData = JSON.parse(systemDataStr);

    console.log('=== CURRENT CATEGORIES ===');
    console.log('\n📊 Event Categories:', systemData.eventcategorys?.length || 0);
    (systemData.eventcategorys || []).forEach((cat: any, i: number) => {
      console.log(`  ${i + 1}. ${cat.name || cat}`);
    });

    console.log('\n💰 Expense Categories:', systemData.expensecategorys?.length || 0);
    (systemData.expensecategorys || []).forEach((cat: any, i: number) => {
      console.log(`  ${i + 1}. ${cat.name || cat}`);
    });

    console.log('\n⚙️ Operation Categories:', systemData.operationcategorys?.length || 0);
    (systemData.operationcategorys || []).forEach((cat: any, i: number) => {
      console.log(`  ${i + 1}. ${cat.name || cat}`);
    });

    console.log('\n🎯 Activation Categories:', systemData.activationcategorys?.length || 0);
    (systemData.activationcategorys || []).forEach((cat: any, i: number) => {
      console.log(`  ${i + 1}. ${cat.name || cat}`);
    });

  } catch (error) {
    console.error('Error viewing categories:', error);
  }
}

/**
 * Clear all event/operation/activation categories
 * (Use if you want to start fresh)
 */
export function clearEventCategories() {
  try {
    const systemDataStr = localStorage.getItem('spendy_systemdata');
    if (!systemDataStr) {
      console.log('No system data found');
      return;
    }

    const systemData = JSON.parse(systemDataStr);

    systemData.eventcategorys = [];
    systemData.operationcategorys = [];
    systemData.activationcategorys = [];

    localStorage.setItem('spendy_systemdata', JSON.stringify(systemData));

    console.log('✅ Cleared all event/operation/activation categories');
    console.log('Expense categories remain intact');

  } catch (error) {
    console.error('Error clearing categories:', error);
  }
}

// Make these available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).viewCategories = viewCurrentCategories;
  (window as any).migrateCategories = migrateEventCategoriesToExpenseCategories;
  (window as any).clearEventCategories = clearEventCategories;

  console.log('🔧 Migration helpers loaded. Available commands:');
  console.log('  - viewCategories() - View all categories');
  console.log('  - migrateCategories() - Migrate event categories to expense categories');
  console.log('  - clearEventCategories() - Clear event/operation/activation categories');
}
