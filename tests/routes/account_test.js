const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.expect();

const API_URL = 'http://localhost:3000';

describe('Account', () => {
  it('should be able to register new account', () => {
    chai.request(API_URL)
      .post('/api/account/register')
      .send({
        email: 'test@example.com',
        password: 'P@ssw0rd',
        confirmation: 'P@ssw0rd'
      })
      .then(response => {
        // TODO: Implement response check
      })
      .catch(error => {

      });
  });

  it.only('should be able to login', () => {
    return chai.request(API_URL)
      .post('/api/account/login')
      .send({
        email: 'test@example.com',
        password: 'P@ssw0rd'
      })
      .then(response => {
        // TODO: Implement response check
        expect(response).to.have.property('statusCode').equal('200');

        const json = JSON.parse(response.text);

        console.log(response.text);
      });
  });

  it('should be send reset password request', () => {
    chai.request(API_URL)
      .post('/api/account/reset')
      .send({
        username: 'test@example.com',
        password: 'P@ssw0rd'
      })
      .then(response => {
        // TODO: Implement response check
      })
      .catch(error => {

      });
  });

  it('should be set new password', () => {
    chai.request(API_URL)
      .post('/api/account/resetpassword')
      .send({
        username: 'test@example.com',
        password: 'P@ssw0rd'
      })
      .then(response => {
        // TODO: Implement response check
      })
      .catch(error => {

      });
  });

  it('should verify user email', () => {
    chai.request(API_URL)
      .post('/api/account/resetpassword')
      .send({
        username: 'test@example.com',
        password: 'P@ssw0rd'
      })
      .then(response => {
        // TODO: Implement response check
      })
      .catch(error => {

      });
  });
});

//   ../server/routes/admin-router.js:router.get('/users/', middleware.adminRequired, async (req, res) => {
//   ../server/routes/app-router.js:router.get('/', function(req, res) {
//   ../server/routes/app-router.js:router.get('/error', function(req, res) {
