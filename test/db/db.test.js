const createDbTest = require('./seed');

describe('Routes:', () => {
  // const models = app.get('models')

  before(async() => {
    this.server = app.listen(3030);
    const dbTest = await createDbTest(app);
    //I have to set a timeout to wait for the creation of data tables
    const x =  new Promise((res, rej) => {setTimeout(() => {
      res();
    }, 100)});
    await Promise.resolve(x);
    const transactions = dbTest.clearAll();
    await Promise.all(transactions);
    await dbTest.seedQuiz();
    await dbTest.seedQuestion();
    await dbTest.seedAnswer();
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

  describe('POST /quizzes', () => {
    it('should create a quiz', done => {
      request(app)
      .post('/quizzes')
      .send({title:'New Test Quiz', author:'Dong Cai'})
      .set('Accept','application/json')
      .end(function(err, res) {
        expect(res.status).to.equal(201);
        expect(res.body.title).to.equal('New Test Quiz');
        expect(res.body.author).to.equal('Dong Cai');
        done();
      });
    });
  });

  describe('POST /questions', () => {
    it('should create a question', done => {
      request(app)
      .post('/questions')
      .send({title:'Where are you from?', type: 'text', quizId: 1})
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(res.status).to.equal(201);
        done();
      });
    })
  })

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
