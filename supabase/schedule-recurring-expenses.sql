-- Before running this script:
-- 1. Deploy the process-recurring-expenses Edge Function.
-- 2. Set CRON_SECRET in the Supabase Edge Function secrets.
-- 3. Replace the secret placeholder below with the CRON_SECRET configured
--    for the Edge Function. Do not commit the real secret to this file.
-- 4. Replace the project URL with this Supabase project's URL.
-- Run this script once in the Supabase SQL Editor.

select vault.create_secret(
  'https://xplimfyrnzelrxmrrbri.supabase.co',
  'recurring_expenses_project_url'
);

select vault.create_secret(
  'REPLACE_WITH_CRON_SECRET_CONFIGURED_ON_THE_EDGE_FUNCTION',
  'recurring_expenses_cron_secret'
);

select cron.schedule(
  'process-recurring-expenses-daily',
  '5 0 * * *',
  $job$
    select net.http_post(
      url := (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'recurring_expenses_project_url'
      ) || '/functions/v1/process-recurring-expenses',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'recurring_expenses_cron_secret'
        )
      ),
      body := '{}'::jsonb
    );
  $job$
);
