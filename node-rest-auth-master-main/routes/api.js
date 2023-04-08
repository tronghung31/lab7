
var passport = require('passport');
var config = require('../config/database');
require('../config/Passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// // parse requests of content-type - application/json
router.use(bodyParser.json());
router.use(cookieParser());

const parser = bodyParser.urlencoded({ extended: true });

router.use(parser);

router.post('/signup', async function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please pass username and password.' });
    } else {
        var newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        // save the user
        await newUser.save();

        res.redirect('/');
    }
});


router.post("/signin", async function (req, res) {
  console.log(req.body);

  let user = await User.findOne({ username: req.body.username });

  console.log(user);

  if (!user) {
    res
      .status(401)
      .send({ success: false, msg: "Authentication failed. User not found." });
  } else {
    // check if password matches
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (isMatch && !err) {
        // if user is found and password is right create a token
        var token = jwt.sign(user.toJSON(), config.secret);
        // return the information including token as JSON
        res.cookie("jwt", token, { httpOnly: true });
        res.redirect("/book");
      } else {
        res
          .status(401)
          .send({
            success: false,
            msg: "Authentication failed. Wrong password.",
          });
      }
    });
  }
});

router.post(
  "/book",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    var token = getToken(req.headers);
    if (token) {
      console.log(req.body);
      var newBook = new Book({
        isbn: req.body.isbn,
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
      });

      newBook
        .save()
        .then(() => res.redirect("/book"))
        .catch((err) => res.json({ success: false, msg: "Save book failed." }));
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

router.get('/book', passport.authenticate('jwt', { session: false }), async function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        let books = await Book.find();

        return res.json(books);
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    }
});

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;
