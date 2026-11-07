const { pool } = require("../db/db")

exports.createBrands = async (req, res) => {
    try {
        const { brand_name } = req.body

        if (!brand_name || !brand_name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'please include brand name!'
            })
        }

        const result = await pool.query(
            `
                INSERT INTO brands (brand_name)
                VALUES ($1)
                RETURNING brand_id, brand_name
            `, [brand_name.trim()]
        )

        res.status(201).json({
            success: true,
            message: 'create brand successfully!',
            result: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllBrand = async (req, res) => {
    try {
        const result = await pool.query(
            `
                SELECT * FROM brands ORDER BY brand_id DESC
            `
        )

        res.status(200).json({
            success: true,
            message: 'fetch brands successfully',
            result: result.rows
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getBrandById = async (req, res) => {
    try {
        const paramsId = req.params.id

        if (!paramsId) {
            return res.status(400).json({
                success: false,
                message: 'please include id before fetch data'
            })
        }

        const result = await pool.query(
            `
                SELECT * FROM brands WHERE brand_id = $1
            `, [paramsId]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'id is not found!'
            })
        }

        res.status(200).json({
            success: true,
            message: 'fetch by id successfully',
            result: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateBrandById = async (req, res) => {
    try {
        const paramsId = req.params.id

        if (!paramsId) {
            return res.status(400).json({
                success: false,
                message: 'please include id before update!'
            })
        }

        const { brand_name } = req.body

        if (!brand_name) {
            return res.status(400).json({
                success: false,
                message: 'please include brand name before update!'
            })
        }

        const result = await pool.query(
            `
                UPDATE brands
                SET brand_name = COALESCE($1, brand_name)
                WHERE brand_id = $2
                RETURNING brand_id, brand_name
            `, [brand_name ?? null, paramsId]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'brand not found!'
            })
        }

        res.status(200).json({
            success: true,
            message: 'brand updated successfully!',
            result: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteBrandById = async (req, res) => {
    try {
        const paramsId = req.params.id
        if (!paramsId) {
            return res.status(400).json({
                success: false,
                message: 'please include id!'
            })
        }

        const result = await pool.query(
            `
                DELETE FROM brands
                WHERE brand_id = $1
                RETURNING brand_id, brand_name
            `, [paramsId]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'brand not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'brand deleted successfully',
            result: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
