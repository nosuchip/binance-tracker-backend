# Binance tracker

# Database

Create database from under `root` account:

```
CREATE USER 'binance_dev'@'%' IDENTIFIED BY '94d2eb967a364ea79a29a690f3e8d95f';
CREATE DATABASE binance_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON binance_staging.* TO 'binance_dev'@'%';
FLUSH PRIVILEGES;
```
