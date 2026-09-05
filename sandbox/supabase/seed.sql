-- Synthetic settings only. This sandbox never contains production bookings.
INSERT INTO public.settings (id, notification_email, notification_phone, cash_deposit_percent, free_cancellation_days, zelle_handle, paypal_email, cashapp_handle, venmo_handle)
VALUES (1, 'owner@example.test', '202-555-0100', 10, 7, 'sandbox@example.test', 'sandbox@example.test', '$SANDBOX-NO-PAYMENTS', '@SANDBOX-NO-PAYMENTS')
ON CONFLICT (id) DO NOTHING;
