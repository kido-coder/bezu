const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const moment = require('moment')
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://172.16.200.237:3002',  // or your domain
  credentials: true
}));
app.use(cookieParser('b13n3d1pl0m11gh11jduuschaadun7ana'));

const database = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Mhtsshataasai!@#",
    database: "contor"
})

app.post('/admin', (req, res) => {
    var action = req.body.action;
    if (action == 'getAjiltanLavlah') {
        var query = "SELECT * FROM ajiltan_turul";
        database.query(query, function (err, data) {
            res.json(data);
        })
    }
    if (action == 'getStateLavlah') {
        var query = "SELECT * FROM state";
        database.query(query, function (err, data) {
            res.json(data);
            res.end();
        })
    }
    if (action == 'getCommandLavlah') {
        var query = "SELECT * FROM command";
        database.query(query, function (err, data) {
            res.json(data);
            res.end();
        })
    }

    if (action == 'usertype') {
        var query = `SELECT turul_ner, COUNT(ajiltan_turul) as num FROM ajiltan
        LEFT JOIN ajiltan_turul
        ON ajiltan_turul.turul_id = ajiltan_turul GROUP BY ajiltan_turul;`
        database.query(query, function (err, data) {
            res.json(data);
            res.end();
        })
    }

    if (action == 'one') {
        var query = `SELECT COUNT(*) as num from ajiltan_turul;`
        database.query(query, function (err, data) {
            res.json(data)
        })
    }
    if (action == 'two') {
        var query = `SELECT COUNT(*) as num from state;`
        database.query(query, function (err, data) {
            res.json(data)
        })
    }
    if (action == 'three') {
        var query = `SELECT COUNT(*) as num from command;`
        database.query(query, function (err, data) {
            res.json(data)
        })
    }
});
app.post('/login', (req, res) => {
    let username = req.body.username.toUpperCase();
    let password = req.body.password;

    if (username && password) {
        var query = `
		SELECT * FROM ajiltan WHERE ajiltan_id = "${username}" AND ajiltan_pass = "${password}";
		`;
        database.query(query, function (error, data) {
            if (error) throw error;
            if (data.length > 0) {
                res.json({
                    message: 'Амжилттай нэвтэрлээ',
                    type: data[0].ajiltan_turul
                });
            } else {
                res.json({
                    message: 'Нэвтрэх нэр/нууц үг буруу байна'
                });
            }
            res.end();
        });
    } else {
        res.json({
            message: 'Нэвтрэх нэр нууц үгээ оруулна уу!'
        })
        res.end();
    }
})

app.post('/header', (req, res) => {
    var query = `SELECT COUNT(*) as num FROM node
                    UNION
                    SELECT COUNT(*) FROM ajiltan;`
    database.query(query, function (err, data) {
        res.json({
            data: data
        })
    })
})

