const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const paypal = require("../utils/paypal");


router.get("/", function (req, res) {
    let error = req.flash("error");
    res.render("index", { error, loggedin: false });
});

router.get("/shop", isLoggedIn, async function (req, res) {
    let { sortby, filterby, search } = req.query;
    let success = req.flash("success");

    let sort = {};
    if (sortby === "price") {
        sort = { price: 1 };
    } else if (sortby === "popularity") {
        sort = { popularity: -1 };
    }

    let filter = {};
    if (filterby === "availability") {
        filter = { availability: { $in: ["In Stock", "Few Left"] } };
    } else if (filterby === "newest") {
        filter = { newest: "New Release" };
    }
    if (search && search.trim() !== "") {
        filter.name = { $regex: search.trim(), $options: "i" };
    }

    try {
        let products = await productModel.find(filter).sort(sort);
        res.render("shop", { products, success, sortby, filterby, search });
    } catch (error) {
        console.error("Error fetching products:", error);
        req.flash("error", "Error loading products");
        res.redirect("/shop");
    }
});
router.get("/product/:id", async (req, res) => {
    const product = await productModel.findById(req.params.id);
    if (!product) {
        return res.redirect("/shop");
    }
    res.render("product-details", { product });
});


router.get("/cart", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("cart");
        user.cart.forEach(item => {
            if (!item.quantity) item.quantity = 1;
        });

        if (!user || !user.cart || user.cart.length === 0) {
            return res.render("cart", { user, bill: 0, empty: true });
        }

        const bill = user.cart.reduce((total, item) => {
            return total + ((Number(item.price) - Number(item.discount) + 20) * (item.quantity || 1));
        }, 0);

        res.render("cart", { user, bill });
    } catch (error) {
        console.error("Error loading cart:", error);
        req.flash("error", "Something went wrong");
        res.redirect("/shop");
    }
});

router.post("/cart/remove/:productid", isLoggedIn, async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("cart");

        const itemIndex = user.cart.findIndex(p => p._id.toString() === req.params.productid);

        if (itemIndex > -1) {
            user.cart.splice(itemIndex, 1);
            await user.save();
        }

        res.redirect("/cart");
    } catch (err) {
        console.error("Error removing item:", err);
        res.redirect("/cart");
    }
});

router.get("/addtocart/:productid", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        const product = await productModel.findById(req.params.productid);

        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect("/shop");
        }

        user.cart.push(product._id);
        await user.save();

        req.flash("success", "Added to cart");
        res.redirect("/shop");
    } catch (error) {
        console.error("Error adding to cart:", error);
        req.flash("error", "Failed to add to cart");
        res.redirect("/shop");
    }
});

router.get("/account", isLoggedIn, async function (req, res) {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        res.render("account", { user });
    } catch (error) {
        console.error("Error loading account:", error);
        req.flash("error", "Unable to load account details");
        res.redirect("/shop");
    }
});

router.get("/cart/checkout", isLoggedIn, async function (req, res) {
    try {
        const user = await userModel.findOne({ email: req.user.email }).populate("cart");

        if (!user || !user.cart || user.cart.length === 0) {
            req.flash("error", "Your cart is empty.");
            return res.redirect("/cart");
        }

        const amount = user.cart.reduce((total, item) => {
            return total + ((Number(item.price) - Number(item.discount) + 20) * (item.quantity || 1));
        }, 0);

        res.render("paypal-checkout", {
            amount,
            user,
            clientId: process.env.PAYPAL_CLIENT_ID,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        req.flash("error", "Failed to proceed to checkout.");
        res.redirect("/cart");
    }
});

router.post("/account/address", isLoggedIn, async (req, res) => {
    const { address } = req.body;

    try {
        await userModel.findOneAndUpdate(
            { email: req.user.email },
            { address }
        );

        res.redirect("/account");
    } catch (error) {
        console.error("Error saving address:", error);
        req.flash("error", "Failed to save address");
        res.redirect("/account");
    }
});

router.get("/logout", isLoggedIn, function (req, res) {
    req.logout(() => {
        res.redirect("/");
    });
});

module.exports = router;
