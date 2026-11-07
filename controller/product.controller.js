const { pool } = require("../db/db")

const isValidId = (id) => {
    const num = Number(id);
    return Number.isInteger(num) && num > 0;
};

exports.createProdect = async (req, res) => {
    try {
        const { product_name, brand_id, category_id, model_year, list_price } = req.body

        if (
            !product_name ||
            !product_name.trim() ||
            !isValidId(brand_id) ||
            !isValidId(category_id) ||
            !Number.isInteger(Number(model_year)) ||
            list_price === undefined ||
            list_price === null ||
            isNaN(Number(list_price)) ||
            Number(list_price) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'please include product_name, brand_id, category_id, model_year, list_price'
            })
        }

        const brandExist = await pool.query(`SELECT 1 FROM brands WHERE brand_id = $1`, [brand_id]);
        const categoryExist = await pool.query(`SELECT 1 FROM categories WHERE category_id = $1`, [category_id]);
        if (brandExist.rowCount === 0 || categoryExist.rowCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'brand_id or category_id does not exist'
            })
        }

        const result = await pool.query(
            `INSERT INTO products (product_name, brand_id, category_id, model_year, list_price)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING product_name, brand_id, category_id, model_year, list_price`,
            [product_name.trim(), brand_id, category_id, model_year, list_price]
        )
        res.status(201).json({
            success: true,
            message: 'product created successfully!',
            result: result.rows[0]
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllProduct = async (req, res) => {
    try {
        const result = await pool.query(
            `
                SELECT 
                    p.product_id,
                    p.product_name,
                    p.brand_id,
                    b.brand_name,
                    p.category_id,
                    c.category_name,
                    p.model_year,
                    p.list_price,
                    p.created_at
                FROM products p
                JOIN brands b ON b.brand_id = p.brand_id
                JOIN categories c ON c.category_id = p.category_id
                ORDER BY p.product_id DESC
            `
        )

        res.status(200).json({
            success: true,
            message: 'fetch all data successfully!',
            result: result.rows
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getProductById = async (req, res) => {
    try {
        const paramsId = req.params.id

        if (!isValidId(paramsId)) {
            return res.status(400).json({
                success: false,
                message: 'please include valid id to fetch data!'
            })
        }

        const result = await pool.query(
            `
                SELECT 
                    p.product_id,
                    p.product_name,
                    p.brand_id,
                    b.brand_name,
                    p.category_id,
                    c.category_name,
                    p.model_year,
                    p.list_price
                FROM products p
                JOIN brands b ON b.brand_id = p.brand_id
                JOIN categories c ON c.category_id = p.category_id
                WHERE p.product_id = $1
            `, [paramsId]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'data is not found!'
            })
        }

        res.status(200).json({
            success: true,
            message: 'fetch data by id successfully!',
            result: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateProductById = async (req, res) => {
    try {
        const paramsId = req.params.id
        const { product_name, brand_id, category_id, model_year, list_price } = req.body

        if (!isValidId(paramsId)) {
            return res.status(400).json({
                success: false,
                message: 'please include a valid product id'
            })
        }

        if (product_name === undefined && brand_id === undefined && category_id === undefined && model_year === undefined && list_price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'please include at least one field to update!'
            })
        }

        const result = await pool.query(
            `
                UPDATE products
                    SET product_name = COALESCE($1, product_name),
                        brand_id = COALESCE($2, brand_id),
                        category_id = COALESCE($3, category_id),
                        model_year = COALESCE($4, model_year),
                        list_price = COALESCE($5, list_price)
                    WHERE product_id = $6
                RETURNING product_name, brand_id, category_id, model_year, list_price
            `, [product_name ?? null, brand_id ?? null, category_id ?? null, model_year ?? null, list_price ?? null, paramsId]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'data is not found!'
            })
        }

        res.status(200).json({
            success: true,
            message: 'update successfully!',
            result: result.rows[0]
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteProductById = async (req, res) => {
    try {
        const paramsId = req.params.id

        if (!isValidId(paramsId)) {
            return res.status(400).json({
                success: false,
                message: 'please include valid id'
            })
        }

        const result = await pool.query(
            `
                DELETE FROM products 
                WHERE product_id = $1
                RETURNING product_name, brand_id, category_id, model_year, list_price
            `, [paramsId]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'data not found by id'
            })
        }

        res.status(200).json({
            success: true,
            message: 'delete data successfully',
            result: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
