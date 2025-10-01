DROP DATABASE contor;

CREATE DATABASE contor;

USE contor;

SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

CREATE TABLE ajiltan_turul (
	turul_id		INT 			NOT NULL,
    turul_ner		VARCHAR(20)		NOT NULL,
    turul_heltes	VARCHAR(50)		NOT NULL,
    
    PRIMARY KEY (turul_id));
                                                 
CREATE TABLE ajiltan (
	ajiltan_id		VARCHAR(7)		NOT NULL,
    ajiltan_ovog	VARCHAR(30)		,
    ajiltan_ner		VARCHAR(30)		NOT NULL,
    ajiltan_utas	VARCHAR(8)		NOT NULL,
    ajiltan_email	VARCHAR(50)		,
    ajiltan_pass	VARCHAR(50)		DEFAULT '1234',
    ajiltan_turul	INT				DEFAULT 1,
    
    PRIMARY KEY (ajiltan_id),
    FOREIGN KEY (ajiltan_turul) REFERENCES	ajiltan_turul(turul_id) ON DELETE CASCADE);

CREATE TABLE node (
	node_id			VARCHAR(5)		NOT NULL,
    node_name		VARCHAR(20)		NOT NULL,
    node_address	VARCHAR(500),
    
    PRIMARY KEY (node_id));
    
CREATE TABLE state (
	state_id		VARCHAR(5)		NOT NULL,
    state_name		VARCHAR(20)		NOT NULL,
    state_lvl		TINYINT			NOT NULL,
    state_info		VARCHAR(100)		NOT NULL,
    
    PRIMARY KEY (state_id));

CREATE TABLE node_log (
	log_id			BIGINT			AUTO_INCREMENT		NOT NULL,
    log_node		VARCHAR(5)		NOT NULL,
    log_date		DATETIME		NOT NULL,
    log_state		VARCHAR(5)		,
    log_t11			FLOAT 			NOT NULL,
    log_t12			FLOAT 			NOT NULL,
    log_t21			FLOAT 			NOT NULL,
    log_t22			FLOAT 			NOT NULL,
    log_t31			FLOAT 			NOT NULL,
    log_t41			FLOAT 			NOT NULL,
    log_t42			FLOAT 			NOT NULL,
    log_p11			FLOAT 			NOT NULL,
    log_p12			FLOAT 			NOT NULL,
    log_p21			FLOAT 			NOT NULL,
    log_p22			FLOAT 			NOT NULL,
    log_p32			FLOAT 			NOT NULL,
    log_p41			FLOAT 			NOT NULL,
    log_p42			FLOAT 			NOT NULL,
    log_p52			FLOAT 			NOT NULL,
    log_sys_state	SMALLINT			NOT NULL,
    log_nasos1		SMALLINT			NOT NULL,
    log_nasos2		SMALLINT			NOT NULL,
    log_nasos3		SMALLINT			NOT NULL,
    log_us_state	SMALLINT			NOT NULL,
    log_us_nasos1	SMALLINT			NOT NULL,
    log_us_nasos2	SMALLINT			NOT NULL,
    log_hs_state	SMALLINT			NOT NULL,
    log_hs_nasos1	SMALLINT			NOT NULL,
    log_hs_nasos2	SMALLINT			NOT NULL,
    
    PRIMARY KEY (log_id),
    FOREIGN KEY (log_node) REFERENCES node(node_id) ON DELETE CASCADE,
    FOREIGN KEY (log_state) REFERENCES state(state_id) ON DELETE SET NULL);

CREATE TABLE command (
	command_id		VARCHAR(4)		NOT NULL,
    command_name	VARCHAR(50)		NOT NULL,
    command_info	VARCHAR(500),
    
    PRIMARY KEY (command_id));

CREATE TABLE star (
	star_id		 INT AUTO_INCREMENT,
    star_node	 VARCHAR(5)		NOT NULL,
    star_ajil	 VARCHAR(7)		NOT NULL,
    
    PRIMARY KEY (star_id),
    FOREIGN KEY (star_node) REFERENCES node(node_id) ON DELETE CASCADE,
    FOREIGN KEY (star_ajil) REFERENCES ajiltan(ajiltan_id) ON DELETE CASCADE);
    
CREATE TABLE command_log (
	cmd_id			INT 			AUTO_INCREMENT		NOT NULL,
    cmd_date		DATETIME		NOT NULL,
    cmd_log			BIGINT			NOT NULL,
    cmd_ajiltan		VARCHAR(7)		NOT NULL,
    cmd_command		VARCHAR(4)		,
    
    PRIMARY KEY (cmd_id),
    FOREIGN KEY (cmd_log) REFERENCES node_log(log_id) ON DELETE CASCADE,
    FOREIGN KEY (cmd_ajiltan) REFERENCES ajiltan(ajiltan_id) ON DELETE CASCADE,
    FOREIGN KEY (cmd_command) REFERENCES command(command_id) ON DELETE SET NULL);
    