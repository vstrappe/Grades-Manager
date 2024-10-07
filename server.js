if (process.argv.length != 3) {
  process.stdout.write(`Usage ${process.argv[1]} portNumber`);
  process.exit(1);
}

const express = require("express"); /* Accessing express module */
const bodyParser = require("body-parser"); /* To handle post parameters */
const path = require("path");
const { DatabaseManager } = require("./databaseManager");
const { render } = require("express/lib/response");
const { request } = require("http");

const app = express(); /* app is a request handler function */
process.stdin.setEncoding("utf8");
const portNumber = Number(process.argv[2]);

/* For views */
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

/* Initializes request.body with post information */
app.use(bodyParser.urlencoded({ extended: false }));

/* DatabaseManager */
const databaseManager = new DatabaseManager();

/* Routes */
app.get("/", (request, response) => {
  (async () => {
    await databaseManager.listDatabases();
  })(); 
  response.render("index");
});

app.get("/apply", (request, response) => {
  values = {homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
  response.render("apply", values);
});

app.post("/processApplication", (request, response) => {
  let {name, email, gpa, info} = request.body;
  let apl = {name: name, email: email, gpa: gpa, info: info};
  let vals = {name: name, email: email, gpa: gpa, info: info, homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
  (async () => {
    await databaseManager.insertApplication(apl);
  })();
  response.render("processApplication", vals);
});

app.get("/reviewApplication", (request, response) => {
  values = {homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
  response.render("reviewApplication", values);
});

app.post("/processReviewApplication", async (request, response) => {
  let {email} = request.body;
  let vals;
  try {
    let apl = await databaseManager.lookUpApplication(email);
    vals = {name: apl.name, email: apl.email, gpa: apl.gpa, info: apl.info, homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
    response.render("processApplication", vals);
  } catch (error) {
    vals = {name: "NONE", email: "NONE", gpa: "NONE", info: "NONE", homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
    response.render("processApplication", vals);
  }
});

app.get("/adminGPA", (request, response) => {
  values = {homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
  response.render("adminGPA", values);
});

app.post("/processAdminGPA", async (request, response) => {
  let {gpa} = request.body;
  let vals;
  try {
    let str = "";
    let arr = await databaseManager.lookUpGPA(gpa);
    for(const elem of arr) {
      str += `<tr><td style='border: 1px solid black'>${elem.name}</td><td style='border: 1px solid black'>${elem.gpa}</td></tr>`;
    }
    console.log(str);
    vals = {rows: str, homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
    response.render("processAdminGPA", vals);
  } catch (error) {
    vals = {rows: "", homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
    response.render("processAdminGPA", vals);
  }
});

app.get("/adminRemove", (request, response) => {
  values = {homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
  response.render("adminRemove", values);
});

app.post("/processAdminRemove", async (request, response) => {
  let vals;
  try {
    const result = await databaseManager.deleteAllApplications();
    vals = {message: `All applications have been removed from the database. Number of applications removed: ${result}`, 
            homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
    response.render("processAdminRemove", vals);
  } catch (error) {
    vals = {message: `Error!`, 
            homeURL: `<a href="http://localhost:${portNumber}/">HOME</a>`};
    response.render("processAdminRemove", vals);
  }
});

app.get("/sample", (request, response) => {
  values = {
    homeUrl: `<a href="http://localhost:${portNumber}/">HOME</a>`,
    firstName: 'Nikola',
    lastName: 'Tesla',
    api: `http://localhost:${portNumber}`
  };

  response.render("sample", values);
});

app.get("/data", (req, res) => {
  res.json({firstName: "Nikola", lastName: "Tesla"})
})

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);
commandLineInterpreter();

function commandLineInterpreter() {
  let stopServerMessage = 'Type \"stop\" to shutdown the server: ';
  process.stdout.write(stopServerMessage);
  process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    if (dataInput !== null) {
      let command = dataInput.trim();
      if (command === "stop") {
        process.stdout.write("Shutting down the server\n");
        process.exit(0);
      } else {
        process.stdout.write(`Invalid command: ${command}\n`);
        process.stdout.write(stopServerMessage);
        process.stdin.resume();
      }
    }
  });
}
