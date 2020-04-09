#!/usr/bin/env node

const minimist = require("minimist");
const fs = require("fs");
const mysql = require("mysql");
const path = require("path");

const args = minimist(process.argv.slice(2), {
  alias: {
    f: "file",
    h: "host",
    d: "database",
    p: "password",
    u: "user",
  },
  default: {
    f: "queries.sql",
    h: "localhost",
    p: "password",
    d: "database",
    u: "root",
  },
});

const fileName = args.f;
if (path.extname(fileName).slice(1) === "sql") {
  var connection = mysql.createConnection({
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

RunQueries = async () => {
  let queriesInFiles = fs.readFileSync("queries.sql", "utf8");
  let funishedQueries = queriesInFiles.replace(/[\r\n]+/gm, " ").split(";");
  for (i = 0; i < funishedQueries.length; i++) {
    if (funishedQueries[i].trim().length) {
      let finalQuery = funishedQueries[i].trim().concat(";");
      try {
        await runQuery(finalQuery, i + 1);
        console.log("Successfully Executed");
      } catch (err) {
        console.log("\n------Error Happened-----\n");
        console.log(`The Query is: ${err.sql}\n`);
        console.log(`\n Error is : ${err.sqlMessage}, Error code: ${err.code}`);
        fs.truncateSync("queries.sql", 0);
        fs.writeFileSync(
          "queries.sql",
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
  fs.truncateSync("queries.sql", 0);
  console.log(
    "SQL File is truncated AS all your queries have been run successfully"
  );
  process.exit(0);
};

function runQuery(query, queryNo) {
  return new Promise(function (resolve, reject) {
    connection.query(query, function (error, results, fields) {
      console.log(`\nQuery No ---- ${queryNo} \nQuery is --- ${query}`);
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
