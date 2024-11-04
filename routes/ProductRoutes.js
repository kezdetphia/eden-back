const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { verifyToken } = require("../middleware/veryfiToken");

router.get("/getproducts", verifyToken, ProductController.getAllProducts);

router.post("/createproduct", verifyToken, ProductController.createProduct);

router.get("/getproduct/:id", verifyToken, ProductController.getProduct);

router.post("/addproductcomment/:id", ProductController.addCommentToProduct);

router.get("/getfilteredproducts", ProductController.filterProducts);

module.exports = router;
