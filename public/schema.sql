-- Example schema used throughout the book. Loaded into SQLite in the browser.
-- 1,000 employees in three subsidiaries (10: 300, 20: 500, 30: 200); 20,000 sales.
CREATE TABLE employees (
  employee_id   INTEGER NOT NULL,
  subsidiary_id INTEGER NOT NULL,
  first_name    TEXT    NOT NULL,
  last_name     TEXT    NOT NULL,
  date_of_birth TEXT    NOT NULL,
  phone_number  TEXT    NOT NULL,
  PRIMARY KEY (employee_id, subsidiary_id)
);

WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 1000)
INSERT INTO employees
SELECT
  i,
  CASE WHEN i % 10 = 0 THEN 20 WHEN i % 10 = 1 THEN 10 WHEN i % 10 = 2 THEN 20 WHEN i % 10 = 3 THEN 30
       WHEN i % 10 = 4 THEN 20 WHEN i % 10 = 5 THEN 10 WHEN i % 10 = 6 THEN 20 WHEN i % 10 = 7 THEN 30
       WHEN i % 10 = 8 THEN 20 ELSE 10 END,
  CASE (i * 7) % 12 WHEN 0 THEN 'Markus' WHEN 1 THEN 'Anna' WHEN 2 THEN 'Luke' WHEN 3 THEN 'Maria' WHEN 4 THEN 'Jonas'
       WHEN 5 THEN 'Priya' WHEN 6 THEN 'Wei' WHEN 7 THEN 'Sofia' WHEN 8 THEN 'Ahmed' WHEN 9 THEN 'Elena' WHEN 10 THEN 'Tom' ELSE 'Yuki' END,
  CASE (i * 13) % 15 WHEN 0 THEN 'Winand' WHEN 1 THEN 'Berger' WHEN 2 THEN 'Skywalker' WHEN 3 THEN 'Rossi' WHEN 4 THEN 'Schmidt'
       WHEN 5 THEN 'Patel' WHEN 6 THEN 'Chen' WHEN 7 THEN 'Garcia' WHEN 8 THEN 'Hassan' WHEN 9 THEN 'Novak' WHEN 10 THEN 'Baker'
       WHEN 11 THEN 'Tanaka' WHEN 12 THEN 'Mueller' WHEN 13 THEN 'Dubois' ELSE 'Olsen' END,
  date('1960-01-01', '+' || ((i * 37) % 14600) || ' days'),
  '+43 1 ' || printf('%03d', (i * 31) % 1000) || ' ' || printf('%04d', i)
FROM n;

CREATE TABLE sales (
  sale_id       INTEGER PRIMARY KEY,
  employee_id   INTEGER NOT NULL,
  subsidiary_id INTEGER NOT NULL,
  sale_date     TEXT    NOT NULL,
  eur_value     REAL    NOT NULL,
  product_id    INTEGER NOT NULL,
  quantity      INTEGER NOT NULL
);

WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 20000)
INSERT INTO sales
SELECT
  i,
  ((i * 7919) % 1000) + 1,
  (SELECT subsidiary_id FROM employees WHERE employee_id = ((i * 7919) % 1000) + 1),
  date('2024-01-01', '+' || ((i * 17) % 640) || ' days'),
  round(((i * 131) % 9000) / 10.0 + 9.9, 2),
  ((i * 53) % 300) + 1,
  (i % 5) + 1
FROM n;

ANALYZE;
