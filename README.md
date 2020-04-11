(Currently only for MySQL Databases. Updates Coming Soon. Interested contributors can get in touch with adwaithrk19@gmail.com)

This is a command line npm utility for running queries sequentially from a .sql file.

What it does is, it runs queries and removes the ones that are successfull from the .sql file. When one query breaks it show the DB status and exits. One can resume execution by correcting the query (Which will present at the top of the file) and running the command.

ark-sql-runner -f production.sql -h localhost -u root -p password -d dbname