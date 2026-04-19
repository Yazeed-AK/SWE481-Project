import { createClient } from '@supabase/supabase-js';

// قراءة المتغيرات من ملف البيئة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// إطلاق خطأ فوري وإيقاف التحميل إذا كانت المتغيرات غير موجودة
if (!supabaseUrl || !supabaseKey) {
    throw new Error('⚠️ Missing Supabase environment variables. Please check your .env.local file.');
}

// إنشاء وتصدير العميل
export const db = createClient(supabaseUrl, supabaseKey);