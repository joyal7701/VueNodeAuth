const express = require("express");

// creating an express instance
const app = express();

/*the body-parser library allows us to access values from an Ajax request sent from a front-end.
cookie-session allows us to store cookies on the server and to be able to send one back to a client when they log in.
express is our Node.js framework which helps us build Ajax APIs. It also allows us to serve static files from our Node.js application.
passport.js is a library to help us authenticate users. It does this by creating sessions and managing them for each user.
passport-local is a library component for Passport.js. It specializes in simple authentication by using the local authentication type. For example, if we want to use SSO login type, we will need to install the component of Passport.js that has that feature. So now that we have our libraries installed, let’s import and set them up.*/

const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const passport = require("passport");

// getting the local authentication type
const LocalStrategy = require("passport-local").Strategy;

const publicRoot =
  "/Users/joyal/Desktop/MyFolder/Programs/demo/vueauthclient/dist";

app.use(express.static(publicRoot));

app.use(bodyParser.json());

app.use(
  cookieSession({
    name: "mysession",
    keys: ["vueauthrandomkey"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(passport.initialize());
app.use(passport.session());

let users = [
  {
    id: 1,
    name: "Jude",
    email: "user@email.com",
    password: "password",
  },
  {
    id: 2,
    name: "Emma",
    email: "emma@email.com",
    password: "password2",
  },
];

app.get("/", (req, res, next) => {
  res.sendFile("index.html", { root: publicRoot });
});

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(400).send([user, "Cannot log in", info]);
    }

    req.login(user, (err) => {
      res.send("Logged in");
    });
  })(req, res, next);
});

app.get("/api/logout", function (req, res) {
  req.logout();
  console.log("logged out");
  return res.send();
});

const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.status(401).send("You are not authenticated");
  } else {
    return next();
  }
};
// Here a second variable we are passing in before the callback. This is because we want to protect this URL, so we are passing a middleware filter. This filter will check if the current session is valid before allowing the user to proceed with the rest of the operation
app.get("/api/user", authMiddleware, (req, res) => {
  let user = users.find((user) => {
    return user.id === req.session.passport.user;
  });
  console.log([user, req.session]);
  res.send({ user: user });
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      let user = users.find((user) => {
        return user.email === username && user.password === password;
      });

      if (user) {
        done(null, user);
      } else {
        done(null, false, { message: "Incorrect username or password" });
      }
    }
  )
);

//Next, let’s tell Passport.js how to handle a given user object. This is necessary if we want to do some work before storing it in session. In this case, we only want to store the id as it is enough to identify the user when we extract it from the cookie. Add in the following to achieve that:
//serializeUser determines which data of the user object should be stored in the session. The result of the serializeUser method is attached to the session as req.session.passport.user = {} . Here for instance, it would be (as we provide the user id as the key) req.session.passport.user = {id: 'xyz'}
// Next, let’s set up the reverse. When a user makes a request for a secured URL. We tell passport how to retrieve the user object from our array of users. It will use the id we stored using the serializeUser method to achieve this. Add this:

passport.serializeUser((user, done) => {
  done(null, user.id);
});

//deserializeUser() functions. Passport.serialize and passport.deserialize are used to set id as a cookie in. the user's browser and to get the id from the cookie when it then used to get user info in a callback.

passport.deserializeUser((id, done) => {
  let user = users.find((user) => {
    return user.id === id;
  });

  done(null, user);
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000");
});
