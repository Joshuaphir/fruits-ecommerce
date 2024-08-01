//const fs = require('fs');
const Fruit = require("./../models/FruitsModel")

// PART TWO 

exports.createFruit =async (req, res) => {
    try{
        const newFruit = await Fruit.create(req.body);

        res.status(201).json({
            status: "success",
            data: {
                newFruit: newFruit,
            }
        });

    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error,
        })
    }

}

exports.getAllFruit = async (req, res) => {
    try {
        const fruits = await Fruit.find();

        res.status(200).json({
            status: "success",
            results: fruits.length,
            data: {
                fruits
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
};


exports.getSingleFruit = async (req, res) => {
    try {
        const fruit = await Fruit.findById(req.params.id);
        res.status(200).json({
            status: "success",
            data:{
                fruit,
            }
            
        });
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error
        });
    }
}


exports.updateFruit = async (req, res) => {
    try {
        const fruit = await Fruit.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        res.status(200).json({
            status : "success",
            data:{
                fruit,
            }
        });
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error
        });
    }
}

exports.deleteFruit = async (req, res) => {
    try {
        await Fruit.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: "success",
            data: null
        });
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error.message
        });
    }
}
