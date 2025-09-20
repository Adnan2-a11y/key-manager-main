const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
        userId: Number,
        first_name: String,
        last_name: String,
        email: {
            type: String,
            unique: true,
        },
        username: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        isGuest: {
            type: Boolean,
            default: false,
        },
        source: String,
    },
    {
        timestamps: true,
        versionKey: false
    });

customerSchema.pre("save", async function (next) {
    if (!this.isNew) {
        return next();
    }
    try {
        const maxUser = await Customer.findOne().sort({ userId: -1 }).exec();
        if (maxUser) {
            this.userId = maxUser.userId + 1;
        } else {
            this.userId = 1;
        }
        next();
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;