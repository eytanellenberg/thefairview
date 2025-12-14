import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type UserTier = 'free' | 'premium' | 'club';

export interface UserProfile {
  id: string;
  email: string;
  tier: UserTier;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_end_date?: string;
  created_at: string;
}
