var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
//const { getData } = require("../util/helperFunctions.js");

//Get Data helper function
const getData = async (url) => {
  const response = await fetch(url);
  //console.log("Response: ", response, ", Type: ", typeof response);
  const jsonResponse = await response.json();
  //console.log("jsonResults: ", jsonResponse, ", Type: ", typeof jsonResponse);
  //return JSON.stringify(jsonResponse);
  return jsonResponse;
};

//Disable CORS
router.use((req, res, next) => {
  res.header({ "Access-Control-Allow-Origin": "*" });
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

//Return search results for a given search term
router.get("/api/search", async (req, res, next) => {
  //console.log("Query: ", req.query, ", Type: ", typeof req.query);
  const term = req.query.term;
  //console.log("Term: ", term, ", Type: ", typeof term);
  const url = `https://api.github.com/search/users?q=${term}`;

  const urlGithub = `https://api.github.com/users/${term}`;
  const urlGitlab = `https://gitlab.com/api/v4/users?username=${term}`;
  let resultsArray = [];

  try {
    //GITHUB FETCH:
    const responseGithub = await fetch(urlGithub);
    // console.log(
    //   "responseGithub: ",
    //   responseGithub,
    //   ", Type: ",
    //   typeof responseGithub
    // );
    const jsonResponseGithub = await responseGithub.json();
    // console.log(
    //   "jsonResponseGithub: ",
    //   jsonResponseGithub,
    //   ", Type: ",
    //   typeof jsonResponseGithub
    // );
    if (jsonResponseGithub.message !== "Not Found") {
      const resultGithub = {
        id: jsonResponseGithub.id,
        name: jsonResponseGithub.name,
        login: jsonResponseGithub.login,
        avatar: jsonResponseGithub.avatar_url,
        url: jsonResponseGithub.url,
        source: "Github",
      };
      resultsArray.push(resultGithub);
    }

    //GITLAB FETCH:

    const responseGitlab = await fetch(urlGitlab);
    // console.log(
    //   "responseGitlab: ",
    //   responseGitlab,
    //   ", Type: ",
    //   typeof responseGitlab
    // );
    const jsonResponseGitlab = await responseGitlab.json();
    // console.log(
    //   "jsonResponseGitlab: ",
    //   jsonResponseGitlab,
    //   ", Type: ",
    //   typeof jsonResponseGitlab
    // );
    if (jsonResponseGitlab[0]) {
      const resultGitlab = {
        id: jsonResponseGitlab[0].id,
        name: jsonResponseGitlab[0].name,
        login: jsonResponseGitlab[0].username,
        avatar: jsonResponseGitlab[0].avatar_url,
        url: jsonResponseGitlab[0].web_url,
        source: "Gitlab",
      };
      resultsArray.push(resultGitlab);
    }

    // console.log(
    //   "ResultsArray: ",
    //   resultsArray,
    //   ", Type: ",
    //   typeof resultsArray
    // );
    res.send(resultsArray);
  } catch (err) {
    next(err);
  }
});

//Return a single user
router.get("/api/user", async (req, res, next) => {
  //console.log("Query: ", req.query, ", Type: ", typeof req.query);
  const user = req.query.user;
  const source = req.query.source;
  //console.log("User: ", user, ", Type: ", typeof user);
  //console.log("Source: ", source, ", Type: ", typeof source);
  const urlGithub = `https://api.github.com/users/${user}`;
  const urlGitlab = `https://gitlab.com/api/v4/users?username=${user}`;

  try {
    if (source === "Github") {
      const data = await getData(urlGithub);
      //console.log("Data: ", data, ", Type: ", typeof data);
      const resultGithub = {
        id: data.id,
        name: data.name,
        login: data.login,
        avatar: data.avatar_url,
        url: data.url,
        source: "Github",
      };
      // console.log(
      //   "resultGithub: ",
      //   resultGithub,
      //   ", Type: ",
      //   typeof resultGithub
      // );
      res.send(resultGithub);
    } else if (source === "Gitlab") {
      const data = await getData(urlGitlab);
      //console.log("Data: ", data, ", Type: ", typeof data);
      const resultGitlab = {
        id: data[0].id,
        name: data[0].name,
        login: data[0].username,
        avatar: data[0].avatar_url,
        url: data[0].web_url,
        source: "Gitlab",
      };
      // console.log(
      //   "resultGitlab: ",
      //   resultGitlab,
      //   ", Type: ",
      //   typeof resultGitlab
      // );
      res.send(resultGitlab);
    } else {
      throw new Error("not one of the sources Github or Gitlab");
    }
  } catch (err) {
    next(err);
  }
});

//Return a user's repositories
router.get("/api/repos", async (req, res, next) => {
  //console.log("Query: ", req.query, ", Type: ", typeof req.query);
  const user = req.query.user;
  const source = req.query.source;
  //console.log("User: ", user, ", Type: ", typeof user);
  //console.log("Source: ", source, ", Type: ", typeof source);
  const urlGithub = `https://api.github.com/users/${user}/repos`;
  const urlGitlab = `https://gitlab.com/api/v4/users/${user}/projects`;
  try {
    if (source === "Github") {
      const responseGithub = await fetch(urlGithub);
      //console.log("responseGithub: ", responseGithub, ", Type: ", typeof responseGithub);
      const jsonResponseGithub = await responseGithub.json();
      //console.log("jsonResponseGithub: ", jsonResponseGithub, ", Type: ", typeof jsonResponseGithub);
      const resultGithub = jsonResponseGithub.map((object) => {
        return {
          id: object.id,
          name: object.name,
          description: object.description,
          created_at: object.created_at,
          updated_at: object.updated_at,
        };
      });

      res.send(resultGithub);
    } else if (source === "Gitlab") {
      const responseGitlab = await fetch(urlGitlab);
      //console.log("responseGitlab: ", responseGitlab, ", Type: ", typeof responseGitlab);
      const jsonResponseGitlab = await responseGitlab.json();
      //console.log("jsonResponseGitlab: ", jsonResponseGitlab, ", Type: ", typeof jsonResponseGitlab);
      const resultGitlab = jsonResponseGitlab.map((object) => {
        return {
          id: object.id,
          name: object.name,
          description: object.description,
          created_at: object.created_at,
          updated_at: object.last_activity_at,
        };
      });

      res.send(resultGitlab);
    }
  } catch (err) {
    next(err);
  }
});

//Return a single repo
router.get("/api/repo", async (req, res, next) => {
  //console.log("Query: ", req.query, ", Type: ", typeof req.query);
  const source = req.query.source;
  // console.log("Source: ", source, ", Type: ", typeof source);
  const user = req.query.user;
  // console.log("User: ", user, ", Type: ", typeof user);
  const repoName = req.query.reponame;
  // console.log("repoName: ", repoName, ", Type: ", typeof repoName);
  const repoId = req.query.repoid;
  // console.log("repoId: ", repoId, ", Type: ", typeof repoId);
  const urlGithub = `https://api.github.com/repos/${user}/${repoName}`;
  const urlGitlab = `https://gitlab.com/api/v4/projects/${repoId}`;
  try {
    if (source === "Github") {
      const responseGithub = await fetch(urlGithub);
      //console.log("responseGithub: ", responseGithub, ", Type: ", typeof responseGithub);
      const jsonResponseGithub = await responseGithub.json();
      //console.log("jsonResponseGithub: ", jsonResponseGithub, ", Type: ", typeof jsonResponseGithub);
      const result = {
        id: jsonResponseGithub.id,
        name: jsonResponseGithub.name,
        description: jsonResponseGithub.description,
        created_at: jsonResponseGithub.created_at,
        updated_at: jsonResponseGithub.updated_at,
        owner: user,
        source: "Github",
      };
      res.send(result);
    } else if (source === "Gitlab") {
      const responseGitlab = await fetch(urlGitlab);
      //console.log("responseGitlab: ", responseGitlab, ", Type: ", typeof responseGitlab);
      const jsonResponseGitlab = await responseGitlab.json();
      //console.log("jsonResponseGitlab: ", jsonResponseGitlab, ", Type: ", typeof jsonResponseGitlab);
      const result = {
        id: jsonResponseGitlab.id,
        name: jsonResponseGitlab.name,
        description: jsonResponseGitlab.description,
        created_at: jsonResponseGitlab.created_at,
        updated_at: jsonResponseGitlab.last_activity_at,
        owner: user,
        source: "Gitlab",
      };
      //console.log("result: ", result, ", Type: ", typeof result);
      res.send(result);
    }
  } catch (err) {
    next(err);
  }
});

//Return a user's commits
router.get("/api/commits", async (req, res, next) => {
  //console.log("Query: ", req.query, ", Type: ", typeof req.query);
  const source = req.query.source;
  // console.log("Source: ", source, ", Type: ", typeof source);
  const user = req.query.user;
  // console.log("User: ", user, ", Type: ", typeof user);
  const repoName = req.query.reponame;
  // console.log("repoName: ", repoName, ", Type: ", typeof repoName);
  const repoId = req.query.repoid;
  // console.log("repoId: ", repoId, ", Type: ", typeof repoId);
  const urlGithub = `https://api.github.com/repos/${user}/${repoName}/commits`;
  const urlGitlab = `https://gitlab.com/api/v4/projects/${repoId}/repository/commits`;
  try {
    if (source === "Github") {
      const responseGithub = await fetch(urlGithub);
      //console.log("responseGithub: ", responseGithub, ", Type: ", typeof responseGithub);
      const jsonResponseGithub = await responseGithub.json();
      // console.log(
      //   "jsonResponseGithub: ",
      //   jsonResponseGithub,
      //   ", Type: ",
      //   typeof jsonResponseGithub
      // );
      const resultGithub = jsonResponseGithub.map((object) => {
        return {
          id: object.sha,
          message: object.commit.message,
          committed_date: object.commit.committer.date,
        };
      });
      const top5ResultsGithub = resultGithub.slice(0, 5);
      //console.log(top5ResultsGithub);
      res.send(top5ResultsGithub);
    } else if (source === "Gitlab") {
      const responseGitlab = await fetch(urlGitlab);
      //console.log("responseGitlab: ", responseGitlab, ", Type: ", typeof responseGitlab);
      const jsonResponseGitlab = await responseGitlab.json();
      //console.log("jsonResponseGitlab: ", jsonResponseGitlab, ", Type: ", typeof jsonResponseGitlab);
      const resultGitlab = jsonResponseGitlab.map((object) => {
        return {
          id: object.id,
          message: object.message,
          committed_date: object.committed_date,
        };
      });
      const top5ResultsGitlab = resultGitlab.slice(0, 5);
      //console.log(top5ResultsGithub);
      res.send(top5ResultsGitlab);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
