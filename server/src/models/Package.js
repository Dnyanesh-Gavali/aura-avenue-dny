const { ObjectId } = require("mongodb");
const { collectionPackages } = require("../config/db");

class Package {
    static async findAll() {
        return await collectionPackages.find({}).toArray();
    }

    static async findById(id) {
        return await collectionPackages.findOne({ _id: new ObjectId(id) });
    }

    static async updateImage(id, newImageUrl) {
        return await collectionPackages.updateOne(
            { _id: new ObjectId(id) },
            { $set: { image: newImageUrl } }
        );
    }

    static async updateAttractions(id, attractionsData) {
        return await collectionPackages.updateOne(
            { _id: new ObjectId(id) },
            { $set: { attractions: attractionsData } }
        );
    }
}

module.exports = Package;