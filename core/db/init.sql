CREATE DATABASE IF NOT EXISTS openresponse_development;
CREATE USER IF NOT EXISTS 'dev_admin'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON openresponse_development.* TO 'dev_admin'@'%';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS openresponse_test;
CREATE USER IF NOT EXISTS 'test_admin'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON openresponse_test.* TO 'test_admin'@'%';
FLUSH PRIVILEGES;
