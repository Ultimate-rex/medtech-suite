-- Add RLS policy for admin_users - only allow read via edge function (no direct access)
CREATE POLICY "Admin users not directly accessible"
ON public.admin_users
FOR SELECT
USING (false);