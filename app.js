require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const path = require('path')

const handlebars = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')

const passport = require('./config/passport')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { getUser } = require('./helpers/auth-helpers')
const { pages, apis } = require('./routes')

// set hbs
app.engine('hbs', handlebars.engine({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')
// set body parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))
// set session
const SESSION_SECRET = 'secret'
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
// set passport
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages') // 設定 success_msg 訊息
  res.locals.error_messages = req.flash('error_messages') // 設定 warning_msg 訊息
  res.locals.user = getUser(req)
  next()
})
// set route
app.use('/api', apis)
app.use(pages)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
