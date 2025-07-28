const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../index'); // путь к Express-приложению
const mongoose = require('mongoose');

describe('Kelerbit CV App', function () {
  this.timeout(5000); // на случай медленного запроса

  describe('POST /submit-offer', () => {
    it('should submit a job offer', async () => {
      const res = await request(app)
        .post('/submit-offer')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          company: 'Test Co',
          position: 'Project Manager',
          link: 'https://example.com/job'
        });
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('ok');
    });
  });

  describe('POST /admin-login', () => {
    it('should return 200 for correct login', async () => {
      const res = await request(app)
        .post('/admin-login')
        .send({ username: 'adminKelerbit', password: '32445' });
      expect(res.status).to.equal(200);
    });

    it('should return 401 for wrong login', async () => {
      const res = await request(app)
        .post('/admin-login')
        .send({ username: 'wrong', password: 'wrong' });
      expect(res.status).to.equal(401);
    });
  });

  describe('GET /api/remote-jobs', () => {
    it('should return an array of jobs', async () => {
      const res = await request(app).get('/api/remote-jobs');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  
  describe('Intentional failure check', () => {
  it('should fail intentionally', () => {
    throw new Error('Intentional failure');
  });
  });

  after(() => {
    mongoose.connection.close(); // закрываем MongoDB после тестов
  });
});
