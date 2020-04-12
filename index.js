#!/usr/bin/env node

const minimist = require("minimist");
const fs = require("fs");
const mysql = require("mysql");
const path = require("path");
var connection;

const args = minimist(process.argv.slice(2), {
  alias: {
    f: "file",
    h: "host",
    d: "database",
    p: "password",
    u: "user",
    help: "help",
  },
  string: ["p", "h", "d", "u", "f"],
  boolean: ["help"],
  default: {
    f: "queries.sql",
    h: "localhost",
    p: "password",
    d: "database",
    u: "root",
    help: false,
  },
});

const fileName = args.f;
main();

function connectToDBAndRunQueries() {
  if (path.extname(fileName).slice(1) === "sql") {
    connection = mysql.createConnection({
      host: args.h,
      user: args.u,
      password: args.p,
      database: args.d,
    });

    connection.connect(function (err) {
      if (!err) {
        console.log("Database is connected ... Now Running Queries");
        RunQueries();
      } else {
        console.log("Error connecting database ... nn");
      }
    });
  } else {
    console.log("The file type is not Sql");
    process.exit(0);
  }
}

RunQueries = async () => {
  let queriesInFiles = fs.readFileSync(fileName, "utf8");
  let funishedQueries = queriesInFiles.replace(/[\r\n]+/gm, " ").split(";");
  for (i = 0; i < funishedQueries.length; i++) {
    if (funishedQueries[i].trim().length) {
      let finalQuery = funishedQueries[i].trim().concat(";");
      try {
        await runQuery(finalQuery, i + 1);
        console.log("\n\x1b[32m", "Successfully Executed\n");
      } catch (err) {
        console.log("\x1b[31m", "\n------Error Happened-----\n");
        console.log("\x1b[37m", `The Query is: ${err.sql}\n`);
        console.log(
          "\x1b[31m",
          `\n Error is : ${err.sqlMessage}, Error code: ${err.code}`
        );
        fs.truncateSync(fileName, 0);
        fs.writeFileSync(
          fileName,
          funishedQueries.splice(i, funishedQueries.length).join(";\n")
        );
        console.log(
          "Final remaining queries ===",
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

   * -d or --d --> for the database name. Default Value: "database\n`);
  } else {
    connectToDBAndRunQueries();
  }
}
