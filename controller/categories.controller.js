const { pool } = require("../db/db")

exports.createCategories = async (req, res) => {
    try {
        const { category_name } = req.body

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "please include category name in req!"
            })
        }

        const result = await pool.query(
            `
                INSERT INTO categories (category_name)
                VALUES ($1)
                RETURNING category_id, category_name
            `, [category_name.trim()]
        )

        res.status(201).json({
            success: true,
            message: 'category created successfully!',
            result: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllcategories = async (req, res) => {
    try {
        const result = await pool.query(
            `
                SELECT * FROM categories ORDER BY category_id DESC
            `
        )

        res.status(200).json({
            success: true,
            message: 'fetch data about category is successfully',
            result: result.rows
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getCategoriesById = async (req, res) => {
    try {
        const paramsId = req.params.id

        if (!paramsId) {
            return res.status(400).json({
                success: false,
                message: 'please include id for fetch data!'
            })
        }

        const result = await pool.query(
            `
                SELECT * FROM categories WHERE category_id = $1
            `, [paramsId]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'fetch by id is not found!'
            })
        }

        res.status(200).json({
            success: true,
            message: 'fetch by id is successfully!',
            result: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateCategories = async (req, res) => {
    try {
        const category_id = req.params.id
        if (!category_id) {
            return res.status(400).json({
                success: false,
                message: 'please input category id!'
            })
        }

        const { category_name } = req.body

        if (!category_name) {
            return res.status(400).json({
                success: false,
                message: 'please include category name!'
            })
        }

        const result = await pool.query(
            `
                UPDATE categories
                SET category_name = COALESCE($1, category_name)
                WHERE category_id = $2
                RETURNING category_id, category_name
            `, [category_name ?? null, category_id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'category not found by id'
            })
        }

        res.status(200).json({
            success: true,
            message: 'category updated successfully',
            result: result.rows[0]
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteCategories = async (req, res) => {
    try {
        const paramsId = req.params.id

        if (!paramsId) {
            return res.status(400).json({
                success: false,
                message: 'please include id for delete data!'
            })
        }

        const result = await pool.query(
            `
                DELETE FROM categories 
                WHERE category_id = $1
                RETURNING category_id, category_name
            `, [paramsId]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'category not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'category deleted successfully',
            result: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
