#!/usr/bin/env node

const minimist = require("minimist");
const fs = require("fs");
const mysql = require("mysql");
const path = require("path");
const prompt = require("prompt-sync")();
let connection;

const args = minimist(process.argv.slice(2), {
  alias: {
    f: "file",
    h: "host",
    d: "database",
    p: "password",
    u: "user",
    help: "help",
    l: "log",
    s: "save",
  },
  string: ["p", "h", "d", "u", "f"],
  boolean: ["help", "l", "save"],
  default: {
    f: "queries.sql",
    h: "localhost",
    p: "password",
    d: "database",
    u: "root",
    s: false,
    help: false,
    log: false,
  },
});

const fileName = args.f;
const configFile = __dirname + "/config.dat";

main();

function connectToDBAndRunQueries() {
  if (path.extname(fileName).slice(1) === "sql") {
    let configObject = {
      host: args.h,
      user: args.u,
      password: args.p,
      database: args.d,
    };

    if (fs.existsSync(configFile)) {
      console.log("Have found saved config details");
      let config = JSON.parse(fs.readFileSync(configFile));
      console.log("The  config is---", config);
      let useConfigAnswer = prompt(" Do you want to use it(Y/N) ? ");
      if (!["n", "N"].includes(useConfigAnswer)) {
        configObject = config;
      }
    }

    connection = mysql.createConnection(configObject);

    if (args.s) {
      fs.writeFileSync(configFile, JSON.stringify(configObject));
    }

    connection.connect(function (err) {
      if (!err) {
        console.log("Database is connected ... Now Running Queries");
        RunQueries();
      } else {
        console.log("Error connecting database ... nn");
      }
    });
  } else {
    console.log(`The file type of ${fileName} is not Sql`);
    process.exit(0);
  }
}

RunQueries = async () => {
  if (!fs.existsSync(fileName)) {
    console.log(`Couldn't find file ${fileName}`);
    process.exit(0);
  }
  let queriesInFiles = fs.readFileSync(fileName, "utf8");
  let funishedQueries = queriesInFiles.replace(/[\r\n]+/gm, " ").split(";");
  for (i = 0; i < funishedQueries.length; i++) {
    if (funishedQueries[i].trim().length) {
      let finalQuery = funishedQueries[i].trim().concat(";");
      try {
        await runQuery(finalQuery, i + 1);
        if (args.l) {
          logQueryToFile(finalQuery);
        }
        console.log("\n\x1b[32m", "Successfully Executed\n");
      } catch (err) {
        if (args.l) {
          logErrorQueryToFile(err.sql, err.sqlMessage, err.code);
        }
        console.log("\x1b[31m", "\n------Error Occured-----\n");
        console.log("\x1b[37m", `The Query is: ${err.sql}\n`);
        console.log(
          "\x1b[31m",
          `\n Error is : ${err.sqlMessage}\n\n Error code: ${err.code}`
        );
        fs.truncateSync(fileName, 0);
        fs.writeFileSync(
          fileName,
          funishedQueries.splice(i, funishedQueries.length).join(";\n")
        );
        process.exit(0);
      }
    }
  }
  fs.truncateSync(fileName, 0);
  console.log(
    "SQL File is truncated AS all your queries have been run successfully"
  );
  process.exit(0);
};

function logQueryToFile(query) {
  let queryLine = `------------------------------------------------------------------\n
  Time : ${new Date().toLocaleString()}\n\n
  Query : ${query.replace(/\s\s+/g, " ")}\n\n
  Status : Successfully Executed \n
  ------------------------------------------------------------------\n`;
  fs.appendFileSync(
    `${fileName.substr(0, fileName.lastIndexOf("."))}.log`,
    queryLine
  );
}

function logErrorQueryToFile(query, errorMessage, errorCode) {
  let queryLine = `------------------------------------------------------------------\n
  Time : ${new Date().toLocaleString()}\n\n
  Query : ${query.replace(/\s\s+/g, " ")}\n\n
  Error Message: ${errorMessage}\n\n
  Error Code: ${errorCode}\n\n
  ------------------------------------------------------------------\n`;
  fs.appendFileSync(
    `${fileName.substr(0, fileName.lastIndexOf("."))}.log`,
    queryLine
  );
}

function runQuery(query, queryNo) {
  return new Promise(function (resolve, reject) {
    connection.query(query, function (error, results, fields) {
      consoleQuery(queryNo, query);
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function consoleQuery(queryNo, query) {
  console.log("\x1b[37m", `\nQuery No ---- ${queryNo} \nQuery is --- ${query}`);
}

function main() {
  if (args.help) {
    console.log(` 
    THANK YOU FOR USING ark-sql-runner\n

    * -f or --file --> for the .sql file (If extension is not .sql error will be  
      shown). Default Value: "queries.sql" \n

   * -h or --host --> for the db host server. Default Value: "queries.sql" \n

   * -u or --user --> for the db user name. Default Value: "root"\n

   * -p or --password --> for db password. Default Value: "password"\n

   * -d or --d --> for the database name. Default Value: "database\n
   
   * -l or --log --> (OPTIONAL) 'boolean flag' Log file name is taken same as .sql file name. Default Value: "queries.log"(as file  name is "queries.log")\n
   `);
  } else {
    connectToDBAndRunQueries();
  }
}
