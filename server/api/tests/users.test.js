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
var Address = require('APP/db/models/address');
var CreditCard = require('APP/db/models/creditcard');
var Promise = require('bluebird');

describe('Users Route: ', function(){
  var user, product, review, lineitem, address, creditcard;
  //clear db before beginning each run

  before('waiting for db to sync', () => db.didSync);

  beforeEach(function () {
    return db.sync({force: true})
    .then(() => {

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
      return LineItem.create({
        quantity: 2,
        user_id: user.id,
        product_id: product.id,
        price: 5
      }).then(newlineitem =>{
        lineitem = newlineitem
        LineItem.purchase(user.id).then()
        review = Review.create({
          title: 'blahblah',
          body: 'okay',
          rating: 5
        })
        address = Address.create({
          address1: '0987',
          address2: '52 St',
          city: 'New York',
          state: 'NY',
          zipCode: '12345'
        })
        creditcard = CreditCard.create({
          number: '9876',
          name: 'qwerty',
          month: 3,
          year: 2019,
          CCV: 543
        })
        Promise.all([address, creditcard])
        .then()
      })
    })

  })
  });

  describe('USERS', function(){
      describe('GET /users', function(){
        it('returns all users in db', function () {
          agent
          .get('/users')
          .expect(200)
          .expect(function (res) {
            expect(res.body).to.be.an.instanceOf(Array);
            expect(res.body[0].firstName).to.equal('asdf');
          })
        })
      });

      describe('GET /users/:id', function(){
        it('returns user, given id', function () {
          agent
          .get(`/users/${product.id}`)
          .expect(200)
          .expect(function (res) {
            expect(res.body.firstName).to.equal('jkl');
          })
        });
      });

      describe('GET /users/:id/address', function(){
        it('returns addresses given user', function () {
          agent
          .get(`/users/${user.id}/address`)
          .expect(200)
          .expect(function (res) {
            expect(res.body).to.be.an.instanceOf(Array);
            expect(res.body[0].address1).to.equal('0987');
          })
        });
      });

      describe('POST /users/:id/address', function(){
        it('posts address given user', function () {
          agent
          .post(`/users/${user.id}/address`)
          .send({
            address1: '1234',
            address2: '56 St',
            city: 'New York',
            state: 'NY',
            zipCode: '12345'
          })
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            expect(res.body.firstName).to.equal('jkl');
            Address.findOne({where:{address1:'1234'}})
            .then(function (b) {
              expect(b).to.not.be.null;
              expect(b.user_id).to.not.be.null;
              done();
            })
          })
        });
      });

      describe('GET /users/:id/creditcard', function(){
        it('returns credit cards given user', function () {
          agent
          .get(`/users/${user.id}/creditcard`)
          .expect(200)
          .expect(function (res) {
            expect(res.body).to.be.an.instanceOf(Array);
            expect(res.body[0].number).to.equal('123123');
          })
        });
      });

      describe('POST /users/:id/creditcard', function(){
        it('posts credit card given user', function () {
          agent
          .post(`/users/${user.id}/creditcard`)
          .send({
            number: '456456',
            name: 'justin',
            month: 3,
            year: 2020,
            CCV: 123
          })
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            expect(res.body.firstName).to.equal('456456');
            Address.findOne({where:{number:'456456'}})
            .then(function (b) {
              expect(b).to.not.be.null;
              expect(b.user_id).to.not.be.null;
              done();
            })
          })
        });
      });

      describe('PUT /users/:id', function(){
        it('updates user given id', function () {
          agent
          .put(`/users/${user.id}`)
          .send({
            lastName: 'blah'
          })
          .expect(201)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body.lastName).to.equal('blah');
            User.findById(user.id)
            .then(function (b) {
              expect(b).to.not.be.null;
              done();
            })
            .catch(done);
          });
        });
      });

      describe('DELETE /users/:id', function(){
        it('deletes user given id', function(){
          agent
          .delete(`/users/${user.id}`)
          .expect(204)
          .end(function (err, res) {
            if (err) return done(err);
            User.findById(user.id)
            .then(function (b) {
              expect(b).to.be.null;
              done();
            })
            .catch(done);
          });
        })
      })
  })

  describe('CART', function(){
      describe('GET /users/:id/cart', function(){
        it('returns all cart items for given user', function () {
          agent
          .get('/users/:id/cart')
          .expect(200)
          .expect(function (res) {
            expect(res.body).to.be.an.instanceOf(Array);
            expect(res.body[0].title).to.equal('easy');
          })
        })
      });

      describe('POST /users/cart/:productId', function(){
        it('adds item to cart', function () {
          agent
          .post(`/users/${user.id}/cart/${product.id}`)
          .send({
            quantity: 10,
            price: 5
          })
          .expect(200)
          .expect(function (res) {
          })
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body.quantity).to.equal('10');
            LineItem.findOne({where:{quantity:10}})
            .then(function (b) {
              expect(b).to.not.be.null;
              done();
            })
            .catch(done);
          });
        });
      });

      describe('PUT /users/:id/cart/:productId', function(){
        it('updates cart quantity given product id', function () {
          agent
          .put(`/users/${user.id}/cart/${product.id}`)
          .send({
            quantity: 9
          })
          .expect(201)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body.quantity).to.equal('9');
            LineItem.findById(lineitem.id)
            .then(function (b) {
              expect(b).to.not.be.null;
              done();
            })
            .catch(done);
          });
        });
      });

      describe('DELETE /users/:id/cart/:productId', function(){
        it('deletes product from user cart', function(){
          agent
          .delete(`/users/${user.id}/cart/${lineitem.id}`)
          .expect(204)
          .end(function (err, res) {
            if (err) return done(err);
            LineItem.findAll()
            .then(function (b) {
              expect(b).to.be.null;
              done();
            })
            .catch(done);
          });
        })
      })
  })

  describe('SUBMIT ORDERS', function(){
      describe('POST /users/:id/orders/', function(){
        it('updates article given id', function () {
          agent
          .post(`/users/${user.id}/orders/`)
          .expect(201)
          .expect(function (res) {
            expect(res.body.status).to.equal('Created');
          })
        });
      });
  })
})
