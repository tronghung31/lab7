var express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var axios = require("axios");
var router = express.Router();

router.use(bodyParser.json());
router.use(cookieParser());

router.get("/book", async function (req, res) {
  const token = req.cookies.jwt;
  try {
    const response = await axios.get("http://localhost:3000/api/book", {
      headers: { Authorization: `jwt ${token}` },
    });
    const data = response.data;
    res.render("book", {
      Title: "Book",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/add', async function (req, res) {
  const token = req.cookies.jwt;
  res.render("add", {Title:"Add",token})
})

router.get('/signup', function (req, res) {
  res.render("SignUp",{Title:"Đăng ký"})
})

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("SignIn", { layouts: "main", Title: "Đăng nhập" });
});

module.exports = router;
