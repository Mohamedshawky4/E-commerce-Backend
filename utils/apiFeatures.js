class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.search
            ? {
                $or: [
                    { name: { $regex: this.queryStr.search, $options: "i" } },
                    { brand: { $regex: this.queryStr.search, $options: "i" } },
                ],
            }
            : {};

        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };

        // Removing fields from the query
        const removeFields = ["search", "sort", "page", "limit", "fields"];
        removeFields.forEach((el) => delete queryCopy[el]);

        // Handle minPrice and maxPrice for numerical filtering
        if (queryCopy.minPrice || queryCopy.maxPrice) {
            queryCopy.price = {};
            if (queryCopy.minPrice) queryCopy.price.$gte = Number(queryCopy.minPrice);
            if (queryCopy.maxPrice) queryCopy.price.$lte = Number(queryCopy.maxPrice);
        }
        delete queryCopy.minPrice;
        delete queryCopy.maxPrice;

        // Handle rating
        if (queryCopy.rating) {
            queryCopy.averageRating = { $gte: Number(queryCopy.rating) };
            delete queryCopy.rating;
        }

        // Handle discounted
        if (queryCopy.discounted === "true") {
            queryCopy.discountPercent = { $gt: 0 };
        }
        delete queryCopy.discounted;

        // Handle stock
        if (queryCopy.hasStock === "true") {
            queryCopy.stock = { $gt: 0 };
        }
        delete queryCopy.hasStock;

        // Handle multi-value fields (comma-separated)
        const multiValueFields = ["brand", "categories"];
        multiValueFields.forEach((field) => {
            if (queryCopy[field]) {
                const values = queryCopy[field].split(",").map((v) => v.trim());
                queryCopy[field] = { $in: values };
            }
        });

        // Advance filter for price, etc (standard mongoose format)
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt");
        }

        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }

        return this;
    }

    paginate() {
        const page = Number(this.queryStr.page) || 1;
        const limit = Number(this.queryStr.limit) || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

export default APIFeatures;
