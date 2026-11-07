const express = require('express')
const { createBrands, getAllBrand, getBrandById, updateBrandById, deleteBrandById } = require('../controller/brand.controller')

const brandRoute = express.Router()

brandRoute.route('/')
        .post(createBrands)
        .get(getAllBrand)

brandRoute.route('/:id')
            .get(getBrandById)
            .patch(updateBrandById)
            .delete(deleteBrandById)

module.exports = brandRoute