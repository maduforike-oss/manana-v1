import { populateTemplatesFromStorage } from '@/lib/api/populate-templates';

// Auto-run template sync to ensure images are connected
(async () => {
  try {
    console.log('Starting template sync...');
    const result = await populateTemplatesFromStorage();
    
    if (result.success) {
      console.log(`✅ Template sync completed!`, {
        processed: result.processed,
        inserted: result.inserted,
        skipped: result.skipped
      });
    } else {
      console.error('❌ Template sync failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Template sync error:', error);
  }
})();