app.post('/profile', (req, res) => {
    var id = req.body.userID
    var updated = req.body.newP
    var old = req.body.old

    var demo = `SELECT ajiltan_id FROM ajiltan WHERE ajiltan_id = "${id}" AND ajiltan_pass = "${old}"`
    database.query(demo, function (err, data) {
        if (err) throw err;
        if (data.length > 0) {
            var query = `update ajiltan set ajiltan_pass="${updated}" where ajiltan_id="${id}";`
            database.query(query, function (err, data) {
                res.json({
                    message: "Амжилттай шинэчлэгдлээ"
                })
            })
        } else {
            res.json({
                message: "Өмнөх нууц үг буруу байна"
            })
        }
    })
})
app.post("/mid", function (req, res) {
    var action = req.body.action;
    // home
    if (action == 'fav_node') {
        var id = req.body.userID;
        var query = `SELECT n.node_id, n.node_name, l.log_state, l.log_sys_state, s.state_name, l.log_us_state, l.log_hs_state, star.star_node
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
        RIGHT JOIN (SELECT * FROM star WHERE star_ajil = "${id}") star
        ON n.node_id = star.star_node ORDER BY n.node_id;`;
        database.query(query, function (error, data) {
            res.json({
                data: data
            });
        });
    }
    // log
    if (action == 'log') {
        var node = req.body.node
        var start = req.body.start
        var end = req.body.end

        var query = `SELECT * FROM node_log WHERE (log_date BETWEEN "${start} 00:00" AND "${end} 23:59") AND log_node="${node}";`
        console.log(query)
        database.query(query, function (error, data) {
            res.json({
                data: data
            });
        });
    }
    // statistic
    if (action == 'statistic') {
        var node = req.body.node
        var date = req.body.date

        var query = `SELECT * FROM node_log WHERE (log_date BETWEEN "${date} 00:00" AND "${date} 23:59") AND log_node="${node}";`
        database.query(query, function (error, data) {
            res.json({
                data: data
            });
        });
    }
    // Profile
    if (action == 'getUser') {
        var id = req.body.userID;
        var query = `SELECT a.ajiltan_id, a.ajiltan_ovog, a.ajiltan_ner, a.ajiltan_utas, a.ajiltan_email, t.turul_ner
        FROM (select * from ajiltan where ajiltan_id="${id}") a
        LEFT JOIN ajiltan_turul t
        ON a.ajiltan_turul = t.turul_id;`
        database.query(query, function (error, data) {
            res.json(data)
        })
    }
    // nodes
    if (action == 'fetch_node') {
        var id = req.body.userID;
        var query = `SELECT n.node_id, n.node_name, l.log_state, l.log_sys_state, s.state_name, l.log_us_state, l.log_hs_state, star.star_node
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
        LEFT JOIN (SELECT * FROM star WHERE star_ajil = "${id}") star
        ON n.node_id = star.star_node ORDER BY star.star_node DESC;`;
        database.query(query, function (error, data) {
            res.json({
                data: data
            });
        });
    }

    // insertCmd
    if (action == 'add_log') {
        var node_id = req.body.id;
        var ajiltan = req.body.user;
        var cmd = req.body.cmd;
        var log_id = -1;
        var query;
        var dummy = `SELECT log_id from node_log WHERE log_node = "${node_id}" ORDER BY log_date DESC LIMIT 1;`
        database.query(dummy, function (error, data) {
            if (error)
                res.json({
                    message: 'Команд илгээхэд алдаа гарлаа'
                });
            else {
                data = JSON.stringify(data)
                data = JSON.parse(data)
                log_id = data[0].log_id
                var time = moment().format('YYYY-MM-DD hh:mm:ss');
                query = `
				INSERT INTO command_log
				VALUES (null, "${time}", ${log_id}, "${ajiltan}", "${cmd}")
				`;
                database.query(query, function (error, data) {
                    if (error) {
                        res.json({
                            message: 'Команд илгээхэд алдаа гарлаа'
                        });
                    }
                    else {
                        res.json({
                            message: 'Команд амжилттай илгээлээ'
                        });
                    }
                });
            }
        });
    }

    // дуртай зангилаа нэмэх starnode
    if (action == "star") {
        var query = ""
        if (req.body.state)
            query = `INSERT INTO star VALUES (null, "${req.body.node}", "${req.body.user}")`
        else
            query = `DELETE FROM star WHERE star_node = "${req.body.node}" AND star_ajil = "${req.body.user}"`
        database.query(query, function (error, data) {
            res.json({
                message: "done"
            });

        });
    }


    // Command log search
    if (action == 'fetch_log') {
        var id = req.body.search;
        var query = "";
        if (id.length > 5)
            query = `SELECT c.cmd_date, n.node_id, n.node_name, s.state_name, c.cmd_ajiltan, com.command_name, com.command_info FROM (SELECT * FROM command_log WHERE cmd_ajiltan = "${id}") c LEFT JOIN node_log l ON c.cmd_log = l.log_id INNER JOIN node n ON l.log_node = n.node_id INNER JOIN state s ON s.state_id = l.log_state INNER JOIN command com ON c.cmd_command = com.command_id ORDER BY c.cmd_date DESC; `;
        else
            query = `SELECT c.cmd_date, n.node_id, n.node_name, s.state_name, c.cmd_ajiltan, com.command_name, com.command_info FROM command_log c LEFT JOIN (SELECT * FROM node_log WHERE log_node = "${id}") l ON c.cmd_log = l.log_id INNER JOIN node n ON l.log_node = n.node_id INNER JOIN state s ON s.state_id = l.log_state INNER JOIN command com ON c.cmd_command = com.command_id ORDER BY c.cmd_date DESC; `;
        database.query(query, function (error, data) {
            res.json(data);
        })
    }

    // nodeInfo
    if (action == 'fetch_last_log') {
        var id = req.body.id;
        var query = `SELECT * FROM node_log WHERE log_node = "` + id + `" ORDER BY log_date DESC LIMIT 1;`;
        database.query(query, function (error, data) {
            res.json(data);
        });
    }

    // useless
    if (action == 'dash_node_log') {
        var query = `SELECT * FROM node_log ORDER BY log_date DESC LIMIT 5;`;
        database.query(query, function (error, data) {
            res.json({
                data: data
            });
        });
    }
    if (action == 'search') {
        var id = req.body.id;
        var query = `SELECT * FROM node
		WHERE node_id LIKE "%${id}%"
		   OR node_name LIKE "%${id}%"
		   OR node_address LIKE "%${id}%";`;
        database.query(query, function (error, data) {
            res.json(data);
        });
    }
    if (action == 'dash_log') {
        var query = "SELECT c.cmd_date, n.node_id, n.node_name, s.state_name, c.cmd_ajiltan, com.command_name FROM command_log c LEFT JOIN node_log l ON c.cmd_log = l.log_id INNER JOIN node n ON l.log_node = n.node_id INNER JOIN state s ON s.state_id = l.log_state INNER JOIN command com ON c.cmd_command = com.command_id ORDER BY c.cmd_date DESC LIMIT 5; ";
        database.query(query, function (error, data) {
            res.json({
                data: data
            });
        });
    }
    if (action == 'fetch_single_node_log') {
        var id = req.body.id;
        var query = `SELECT * FROM node_log WHERE log_node = "${id}" ORDER BY log_date DESC LIMIT 10;`;
        database.query(query, function (error, data) {
            res.json({
                data: data
            });
        });
    }
    if (action == 'fetch_single_node') {
        var id = req.body.id;
        var query = `SELECT n.node_id, n.node_name, l.log_state, l.log_sys_state, s.state_name, l.log_us_state, l.log_hs_state
		FROM (SELECT * FROM node WHERE node_id="${id}") n
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
		ON l.log_state = s.state_id ORDER BY n.node_id ASC LIMIT 1;`;
        database.query(query, function (error, data) {
            res.json({
                data: data
            });
        });
    }

})

