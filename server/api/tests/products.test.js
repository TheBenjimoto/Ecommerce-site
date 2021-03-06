'use strict';
/*eslint-disable*/
var expect = require('chai').expect;
var request = require('supertest-as-promised');


var app = require('../../start.js');

var agent = request.agent(app);

var db = require('APP/db');
var Order = require('APP/db/models/order');

var LineItem = require('APP/db/models/lineitem');
var Product = require('APP/db/models/product');
var User = require('APP/db/models/user');
var Review = require('APP/db/models/review');
var Promise = require('bluebird');


describe('Products Route: ', function(){
  var user, product, review;
  //clear db before beginning each run

  before('waiting for db to sync', () => db.didSync);

  beforeEach(function () {
    return db.sync({force: true})
    .then(()=>{

    product = Product.create({
      title: 'newgame',
      description: 'some description',
      price: 5,
      inventory: 10,
      imgUrl: 'www.google.com'
    })

    user = User.create({
      firstName: 'asdf',
      lastName: 'qwerty',
      email: 'asdf@gmail.com',
      isAdmin: 'FALSE',
      password_digest: 'asdfasfd'
    })

    Promise.all([product, user])
    .spread((newProduct, newUser) => {
      product = newProduct
      user = newUser
      return LineItem.create({
        quantity: 2,
        user_id: newUser.id,
        product_id: newProduct.id,
        price: 5

      })
    })
    .then(newlineitem =>{
      LineItem.purchase(user.id).then()
      review = Review.create({
        title: 'blahblah',
        body: 'okay',
        rating: 5
      })
      return review;
    })

  })
  });

  describe('PRODUCTS', function(){
      describe('GET /products', function(){
        it('returns all products in db', function () {
          agent
          .get('/products')
          .expect(200)
          .expect(function (res) {
            expect(res.body).to.be.an.instanceOf(Array);
            expect(res.body[0].title).to.equal('newgame');
            // ASO TESTING FOR EAGER LOADING
            expect(res.body[0].categories).to.be.an.instanceOf(Array);
            expect(res.body[0].reviews).to.be.an.instanceOf(Array);
          })
        })
      });

      describe('GET /products/:id', function(){
        it('returns product, given id', function () {
          agent
          .get(`/products/${product.id}`)
          .expect(200)
          .expect(function (res) {
            expect(res.body.title).to.equal('newgame');
          })
        });
      });

      describe('POST /products/:id', function(){
        it('posts product given id', function () {
          agent
          .post(`/products/`)
          .send({
            title: 'anothergame',
            description: 'another description',
            price: 12,
            inventory: 20,
            imgUrl: 'www.espn.com'
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body.title).to.equal('anothergame');
            Product.findOne({where:{title:'anothergame'}})
            .then(function (b) {
              expect(b).to.not.be.null;
              done();
            })
            .catch(done);
          });
        });
      });

      describe('PUT /products/:id', function(){
        it('updates product given id', function () {
          agent
          .put(`/products/${product.id}`)
          .send({
            title: 'oldgame'
          })
          .expect(201)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body.title).to.equal('oldgame');
          });
        });
      });

      describe('DELETE /products/:id', function(){
        it('deletes product', function(){
          agent
          .delete(`/products/${product.id}`)
          .expect(204)
          .end(function (err, res) {
            if (err) return done(err);
            Product.findById(product.id)
            .then(function (b) {
              expect(b).to.be.null;
              done();
            })
            .catch(done);
          });
        })
      })
  })

  describe('REVIEWS', function(){
      describe('POST /products/:id/reviews/:reviewId', function(){
        it('posts review given id', function () {
          agent
          .post(`/products/${product.id}/reviews/`)
          .send({
            title: 'meh',
            body: 'twas ok',
            rating: 3
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body.rating).to.equal(3);
            Review.findOne({where:{title:'meh'}})
            .then(function (b) {
              expect(b).to.not.be.null;
              done();
            })
            .catch(done);
          });
        });
      });

      describe('PUT /products/:id/reviews/:reviewId', function(){
        it('updates review given id', function () {
          agent
          .put(`/products/${product.id}/reviews/${review.id}`)
          .send({
            status: 'Processing'
          })
          .expect(201)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body[0].status).to.equal('Processing');
            Review.findById(product.id)
            .then(function (b) {
              expect(b).to.not.be.null;
              done();
            })
            .catch(done);
          });
        });
      });

      describe('DELETE /products/:id/review/:reviewId', function(){
        it('deletes review', function(){
          agent
          .delete(`/products/${product.id}/reviews/${review.id}`)
          .expect(204)
          .end(function (err, res) {
            if (err) return done(err);
            Review.findById(product.id)
            .then(function (b) {
              expect(b).to.be.null;
              done();
            })
            .catch(done);
          });
        })
      })
  })
})
