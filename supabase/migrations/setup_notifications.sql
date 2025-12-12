-- Enable Row Level Security on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  applicant_id IN (
    SELECT id FROM public.applicants WHERE auth_id = auth.uid()
  )
);

-- Policy: Users can update their own notifications (for marking as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  applicant_id IN (
    SELECT id FROM public.applicants WHERE auth_id = auth.uid()
  )
)
WITH CHECK (
  applicant_id IN (
    SELECT id FROM public.applicants WHERE auth_id = auth.uid()
  )
);

-- Policy: Authenticated users can insert notifications (for system/admin use)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_applicant_id ON public.notifications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create function to automatically set updated_at timestamp if column exists
-- Note: The notifications table doesn't have updated_at, but this is for future use
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_notifications_updated_at'
  ) THEN
    -- Only create if updated_at column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'notifications' AND column_name = 'updated_at'
    ) THEN
      CREATE TRIGGER set_notifications_updated_at
      BEFORE UPDATE ON public.notifications
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
    END IF;
  END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT INSERT ON public.notifications TO authenticated;

-- Add helpful comment
COMMENT ON TABLE public.notifications IS 'Stores notifications for applicants with RLS enabled';
