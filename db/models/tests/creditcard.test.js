// TOOD: Everyone please npm install, I installed chai-properties and chai-things to dev
/* eslint-disable */
import chai from 'chai';
import chaiProperties from 'chai-properties';
import chaiThings from 'chai-things';
chai.use(chaiProperties);
chai.use(chaiThings);
const expect = chai.expect;
const db = require('APP/db');
const CreditCard = require('APP/db/models/creditcard');
const User = require('APP/db/models/user');
const Promise = require('bluebird');

describe('Credit Card model', function () {

  it('has the expected schema definition', () => {
    expect(CreditCard.attributes.number).to.be.an('object');
    expect(CreditCard.attributes.name).to.be.an('object');
    expect(CreditCard.attributes.month).to.be.an('object');
    expect(CreditCard.attributes.year).to.be.an('object');
    expect(CreditCard.attributes.CCV).to.be.an('object');
  });

  describe('validations', () => {
    // The `title` column should be a required field.
    it('requires number', () => {
      const creditcard = CreditCard.build();
      return creditcard.validate()
        .then(err => {
          expect(err).to.be.an('object');
          expect(err.errors).to.contain.a.thing.with.properties({
            path: 'number',
            type: 'notNull Violation'
          });
        });
    });

    it('requires name', () => {
      const creditcard = CreditCard.build();
      return creditcard.validate()
        .then(err => {
          expect(err).to.be.an('object');
          expect(err.errors).to.contain.a.thing.with.properties({
            path: 'name',
            type: 'notNull Violation'
          });
        });
    });

    it('requires month', () => {
      const creditcard = CreditCard.build();
      return creditcard.validate()
        .then(err => {
          expect(err).to.be.an('object');
          expect(err.errors).to.contain.a.thing.with.properties({
            path: 'month',
            type: 'notNull Violation'
          });
        });
    });

    it('requires year', () => {
      const creditcard = CreditCard.build();
      return creditcard.validate()
        .then(err => {
          expect(err).to.be.an('object');
          expect(err.errors).to.contain.a.thing.with.properties({
            path: 'year',
            type: 'notNull Violation'
          });
        });
    });

    it('requires CCV', () => {
      const creditcard = CreditCard.build();
      return creditcard.validate()
        .then(err => {
          expect(err).to.be.an('object');
          expect(err.errors).to.contain.a.thing.with.properties({
            path: 'CCV',
            type: 'notNull Violation'
          });
        });
    });
  })

  describe('associations', () => {
    it('belongs to a user', () => {

      let creatingUser = User.create({
        firstName: 'Ben',
        lastName: 'Gu',
        email: 'test@test.com',
        isAdmin: false
      })
      let creatingCreditCard = CreditCard.create({
        number: 1234,
        name: 'Benjamin Gu',
        month: 10,
        year: 2016,
        CCV: 445
      })

      return Promise.all([creatingUser, creatingCreditCard])
        .spread((createdUser, createdCreditCard) => {
          return createdCreditCard.setUser(createdUser)
        })
        .then(foundCreditCard => {
          expect(foundCreditCard.user_id).to.exist;
        })
    })
  })
});
