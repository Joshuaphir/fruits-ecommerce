
const User = require('./../models/UserModel');
const Fruit = require('./../models/FruitsModel');

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        console.log(`Adding to cart: productId=${productId}, quantity=${quantity}`);

        const user = await User.findById(req.user.id);
        if (!user) {
            console.error('User not found');
            return res.status(404).json({ message: "User not found" });
        }

        const fruit = await Fruit.findById(productId);
        if (!fruit) {
            console.error('Fruit not found');
            return res.status(404).json({ message: "Fruit not found" });
        }

        const cartItem = user.cart.find(item => item.productId.toString() === productId);
        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            user.cart.push({ productId, quantity });
        }

        await user.save();
        console.log('Cart updated successfully');
        res.status(200).json({ message: "Added to cart", cart: user.cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: error.message });
    }
};


exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.productId');
        res.status(200).json({ cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user.id);

        user.cart = user.cart.filter(item => item.productId.toString() !== productId);
        await user.save();

        res.status(200).json({ message: "Removed from cart", cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
