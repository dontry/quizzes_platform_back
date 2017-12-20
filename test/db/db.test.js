const createDbTest = require('./seed');
const timeout = require('../../src/utils/timeout');

describe('Routes:', () => {
  // const models = app.get('models')

  before(async() => {
    this.server = app.listen(3030);
    const dbTest = await createDbTest(app);
    //I have to set a timeout to wait for the creation of data tables
    await Promise.resolve(timeout(500));
    await dbTest.createAll();
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
          expect(res.body).to.be.an('array');
          done();
        });
    });

    it('should get the quiz with title Test Quiz"', done => {
      request(app)
        .get('/quizzes')
        .query({
          title: 'Test Quiz'
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(1);
          expect(res.body[0].title).to.equal('Test Quiz');
          expect(res.body[0].Questions).to.be.an('array');
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

  describe('POST /quizzes', () => {
    it('should create "New Test Quiz" ', done => {
      request(app)
        .post('/quizzes')
        .send({
          title: 'New Test Quiz',
          author: 'Dong Cai'
        })
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.title).to.equal('New Test Quiz');
          expect(res.body.author).to.equal('Dong Cai');
          done();
        });
    });
  });

  describe('POST /questions', () => {
    it('should create 3 questions for "New Test Quiz"', done => {
      //Get the 'New Test Quiz ID first;
      request(app)
        .get('/quizzes')
        .query({
          title: 'New Test Quiz'
        })
        .then((res) => {
          const quizId = res.body[0].id;
          request(app)
            .post('/questions')
            .send([{
              title: 'How do you go to work?',
              type: 'single',
              options: JSON.stringify({
                data: ['Public Transport', 'Uber', 'Taxi', 'Driving']
              }),
              quizId: quizId
            }, {
              title: 'What is your favourite movie?',
              type: 'text',
              quizId: quizId
            }, {
              title: 'What are your hobbies?',
              type: 'multiple',
              options: JSON.stringify({
                data: ['Reading', 'Programming', 'Swimming', 'Basketball']
              }),
              quizId: quizId
            }])
            .set('Accept', 'application/json')
            .end((err, res) => {
              expect(res.status).to.equal(201);
              expect(res.body).to.be.an('array');
              expect(res.body.length).to.equal(3);
              done();
            });
        });
    });
  });

  describe('POST /answers', () => {
    it('should create an answer for "How do you go to work?"[SINGLE]', (done) => {
      request(app)
        .get('/questions')
        .query({
          title: 'How do you go to work?'
        }).then((res, err) => {
          const questionId = res.body[0].id;
          request(app)
            .post('/answers')
            .send({
              content: JSON.stringify({
                data: 0
              }),
              questionId: questionId
            })
            .set('Accept', 'application/json')
            .end((err, res) => {
              expect(res.status).to.equal(201);
              const answer = JSON.parse(res.body.content).data;
              expect(answer).to.be.a('number');
              expect(answer).to.equal(0);
              done();
            });
        });
    });

    it('should create an answer for "What is your favourite movie?"[TEXT]', (done) => {
      request(app)
        .get('/questions')
        .query({
          title: 'What is your favourite movie?'
        }).then((res, err) => {
          const questionId = res.body[0].id;
          request(app)
            .post('/answers')
            .send({
              content: JSON.stringify({
                data: 'Pulp Fiction'
              }),
              questionId: questionId
            })
            .set('Accept', 'application/json')
            .end((err, res) => {
              expect(res.status).to.equal(201);
              const answer = JSON.parse(res.body.content).data;
              expect(answer).to.be.a('string');
              expect(answer).to.equal('Pulp Fiction');
              done();
            });
        });
    });

    it('should create an answer for "What are your hobbies?"[MULTIPLE]', (done) => {
      request(app)
        .get('/questions')
        .query({
          title: 'What are your hobbies?'
        }).then((res, err) => {
          const questionId = res.body[0].id;
          request(app)
            .post('/answers')
            .send({
              content: JSON.stringify({
                data: [1, 2]
              }),
              questionId: questionId
            })
            .set('Accept', 'application/json')
            .end((err, res) => {
              expect(res.status).to.equal(201);
              const answer = JSON.parse(res.body.content).data;
              expect(answer).to.be.an('array');
              expect(answer).to.deep.equal([1, 2]);
              done();
            });
        });
    });
  });

  describe('DELETE /questions', () => {
    it('should delete the question "What are your hobbies?"', (done) => {
      request(app)
      .delete('/questions')
      .query({
        title: 'What are your hobbies?'
      })
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body[0].title).to.equal('What are your hobbies?');
        expect(res.body[0].Answers).to.be.an('array');
        done();
      });
    });
  });

  describe('DELETE /quizzes', () => {
    it('should delete the quiz "New Test Quiz" and corresponding questions', (done) => {
      request(app)
      .delete('/quizzes')
      .query({
        title: 'New Test Quiz'
      })
      .set('Accept', 'application/json')
      .then((res, err) => {
        expect(res.status).to.equal(200);
        expect(res.body[0].title).to.equal('New Test Quiz');
        return res.body[0];
      })
      .then((res, err) => {
        request(app)
        .get('/questions')
        .query({quizId: res.id})
        .end((err, res) => {
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(0);
          done();
        })
      });
    });
  });
});
