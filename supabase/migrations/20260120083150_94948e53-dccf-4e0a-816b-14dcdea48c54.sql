-- Update handle_new_user trigger to accept institution_id and class_id from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, institution_id, class_id, must_change_password)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    (NEW.raw_user_meta_data ->> 'institution_id')::uuid,
    (NEW.raw_user_meta_data ->> 'class_id')::uuid,
    COALESCE((NEW.raw_user_meta_data ->> 'must_change_password')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    institution_id = COALESCE(profiles.institution_id, EXCLUDED.institution_id),
    class_id = COALESCE(profiles.class_id, EXCLUDED.class_id),
    must_change_password = COALESCE(profiles.must_change_password, EXCLUDED.must_change_password);
  RETURN NEW;
END;
$function$;