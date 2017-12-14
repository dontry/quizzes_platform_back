const dbTest = require('./seed');
const app = require('../../src/app');
const request = require('supertest');
const expect = require('chai').expect;
// const request = require('http').request;
describe('Routes:', () => {
  // const models = app.get('models')

  before(async() => {
    this.server =  app.listen(3030);
    const transactions = dbTest.clearAll(app);
    await Promise.all(transactions);
    await dbTest.seedQuiz(app);
    await dbTest.seedQuestion(app);
    await dbTest.seedAnswer(app);
  });

  after(done => {
    this.server.close(done);
  });

  describe('GET /quizzes', () => {
    it('should get a list of quizzes', done => {
      request(app)
        .get('/quizzes')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          // expect(res).to.be.json;
          expect(res.body.data).to.be.an('array');
          done();
        });
    });

    it('should get the quiz with title "Test Quiz"', done => {
      request(app)
        .get('/quizzes')
        .query({title: 'Test Quiz'})
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.be.an('array');
          expect(res.body.data[0].title).to.equal('Test Quiz');
          done();
        });
    });
  });

  describe('GET /questions', () => {
    it('should get a list of questions', done => {
      request(app)
        .get('/questions')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });

  describe('GET /answers', () => {
    it('should get a list of answers', done => {
      request(app)
        .get('/answers')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });
});
