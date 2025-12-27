-- Run this in your Supabase SQL Editor

ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS pix_key TEXT;
