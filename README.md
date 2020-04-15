arl-sql-runner
=======

(Currently only for MySQL Databases. Updates Coming Soon. Interested contributors can get in touch with adwaithrk19@gmail.com)

This is a command line npm utility for running queries sequentially from a *.sql file.

"ark-sql-runner" runs queries and removes the ones that are successfull from the .sql file. When one query breaks it show the DB status and exits. One can resume execution by correcting the query (Which will present at the top of the file) and running the command.

```bash
ark-sql-runner -f production.sql -h localhost -u root -p password -d dbname
```


## Installation

You can install `ark-sql-runner` using `npm`:

``` bash
$ npm install -g ark-sql-runner
```

## Usage :

ark-sql-runner need db credentials to run queries (Taking credentials from the Enviroment (.env) file will be implemented soon. ) 
    
    Command Line arguments:


        * -f or --file --> for the .sql file (If extension is not .sql error will be  
           shown). Default Value: "queries.sql"

        * -h or --host --> for the db host server. Default Value: "localhost"

        * -u or --user --> for the db user name. Default Value: "root"

        * -p or --password --> for db password. Default Value: "password"

        * -d or --database --> for the database name. Default Value: "database"

        * -l or --log --> (OPTIONAL) 'boolean flag' Log file name is taken same as *.sql file name. Default Value: "queries.log"(as file  name is "queries.log")

        * -s or --save --> (OPTIONAL) 'boolean flag' For saving DB credentials for future use.


### For saving db credentials

1. Pass the flag `-s`  for saving the DB credentials for future use.
    ```bash
    ark-sql-runner -f production.sql -h localhost -u root -p password -d dbname -s
    ```

2. Next time just pass the file name without db credentials.
    ```bash
    ark-sql-runner -f production.sql
    ```

3. Answer the prompt to use the saved credentials.
    ```sh
      Have found saved config details
      The  config is--- { host: 'localhost',
                        user: 'root',
                        password: 'password',
                        database: 'database' }
      Do you want to use it(Y/N) ? y
    ```

### For help use 

```bash
ark-sql-runner --help
```
