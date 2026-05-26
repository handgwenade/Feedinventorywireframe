-- Grant API role access for authenticated users.
-- RLS policies still control which rows authenticated users can access.

grant usage on schema public to authenticated;

grant select on public.organizations to authenticated;
grant select on public.user_profiles to authenticated;
grant select on public.product_categories to authenticated;
grant select on public.products to authenticated;
grant select on public.accounts to authenticated;
grant select on public.people to authenticated;
grant select on public.invoice_records to authenticated;
grant select on public.invoice_line_items to authenticated;
grant select on public.inventory_transactions to authenticated;
grant select on public.payments to authenticated;
grant select on public.activity_logs to authenticated;
grant select on public.app_settings to authenticated;
