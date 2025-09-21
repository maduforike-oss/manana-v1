-- Update the user's profile to unlimited plan
UPDATE profiles 
SET preferences = COALESCE(preferences, '{}'::jsonb) || '{"plan": "unlimited", "max_designs": -1}'::jsonb
WHERE id = '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52';

-- Update profile metrics to ensure they exist
INSERT INTO profile_metrics (user_id, total_designs, followers, following)
VALUES ('93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', 0, 0, 0)
ON CONFLICT (user_id) DO NOTHING;