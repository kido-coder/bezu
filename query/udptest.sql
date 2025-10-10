DROP DATABASE udptest;

CREATE DATABASE udptest;

USE udptest;

CREATE TABLE node (
	node_id		VARCHAR(50)		NOT NULL,
    node_ip		VARCHAR(15)		NOT NULL,
    node_port	VARCHAR(8)		NOT NULL,
    
    PRIMARY KEY (node_id));
    
CREATE TABLE transaction_test (
	t_id		INT 			NOT NULL AUTO_INCREMENT,
    t_ner		VARCHAR(20)		NOT NULL,
    t_num		VARCHAR(50)		NOT NULL,
    
    PRIMARY KEY (t_id));
    
SELECT * FROM transaction_test;