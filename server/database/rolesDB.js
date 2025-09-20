const mongoose = require("mongoose");
const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
},
{
    timestamps: true,
    versionKey: false
});

const rolesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    permissions: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: "Permission",
        default: [],
    },
},
{
    timestamps: true,
    versionKey: false
});

const Permission = mongoose.model("Permission", permissionSchema);
const Role = mongoose.model("Role", rolesSchema);
module.exports = {
    Permission,
    Role
};