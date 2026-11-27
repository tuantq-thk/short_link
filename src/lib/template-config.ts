export type TemplateStorageMode = 'local' | 'supabase';

export const TEMPLATE_STORAGE_MODE: TemplateStorageMode = process.env.NEXT_PUBLIC_TEMPLATE_STORAGE_MODE === 'supabase'
  ? 'supabase'
  : 'local';
