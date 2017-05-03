[![Build Status](https://travis-ci.org/akveo/ng2-admin.svg?branch=master)](https://travis-ci.org/akveo/ng2-admin)
[![Dependency Status](https://david-dm.org/akveo/ng2-admin.svg)](https://david-dm.org/akveo/ng2-admin)

# Admin panel framework based on Angular 2, Bootstrap 4 and Webpack

Admin template made with :heart:  by [Akveo team](http://akveo.com/). Follow us on [Twitter](https://twitter.com/akveo_inc) to get latest news about this template first!

## Building and Running

Get started by installing the dependencies
```
$ npm install
```

### Development

Start the development (local) server.
```
$ npm run server:dev
```

Supports hot-module-replacement and watches the `src/` directory for continuous updates.

### Production

This is entirely a static app powered by backend API. Therefore, we just need to run a simple httpserver to serve the content.

```
npm start
```

#### Heroku

Building with Heroku (or in a Heroku-like environment) requires the following environment variables:

```
NODE_ENV=production
NPM_CONFIG_PRODUCTION=production
```

Then you can build the static distribution with:

```
npm run heroku-postbuild
```

Hint: this is is kicked off by heroku in without any extra configuration.

#### SSL Certificate

An SSL certificate can be obtained from Let's Encrypt. This is achieved by simply adding the correct file path under `src/.lets_encrypt`. That path is then output as `.well-known` in the resulting distribution.

Start by creating a new certificate with:
```
$ sudo certbot certonly --manual
```

Which will shortly bring you to a screen that says something like:
```
Make sure your web server displays the following content at
http://inchworm.io/.well-known/acme-challenge/ya6k1ed-SOME-LONG-URL before continuing:

ya6k1edW38z-your-value-here
```
**Don't continue yet!!**

Now you need to update/create the correct file under `src/.lets_encrypt` with the correct content. This has been automated as a part of a deployment task, mediated by environment variables. The variables you need to set on the production app are:

 * LETS_ENCRYPT_FILE
 * LETS_ENCYRPT_SECRET

Generally, this will be in the form like:

```
LETS_ENCRYPT_FILE=8INHpryNgZwf9fdL7ZUaGErv8FRtR0KA0sBcynfoMds
LETS_ENCRYPT_SECRET=8INHpryNgZwf9fdL7ZUaGErv8FRtR0KA0sBcynfoMds.ZiFMKNhK_iyLdSdCd0gVBAeiNjRDf47zYCWJaWeojo0
```

which maps ```LETS_ENCRYPT_SECRET``` to `http://app.fineo.io/.well-known/acme-challenge/${LETS_ENCRYPT_FILE}.html`.

Then you just need to redeploy the application with the new path and verify that the Let's Encrypt path matches the value.

See [this post](http://collectiveidea.com/blog/archives/2016/01/12/lets-encrypt-with-a-rails-app-on-heroku/) on how Let's Encrypt can work on Heroku and Rails (hint: this is only slightly different).

##### Updates

When you are ready to update the certificate, do:

```
$ sudo certbot certonly --manual -d app.fineo.io
```

### Demo

<a target="_blank" href="http://akveo.com/ng2-admin/"><img src="http://i.imgur.com/QK9AzHj.jpg" width="600" alt="Sky Blue"/></a>

<a target="_blank" href="http://akveo.com/ng2-admin/">Live Demo</a>

## Angular 1.x version
Here you can find Angular 1.x based version: [Blur Admin](http://akveo.github.io/blur-admin/)
 
## Documentation
Installation, customization and other useful articles: https://akveo.github.io/ng2-admin/

## Based on
Angular 2, Bootstrap 4, Webpack and lots of awesome modules and plugins

## How can I support developers?
- Star our GitHub repo :star:
- Create pull requests, submit bugs, suggest new features or documentation updates :wrench:
- Follow us on [Twitter](https://twitter.com/akveo_inc) :feet:
- Like our page on [Facebook](https://www.facebook.com/akveo/) :thumbsup:

## Can I hire you guys?
Yes!  Visit [our homepage](http://akveo.com/) or simply leave us a note to [contact@akveo.com](mailto:contact@akveo.com). We will be happy to work with you!

## Features
* TypeScript
* Webpack
* Responsive layout
* High resolution
* Bootstrap 4 CSS Framework
* Sass
* Angular 2
* jQuery
* Charts (Chartist, Chart.js)
* Maps (Google, Leaflet, amMap)
* and many more!

##License
[MIT](LICENSE.txt) license.

### From akveo

Enjoy :metal:
We're always happy to hear your feedback!
