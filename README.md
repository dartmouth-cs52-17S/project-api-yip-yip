# starter express app template

* node with babel
* expressjs
* airbnb eslint rules
We can deploy the backend to heroku

$ heroku login
$ heroku create -a yip yip
$ git push heroku master
$ heroku open

Heroku will follow the build command in the package.json and compile assets with webpack.prod.config.js. It runs the Express web server in server.js.

Procfile set up to run on [heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app)
