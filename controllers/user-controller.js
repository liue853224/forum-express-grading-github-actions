const db = require('../models')
const { User, Comment, Restaurant, Favorite } = db
const bcrypt = require('bcryptjs')
const { localFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) { throw new Error('密碼好像不一致喔,請再輸入一次') }

    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) { throw new Error('email已註冊過了,換一個試試看') }
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => {
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash
        })
      })
      .then(() => {
        req.flash('success_messages', '成功註冊帳號')
        res.redirect('/signin')
      }).catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res, next) => {
    req.flash('success_messages', '登出成功！')
    req.logout(err => {
      if (err) { return next(err) }
      res.redirect('/signin')
    })
  },
  getUser: (req, res, next) => {
    return Promise.all([User.findByPk(req.params.id), Comment.findAll({
      raw: true,
      include: Restaurant,
      nest: true,
      where: {
        userId: req.params.id
      }
    })])
      .then(([user, comments]) => {
        if (!user) throw new Error("User didn't exists!")
        console.log('評論資料:' + JSON.stringify(comments, null, 2))
        return res.render('users/profile', { user: user.toJSON(), comments })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error("User didn't exists!")
        return res.render('users/edit', { user: user.toJSON() })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    const { file } = req // 把檔案取出來
    console.log('上傳的檔案:' + file)
    if (req.user.id !== Number(req.params.id)) throw new Error('只能更改自己的資料！')
    if (!name.trim()) throw new Error('User name is required!')
    return Promise.all([
      User.findByPk(req.params.id),
      localFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([user, filePath]) => { // 以上兩樣事都做完以後
        if (!user) throw new Error("User didn't exist!")
        return user.update({ // 修改這筆資料
          name,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${req.params.id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")

        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController
