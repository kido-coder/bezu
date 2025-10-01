select * from command_log;
SELECT c.cmd_date, n.node_id, s.state_name, c.cmd_ajiltan, com.command_name
FROM command_log c
LEFT JOIN node_log l
ON c.cmd_log = l.log_id
INNER JOIN node n
ON l.log_node = n.node_id
INNER JOIN state s
ON s.state_id = l.log_state
INNER JOIN command com
ON c.cmd_command = com.command_id;
 
SELECT * FROM command_log;
SELECT log_id from node_log WHERE log_node = "#0001" ORDER BY log_date DESC LIMIT 1;

SELECT c.cmd_date, n.node_id, n.node_name, s.state_name, c.cmd_ajiltan, com.command_name FROM command_log c LEFT JOIN node_log l ON c.cmd_log = l.log_id INNER JOIN node n ON l.log_node = n.node_id INNER JOIN state s ON s.state_id = l.log_state INNER JOIN command com ON c.cmd_command = com.command_id ORDER BY c.cmd_date DESC;

SELECT n.node_id, n.node_name, l.log_state, l.log_sys_state, s.state_name, l.log_us_state, l.log_hs_state
		FROM (SELECT * FROM node) n
		LEFT JOIN (SELECT nl.log_state, nl.log_sys_state, nl.log_us_state, nl.log_hs_state, nl.log_node
		FROM node_log nl
		JOIN (
			SELECT log_node, MAX(log_date) AS max_log_date
			FROM node_log
			GROUP BY log_node
		) latest_logs
		ON nl.log_node = latest_logs.log_node AND nl.log_date = latest_logs.max_log_date) l
		ON n.node_id = l.log_node
		LEFT JOIN state s
		ON l.log_state = s.state_id LIMIT 5;
    
SELECT distinct log_node, log_date, log_state FROM node_log GROUP BY log_node ORDER BY log_date DESC;

SELECT nl.*
FROM node_log nl
JOIN (
    SELECT log_node, MAX(log_date) AS max_log_date
    FROM node_log
    GROUP BY log_node
) latest_logs
ON nl.log_node = latest_logs.log_node AND nl.log_date = latest_logs.max_log_date;

SELECT n.node_id, n.node_name, l.log_state, l.log_sys_state, s.state_name, l.log_us_state, l.log_hs_state
		FROM (SELECT * FROM node WHERE node_id="#0004") n
		LEFT JOIN (SELECT nl.log_state, nl.log_sys_state, nl.log_us_state, nl.log_hs_state, nl.log_node
		FROM node_log nl
		JOIN (
			SELECT log_node, MAX(log_date) AS max_log_date
			FROM node_log
			GROUP BY log_node
		) latest_logs
		ON nl.log_node = latest_logs.log_node AND nl.log_date = latest_logs.max_log_date) l
		ON n.node_id = l.log_node
		LEFT JOIN state s
		ON l.log_state = s.state_id ORDER BY n.node_id ASC LIMIT 1;
        
