-- SQL Import for Game 11

UPDATE games SET 
  score1 = 7, 
  hits1 = 10, 
  errors1 = 0,
  score2 = 1, 
  hits2 = 6, 
  errors2 = 2,
  innings = '[["0","1"],["0","0"],["0","0"],["0","0"],["0","0"],["5","0"],["2","0"]]'::jsonb
WHERE id = 11;

INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (98861118, 11, '{"plateAppearances":4,"atBats":2,"runs":1,"hits":1,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":1,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (52386720, 11, '{"plateAppearances":3,"atBats":3,"runs":1,"hits":1,"doubles":0,"triples":0,"homeRuns":0,"rbi":1,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":1}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (42275288, 11, '{"plateAppearances":4,"atBats":3,"runs":1,"hits":2,"doubles":1,"triples":0,"homeRuns":0,"rbi":1,"walks":1,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":1}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (5678272, 11, '{"plateAppearances":4,"atBats":3,"runs":0,"hits":1,"doubles":0,"triples":0,"homeRuns":0,"rbi":2,"walks":1,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (41229219, 11, '{"plateAppearances":4,"atBats":3,"runs":1,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":1,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":2,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (30836482, 11, '{"plateAppearances":2,"atBats":2,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":2,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (12370076, 11, '{"plateAppearances":4,"atBats":4,"runs":2,"hits":3,"doubles":1,"triples":1,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (37459114, 11, '{"plateAppearances":4,"atBats":4,"runs":1,"hits":1,"doubles":0,"triples":0,"homeRuns":0,"rbi":1,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":1}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (15911672, 11, '{"plateAppearances":3,"atBats":2,"runs":0,"hits":1,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":1,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":1}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (42011607, 11, '{"plateAppearances":1,"atBats":1,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (49146410, 11, '{"plateAppearances":2,"atBats":2,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (97109790, 11, '{"plateAppearances":1,"atBats":1,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (67403199, 11, '{"plateAppearances":3,"atBats":3,"runs":1,"hits":2,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (83079288, 11, '{"plateAppearances":3,"atBats":3,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (81137644, 11, '{"plateAppearances":4,"atBats":3,"runs":0,"hits":1,"doubles":0,"triples":0,"homeRuns":0,"rbi":1,"walks":1,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":2,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (87712866, 11, '{"plateAppearances":3,"atBats":3,"runs":0,"hits":1,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (70117645, 11, '{"plateAppearances":3,"atBats":3,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":2,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (55021783, 11, '{"plateAppearances":2,"atBats":2,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (32915982, 11, '{"plateAppearances":2,"atBats":1,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (47427498, 11, '{"plateAppearances":1,"atBats":1,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (13970298, 11, '{"plateAppearances":1,"atBats":1,"runs":0,"hits":1,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (89326611, 11, '{"plateAppearances":1,"atBats":1,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (60140572, 11, '{"plateAppearances":2,"atBats":2,"runs":0,"hits":1,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":0,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
-- WARNING: Player not found: Kiukukawa Tomoki
INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (55021783, 11, '{"plateAppearances":1,"atBats":1,"runs":0,"hits":0,"doubles":0,"triples":0,"homeRuns":0,"rbi":0,"walks":0,"hitByPitch":0,"sacHits":0,"sacFlies":0,"strikeOuts":1,"stolenBases":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();

INSERT INTO pitching_stats (player_id, game_id, stats) 
VALUES (12436576, 11, '{"inningsPitched":2,"hits":3,"runs":1,"earnedRuns":1,"walks":0,"strikeOuts":0,"homeRuns":0,"wins":0,"losses":0,"saves":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO pitching_stats (player_id, game_id, stats) 
VALUES (45188375, 11, '{"inningsPitched":2.33,"hits":2,"runs":0,"earnedRuns":0,"walks":1,"strikeOuts":3,"homeRuns":0,"wins":1,"losses":0,"saves":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO pitching_stats (player_id, game_id, stats) 
VALUES (69901414, 11, '{"inningsPitched":2.67,"hits":1,"runs":0,"earnedRuns":0,"walks":0,"strikeOuts":4,"homeRuns":0,"wins":0,"losses":0,"saves":1}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO pitching_stats (player_id, game_id, stats) 
VALUES (50664520, 11, '{"inningsPitched":6,"hits":7,"runs":5,"earnedRuns":2,"walks":5,"strikeOuts":8,"homeRuns":0,"wins":0,"losses":1,"saves":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
INSERT INTO pitching_stats (player_id, game_id, stats) 
VALUES (36843736, 11, '{"inningsPitched":1,"hits":3,"runs":2,"earnedRuns":2,"walks":0,"strikeOuts":3,"homeRuns":0,"wins":0,"losses":0,"saves":0}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();
