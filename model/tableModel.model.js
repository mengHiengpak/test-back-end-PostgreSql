const { pool } = require("../db/db");

// Creates the production tables in dependency order if they don't already exist.
const tableModel = async () => {
    const queries = [
        `
        CREATE TABLE IF NOT EXISTS categories (
            category_id SERIAL PRIMARY KEY,
            category_name VARCHAR(255) NOT NULL
        )`,

        `
        CREATE TABLE IF NOT EXISTS brands (
            brand_id SERIAL PRIMARY KEY,
            brand_name VARCHAR(100) NOT NULL
        )`,

        `
        CREATE TABLE IF NOT EXISTS products (
            product_id SERIAL PRIMARY KEY,
            product_name VARCHAR NOT NULL,
            brand_id INTEGER NOT NULL REFERENCES brands(brand_id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            category_id INTEGER NOT NULL REFERENCES categories(category_id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            model_year INTEGER NOT NULL,
            list_price NUMERIC(12, 2) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`,

        `
        CREATE TABLE IF NOT EXISTS stocks (
            store_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL REFERENCES products(product_id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            quantity INTEGER NOT NULL,
            PRIMARY KEY (store_id, product_id)
        )`,
    ];

    try {
        for (const query of queries) {
            await pool.query(query);
        }
        console.log("create tables successfully");
    } catch (error) {
        console.log("error create tables, please check!", error.message);
    }
};

// Seed default data so the API has something to return.
// Safe to re-run: it only inserts a row when that row is missing.
const seedData = async () => {
    const ensureCategory = async (name) => {
        const existing = await pool.query(
            `SELECT category_id FROM categories WHERE category_name = $1`,
            [name]
        );
        if (existing.rowCount > 0) return existing.rows[0].category_id;
        const res = await pool.query(
            `INSERT INTO categories (category_name) VALUES ($1) RETURNING category_id`,
            [name]
        );
        return res.rows[0].category_id;
    };

    const ensureBrand = async (name) => {
        const existing = await pool.query(
            `SELECT brand_id FROM brands WHERE brand_name = $1`,
            [name]
        );
        if (existing.rowCount > 0) return existing.rows[0].brand_id;
        const res = await pool.query(
            `INSERT INTO brands (brand_name) VALUES ($1) RETURNING brand_id`,
            [name]
        );
        return res.rows[0].brand_id;
    };

    const ensureProduct = async (product_name, brand_id, category_id, model_year, list_price) => {
        const existing = await pool.query(
            `SELECT product_id FROM products WHERE product_name = $1 AND brand_id = $2`,
            [product_name, brand_id]
        );
        if (existing.rowCount > 0) return existing.rows[0].product_id;
        const res = await pool.query(
            `INSERT INTO products (product_name, brand_id, category_id, model_year, list_price)
             VALUES ($1, $2, $3, $4, $5) RETURNING product_id`,
            [product_name, brand_id, category_id, model_year, list_price]
        );
        return res.rows[0].product_id;
    };

    try {
        const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports'];
        const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas'];

        const categoryIds = {};
        for (const name of categories) {
            categoryIds[name] = await ensureCategory(name);
        }

        const brandIds = {};
        for (const name of brands) {
            brandIds[name] = await ensureBrand(name);
        }

        const products = [
            ['iPhone 15', 'Apple', 'Electronics', 2023, 999.00],
            ['Galaxy S24', 'Samsung', 'Electronics', 2024, 799.00],
            ['WH-1000XM5 Headphones', 'Sony', 'Electronics', 2022, 348.00],
            ['Nike Air Max 270', 'Nike', 'Sports', 2023, 150.00],
            ['Adidas Ultraboost 22', 'Adidas', 'Sports', 2023, 180.00],
        ];

        const productIds = {};
        for (const [product_name, brand, category, model_year, list_price] of products) {
            productIds[product_name] = await ensureProduct(
                product_name,
                brandIds[brand],
                categoryIds[category],
                model_year,
                list_price
            );
        }

        const stocks = [
            ['iPhone 15', 1, 50],
            ['iPhone 15', 2, 30],
            ['Galaxy S24', 1, 40],
            ['WH-1000XM5 Headphones', 1, 25],
            ['Nike Air Max 270', 1, 100],
            ['Adidas Ultraboost 22', 1, 60],
        ];

        for (const [product_name, store_id, quantity] of stocks) {
            const product_id = productIds[product_name];
            const existing = await pool.query(
                `SELECT 1 FROM stocks WHERE store_id = $1 AND product_id = $2`,
                [store_id, product_id]
            );
            if (existing.rowCount === 0) {
                await pool.query(
                    `INSERT INTO stocks (store_id, product_id, quantity) VALUES ($1, $2, $3)`,
                    [store_id, product_id, quantity]
                );
            }
        }

        console.log("seed data successfully");
    } catch (error) {
        console.log("error seed data, please check!", error.message);
    }
};

module.exports = { tableModel, seedData };
