const express = require('express')
const { createCategories, getAllcategories, getCategoriesById, updateCategories, deleteCategories } = require('../controller/categories.controller')
const categoriesRoute = express.Router()

categoriesRoute.route('/')
                .post(createCategories)
                .get(getAllcategories)

categoriesRoute.route('/:id')
                .get(getCategoriesById)
                .patch(updateCategories)
                .delete(deleteCategories)

module.exports = categoriesRoute