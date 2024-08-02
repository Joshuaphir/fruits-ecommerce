const Cart = require("../models/CartModel");
const Fruit = require("../models/FruitsModel");

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user.id });

        const fruit = await Fruit.findById(productId);
        if (!fruit) {
            return res.status(404).json({ message: "Fruit not found" });
        }

        if (cart) {
            // Check if item exists in cart
            const cartItem = cart.items.find(item => item.productId.toString() === productId);
            if (cartItem) {
                cartItem.quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
            await cart.save();
        } else {
            // Create a new cart if one doesn't exist
            await Cart.create({
                user: req.user.id,
                items: [{ productId, quantity }]
            });
        }

        res.status(200).json({ message: "Added to cart", cart: cart ? cart.items : [{ productId, quantity }] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        res.status(200).json({ cart: cart.items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();

        res.status(200).json({ message: "Removed from cart", cart: cart.items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
