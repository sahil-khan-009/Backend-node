const express = require("express");
const userModel = require("../models/Users");
const router = express.Router();
const isLoggedIn = require("../middlewares/IsLoggedin");
const mongoose = require("mongoose");

router.get("/loggedInUSer", async (req, res) => {
  try {
    res.send("han bhai chal raha ha");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
