const express = require('express')
const { createProdect, getAllProduct, getProductById, updateProductById, deleteProductById } = require('../controller/product.controller')

const productsRoute = express.Router()

productsRoute.route('/')
            .post(createProdect)
            .get(getAllProduct)

productsRoute.route('/:id')
            .get(getProductById)
            .patch(updateProductById)
            .delete(deleteProductById)

module.exports = productsRoute