#Үзлэг дээр хэрэглэх
INSERT INTO node_log VALUES 
	(null, '#0001', '2024-04-01 16:59:12', 'E0001', 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
    (null, '#0002', '2024-04-01 01:59:13', 'E0001', 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 12.51, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    (null, '#0003', '2024-04-01 12:59:14', 'E0001', 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 12.9, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0),
    (null, '#0004', '2024-04-01 18:59:15', 'E0001', 125, 125, 125, 125, 125, 125, 125, 125, 125, 125, 125, 125, 125, 125, 125, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
    (null, '#0005', '2024-04-01 17:59:38', 'E0001', 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1);

use contor;

SELECT * FROM node
                WHERE node_id LIKE "%001%"
                   OR node_name LIKE "%001%"
                   OR node_address LIKE "%001%";

SELECT log_id
FROM node_log WHERE log_node = '#0002'
ORDER BY log_date DESC
LIMIT 1;

SELECT n.node_id, n.node_name, l.log_state, l.log_sys_state, s.state_name, l.log_us_state, l.log_hs_state
		FROM (SELECT * FROM node) n
		LEFT JOIN (SELECT nl.log_state, nl.log_sys_state, nl.log_us_state, nl.log_hs_state, nl.log_node
		FROM node_log nl
		JOIN (
			SELECT log_node, MAX(log_date) AS max_log_date
			FROM node_log
			GROUP BY log_node
		) latest_logs
		ON nl.log_node = latest_logs.log_node AND nl.log_date = latest_logs.max_log_date) l
		ON n.node_id = l.log_node
		LEFT JOIN state s
		ON l.log_state = s.state_id ORDER BY n.node_id ASC LIMIT 5;

SELECT * FROM node_log WHERE log_node = "#0005" ORDER BY log_date DESC LIMIT 1;

SELECT * FROM node_log WHERE log_node = "#0002" ORDER BY log_date DESC LIMIT 15;

SELECT * FROM node_log WHERE (log_date BETWEEN '2023-12-31 11:00' AND '2023-12-31 12:00') AND log_node="#0002";

use contor;
SELECT COUNT(*) FROM ajiltan;
SELECT COUNT(*) as num FROM node
UNION
SELECT COUNT(*) as num FROM ajiltan;

SELECT n.node_id, n.node_name, l.log_state, l.log_sys_state, s.state_name, l.log_us_state, l.log_hs_state, star.star_node
		FROM (SELECT * FROM node) n
		LEFT JOIN (SELECT nl.log_state, nl.log_sys_state, nl.log_us_state, nl.log_hs_state, nl.log_node
		FROM node_log nl
		JOIN (
			SELECT log_node, MAX(log_date) AS max_log_date
			FROM node_log
			GROUP BY log_node
		) latest_logs
		ON nl.log_node = latest_logs.log_node AND nl.log_date = latest_logs.max_log_date) l
		ON n.node_id = l.log_node
		LEFT JOIN state s
		ON l.log_state = s.state_id 
        LEFT JOIN (SELECT * FROM star WHERE star_ajil = 'A.EN001') star
        ON n.node_id = star.star_node ORDER BY n.node_id;
        
	SELECT * FROM star;
    
SELECT * FROM node_log WHERE (log_date BETWEEN '2023-12-31' AND '2023-12-31') AND log_node="#0002";

SELECT * FROM ajiltan;
DELETE FROM node WHERE node_id = "#0001";
SELECT a.ajiltan_id, a.ajiltan_ovog, a.ajiltan_ner, a.ajiltan_utas, a.ajiltan_email, t.turul_ner FROM ajiltan a LEFT JOIN ajiltan_turul t ON a.ajiltan_turul = t.turul_id;

SELECT n.node_id, n.node_name, l.log_state, l.log_sys_state, s.state_name, l.log_us_state, l.log_hs_state, star.star_node
		FROM (SELECT * FROM node) n
		LEFT JOIN (SELECT nl.log_state, nl.log_sys_state, nl.log_us_state, nl.log_hs_state, nl.log_node
		FROM node_log nl
		JOIN (
			SELECT log_node, MAX(log_date) AS max_log_date
			FROM node_log
			GROUP BY log_node
		) latest_logs
		ON nl.log_node = latest_logs.log_node AND nl.log_date = latest_logs.max_log_date) l
		ON n.node_id = l.log_node
		LEFT JOIN state s
		ON l.log_state = s.state_id 
        LEFT JOIN (SELECT * FROM star WHERE star_ajil = "A.EN001") star
        ON n.node_id = star.star_node ORDER BY star.star_node, n.node_id DESC;

INSERT INTO node VALUES ('#0008', 'Test', 'Test');
select * from command_log;
select * from ajiltan;
update ajiltan set ajiltan_pass='5678' where ajiltan_id='A.EN003';
SELECT a.ajiltan_id, a.ajiltan_ovog,  a.ajiltan_ner, a.ajiltan_utas, a.ajiltan_email, t.turul_ner
FROM (select * from ajiltan where ajiltan_id='A.DC001') a
LEFT JOIN ajiltan_turul t
ON a.ajiltan_turul = t.turul_id;

INSERT INTO ajiltan VALUES
	('A.EN003', 'Сумъяабаатар', 'Дуламбаяр', '80243304', 'dulmaa@gmail.com', '1234', 1);
    SELECT * FROM node_log WHERE log_node = "#0001" ORDER BY log_date DESC LIMIT 1;
SELECT c.cmd_date, n.node_id, n.node_name, s.state_name, c.cmd_ajiltan, com.command_name FROM command_log c LEFT JOIN node_log l ON c.cmd_log = l.log_id INNER JOIN node n ON l.log_node = n.node_id INNER JOIN state s ON s.state_id = l.log_state INNER JOIN command com ON c.cmd_command = com.command_id ORDER BY c.cmd_date DESC;
SELECT * FROM node_log;
UPDATE ajiltan
                 SET
                 ajiltan_ovog = "Гүнжэ", ajiltan_ner = "Үнжэ", ajiltan_utas = "95959595", ajiltan_email = "unje@gmail.com"
                 WHERE ajiltan_id = "A.EN001";

SELECT * FROM command_log WHERE cmd_ajiltan = "A.EN001";

SELECT * FROM node_log WHERE log_node="#0005";
SELECT * FROM node_log WHERE (log_date BETWEEN "2024-05-09 00:00" AND "2024-05-10 23:59") AND log_node="#0005";

INSERT INTO ajiltan VALUES ('A.AD001', 'Лхагвасүрэн', 'Анужин', '94333838', 'b200920040@gmail.com', '1234', 2);

SELECT turul_ner, COUNT(ajiltan_turul) as num FROM ajiltan
LEFT JOIN ajiltan_turul
ON ajiltan_turul.turul_id = ajiltan_turul GROUP BY ajiltan_turul;

SELECT turul_id  as title ,COUNT(*) as num from ajiltan_turul;
select * from star;
use contor;
SELECT COUNT(*) as num FROM node
UNION
SELECT COUNT(*) FROM ajiltan;
select * from node;
