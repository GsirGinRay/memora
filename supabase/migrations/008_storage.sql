-- Storage buckets for card media
insert into storage.buckets (id, name, public)
values
  ('card-images', 'card-images', true),
  ('card-audio', 'card-audio', true);

-- Storage policies
create policy "Users can upload card images"
  on storage.objects for insert
  with check (
    bucket_id = 'card-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view card images"
  on storage.objects for select
  using (bucket_id = 'card-images');

create policy "Users can delete own card images"
  on storage.objects for delete
  using (
    bucket_id = 'card-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload card audio"
  on storage.objects for insert
  with check (
    bucket_id = 'card-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view card audio"
  on storage.objects for select
  using (bucket_id = 'card-audio');

create policy "Users can delete own card audio"
  on storage.objects for delete
  using (
    bucket_id = 'card-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