app.post("/operator", function (req, res) {
    var action = req.body.action;
    if (action == 'add_node') {
        var node_id = req.body.info.node_id;
        var node_name = req.body.info.node_name;
        var node_address = req.body.info.node_address;

        var query = `
		INSERT INTO node
		VALUES ("${node_id}", "${node_name}", "${node_address}");
		`;
        database.query(query, function (error, data) {
            console.log(query)
            if (error)
                res.json({
                    message: 'Зангилаа нэмэхэд алдаа гарлаа'
                });
            else
                res.json({
                    message: 'Зангилаа амжилттай нэмэгдлээ'
                });
        });
    }
    if (action == 'fetch_single_node') {
        var id = req.body.nodeID;
        var query = `SELECT * FROM node WHERE node_id = "${id}"`;
        database.query(query, function (error, data) {
            res.json(data);
        });
    }
    if (action == 'edit_node') {
        var node_id = req.body.info.node_id;
        var node_name = req.body.info.node_name;
        var node_address = req.body.info.node_address;

        var query = `
		UPDATE node
		SET node_id = "${node_id}",
		node_name = "${node_name}",
		node_address = "${node_address}"
		WHERE node_id = "${node_id}"
		`;

        database.query(query, function (error, data) {
            res.json({
                message: 'Амжилттай засварлалаа'
            });
        });
    }
    if (action == 'delete_node') {
        var id = req.body.id;
        var query = `DELETE FROM node WHERE node_id = "${id}"`;
        database.query(query, function (error, data) {
            res.json({
                message: 'Амжилттай устгагдлаа'
            });
        });
    }
    if (action == 'add_user') {
        var ajiltan_id = req.body.info.ajiltan_id;
        var ajiltan_ner = req.body.info.ajiltan_ner;
        var ajiltan_ovog = req.body.info.ajiltan_ovog;
        var ajiltan_utas = req.body.info.ajiltan_utas;
        var ajiltan_email = req.body.info.ajiltan_email;

        var query = `
		INSERT INTO ajiltan (ajiltan_id, ajiltan_ner, ajiltan_ovog, ajiltan_utas, ajiltan_email)
		VALUES ("${ajiltan_id}", "${ajiltan_ner}", "${ajiltan_ovog}", "${ajiltan_utas}", "${ajiltan_email}");
		`;
        database.query(query, function (error, data) {
            console.log(query)
            if (error)
                res.json({
                    message: 'Хэрэглэгч нэмэхэд алдаа гарлаа!'
                });
            else
                res.json({
                    message: 'Хэрэглэгч амжилттай нэмэгдлээ'
                });
        });
    }
    if (action == 'delete_user') {
        var id = req.body.id;
        var query = `DELETE FROM ajiltan WHERE ajiltan_id = "${id}"`;
        database.query(query, function (error, data) {
            res.json({
                message: 'Амжилттай устгагдлаа'
            });
        });
    }
    if (action == 'fetch_user') {
        var query = 'SELECT a.ajiltan_id, a.ajiltan_ovog, a.ajiltan_ner, a.ajiltan_utas, a.ajiltan_email, t.turul_ner FROM ajiltan a LEFT JOIN ajiltan_turul t ON a.ajiltan_turul = t.turul_id;'
        database.query(query, function (error, data) {
            res.json(data)
        })
    }
    if (action == 'fetch_single_user') {
        var id = req.body.id
        var query = `SELECT a.ajiltan_id, a.ajiltan_ovog, a.ajiltan_ner, a.ajiltan_utas, a.ajiltan_email, t.turul_ner FROM (SELECT * FROM ajiltan WHERE ajiltan_id = "${id}") a LEFT JOIN ajiltan_turul t ON a.ajiltan_turul = t.turul_id;`
        database.query(query, function (error, data) {
            res.json(data)
        })
    }
    if (action == 'update_user') {
        var info = req.body.info;
        var query = `UPDATE ajiltan
                 SET
                 ajiltan_ovog = "${info.ajiltan_ovog}", ajiltan_ner = "${info.ajiltan_ner}", ajiltan_utas = "${info.ajiltan_utas}", ajiltan_email = "${info.ajiltan_email}"
                 WHERE ajiltan_id = "${info.ajiltan_id}"`;
        database.query(query, function (error, data) {
            res.json({
                message: "Амжилттай шинэчиллээ"
            })
        })
    }
    if (action == 'xlsx_node') {
        var id = req.body.id;
        var query = `SELECT * FROM node_log WHERE log_node = "${id}"`
        database.query(query, function (err, data) {
            res.json(data);
        })
    }
    if (action == 'xlsx_user') {
        var id = req.body.id;
        var query = `SELECT * FROM command_log WHERE cmd_ajiltan = "${id}";`
        database.query(query, function (err, data) {
            res.json(data);
        })
    }
});

app.listen(3001, () => {
    console.log("Server chini aschlaa gal uu...");
});