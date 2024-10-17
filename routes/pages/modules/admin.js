const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/pages/admin-controller')
const categoryController = require('../../../controllers/pages/category-controller')
const upload = require('../../../middleware/multer')
// restaurants
router.get('/restaurants', adminController.getRestaurants)
router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
// users
router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)
// categories
router.get('/categories/:id', categoryController.getCategories)
router.put('/categories/:id', categoryController.putCategory)
router.delete('/categories/:id', categoryController.deleteCategory)
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategory)
// no match
router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router