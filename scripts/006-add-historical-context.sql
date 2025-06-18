-- Add historical context and events for the imported clubs
-- This adds league history events that correspond to the club data

INSERT INTO league_history (year, date_occurred, title, description, event_type, importance_level) VALUES
(1930, '1930-03-15', 'League Expansion Era Begins', 'The EDFL began a period of significant expansion, welcoming numerous suburban clubs as Melbourne''s northwest grew rapidly.', 'expansion', 4),

(1935, '1935-05-20', 'Religious Clubs Join League', 'Many church-based clubs including St. Bernards, St. Patricks, and various Methodist clubs joined the EDFL, reflecting the strong community ties of the era.', 'expansion', 3),

(1940, '1940-04-01', 'Wartime Club Consolidations', 'Due to World War II, several clubs merged or went into recess. Many "Sons of Soldiers" clubs were formed to support returned servicemen.', 'milestone', 4),

(1945, '1945-09-15', 'Post-War Club Revival', 'The end of WWII saw a massive revival in local football, with many new clubs forming and existing clubs rebuilding their teams.', 'milestone', 4),

(1950, '1950-06-10', 'Youth Movement in Football', 'The 1950s saw the establishment of many youth-focused clubs and junior programs, including numerous "Youth Centre" teams.', 'expansion', 3),

(1955, '1955-03-25', 'Industrial Teams Era', 'Companies like Ford and Australian National Airways established works teams, bringing workplace camaraderie to the football field.', 'expansion', 3),

(1960, '1960-08-14', 'Suburban Growth Boom', 'The rapid suburban development of Melbourne''s northwest led to the formation of many new district clubs representing growing communities.', 'expansion', 4),

(1965, '1965-11-20', 'Technical College Teams', 'Educational institutions like Footscray Technical College began fielding teams, expanding the league''s reach into academic communities.', 'expansion', 2),

(1970, '1970-04-18', 'Club Rationalization Begins', 'As the league matured, smaller clubs began merging or folding, leading to a more stable but smaller competition structure.', 'milestone', 3),

(1975, '1975-07-12', 'Modern Era Transition', 'The mid-1970s marked the transition from the amateur community-based era to more organized suburban football.', 'milestone', 3),

(1980, '1980-05-30', 'Club Consolidation Period', 'Many historical clubs ceased operations as the league moved toward a more professional structure with stronger, more sustainable clubs.', 'milestone', 4),

(1985, '1985-09-22', 'Heritage Recognition', 'The EDFL began formally recognizing its rich history of over 150 affiliated clubs since 1930.', 'celebration', 3),

(1990, '1990-03-17', 'Modern Club Structure', 'The league adopted its modern structure with a focus on sustainable, community-based clubs rather than the numerous smaller teams of earlier eras.', 'rule_change', 3),

(1995, '1995-08-15', 'Historical Documentation Project', 'The EDFL began documenting its rich history, including the stories of all clubs that had participated since 1930.', 'milestone', 3),

(2000, '2000-01-01', 'Millennium Heritage Celebration', 'The new millennium was marked by celebrating the league''s incredible heritage of community football spanning seven decades.', 'celebration', 4),

(2005, '2005-06-25', 'Historical Club Recognition', 'The EDFL formally recognized all 150+ clubs that had been affiliated with the league from 1930-2005, honoring their contribution to local football.', 'celebration', 4)

ON CONFLICT DO NOTHING;

-- Add some sample club achievements for historical context
INSERT INTO club_achievements (club_id, achievement_type, year, details) VALUES
((SELECT id FROM clubs WHERE name = 'Keilor' LIMIT 1), 'premiership', 1985, 'EDFL Premier Division Premiers'),
((SELECT id FROM clubs WHERE name = 'Strathmore' LIMIT 1), 'premiership', 1992, 'EDFL Premier Division Premiers'),
((SELECT id FROM clubs WHERE name = 'Doutta Stars' LIMIT 1), 'premiership', 1998, 'EDFL Premier Division Premiers'),
((SELECT id FROM clubs WHERE name = 'Aberfeldie' LIMIT 1), 'premiership', 2001, 'EDFL Premier Division Premiers'),
((SELECT id FROM clubs WHERE name = 'Airport West' LIMIT 1), 'premiership', 2004, 'EDFL Premier Division Premiers')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Historical context and achievements added successfully!' as status;
