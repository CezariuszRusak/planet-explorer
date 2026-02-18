-- Query 1: The "Goldilocks" Search
-- Find planets that are likely rocky (Radius < 2 Earths) 
-- and have an equilibrium temperature between 200K and 320K (habitable-ish).
SELECT pl_name, hostname, pl_rade, pl_eqt, sy_dist 
FROM ? 
WHERE pl_rade < 2.0 
  AND pl_eqt > 200 
  AND pl_eqt < 320
ORDER BY sy_dist ASC;

-- Query 2: The "Tatooine" Search
-- Find planets in systems with 2 or more stars (Circumbinary candidates).
SELECT pl_name, hostname, sy_snum, pl_orbper 
FROM ? 
WHERE sy_snum >= 2
ORDER BY sy_snum DESC, pl_orbper ASC;

-- Query 3: The "Kepler's Legacy" Stats
-- Count planets discovered by year and method.
SELECT disc_year, discoverymethod, COUNT(*) as complexity
FROM ? 
WHERE pl_name LIKE '%Kepler%' OR pl_name LIKE '%TESS%' OR pl_name LIKE '%b%'
GROUP BY disc_year, discoverymethod 
ORDER BY complexity DESC;
