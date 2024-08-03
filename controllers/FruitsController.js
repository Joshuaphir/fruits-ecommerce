const Fruit = require("../models/FruitsModel");

exports.createFruit = async (req, res) => {
    try {
        const newFruit = await Fruit.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                newFruit,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
};


exports.getAllFruit = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const fruits = await Fruit.find().skip(skip).limit(limit);
        const totalFruits = await Fruit.countDocuments();

        res.status(200).json({
            status: "success",
            results: fruits.length,
            data: {
                fruits,
                totalPages: Math.ceil(totalFruits / limit),
                currentPage: page,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "fail",
            message: error.message,
        });
    }
};

exports.getSingleFruit = async (req, res) => {
    try {
        const fruit = await Fruit.findById(req.params.id);
        if (!fruit) {
            return res.status(404).json({
                status: "fail",
                message: "Fruit not found",
            });
        }
        res.status(200).json({
            status: "success",
            data: {
                fruit,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "fail",
            message: error.message,
        });
    }
};

exports.updateFruit = async (req, res) => {
    try {
        const fruit = await Fruit.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!fruit) {
            return res.status(404).json({
                status: "fail",
                message: "Fruit not found",
            });
        }
        res.status(200).json({
            status: "success",
            data: {
                fruit,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

exports.deleteFruit = async (req, res) => {
    try {
        const fruit = await Fruit.findByIdAndDelete(req.params.id);
        if (!fruit) {
            return res.status(404).json({
                status: "fail",
                message: "Fruit not found",
            });
        }
        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            status: "fail",
            message: error.message,
        });
    }
};
