const createDbTest = require('./seed');
const auth = require('@feathersjs/authentication-client');
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const localStorage = require('localstorage-memory');
const hooks = require('feathers-hooks');
const superagent = require('superagent');

const client = feathers();
client.configure(hooks())
  .configure(rest('http://localhost:3030').superagent(superagent))
  .configure(auth({
    storage: localStorage
  }));

let dbTest;
const Credential = {
  strategy: 'local',
  username: 'alex',
  password: '123'
};


describe('Feathers Client:', () => {
  before(done => {
    this.server = app.listen(3030);
    dbTest = createDbTest(app);
    Promise.resolve(dbTest.createAll())
      .then(() => done());
  });

  after(done => {
    const transactions = dbTest.clearAll();
    const _this = this;
    transactions.push(new Promise(() => {
      client.logout();
      _this.server.close(done);
    }))
    transactions.forEach(async(transaction) => {
      await transaction;
    });
  });

  describe('Login failure', () => {
    it('should fail to get a list of users without authentication', done => {
      client.service('users').find()
        .then(users => {
          expect(users).to.not.ok; //should not get there
        })
        .catch(err => {
          expect(err).to.exist;
          expect(err.code).to.equal(401);
          expect(err.message).to.equal('No auth token');
        })
        .then(() => done());
    });

    it('should fail to get a list of users with invalid credential', done => {
      client.authenticate({})
        .then(() => {
          return client.service('users').find()
        })
        .then(users => {
          expect(users).to.not.ok; //should not get there
        })
        .catch(err => {
          expect(err).to.exist;
          expect(err.code).to.equal(401);
          expect(err.name).to.equal('NotAuthenticated')
          expect(err.message).to.equal('Could not find stored JWT and no authentication strategy was given');
        })
        .then(() => done());
    });
  });

  describe('GET /users', () => {
    it('should login with valid credential', done => {
      client.authenticate(Credential)
        .then(res => {
          expect(res).to.ok;
          expect(res.accessToken).to.equal(client.get('accessToken'));
        })
        .then(() => done())
    });

    it('should get a list of users', done => {
      client.authenticate()
        .then(() => {
          return client.service('users').find();
        })
        .then(users => {
          expect(users).to.exist;
          expect(users).to.be.an('array');
          expect(users[0].quizzes).to.be.an('array');
          expect(users[0].quizzes.length).to.be.above(0);
        })
        .then(() => done());
    });
  });

  describe('GET /quizzes', () => {
    it('should get a list of quizzes', done => {
      client.authenticate()
        .then(() => {
          return client.service('quizzes').find()
        })
        .then(quizzes => {
          expect(quizzes).to.exist;
          expect(quizzes).to.be.an('array');
          expect(quizzes[0].questions).to.be.an('array');
          expect(quizzes[0].questions.length).to.be.above(0);
        })
        .then(() => done());
    });

    it('should fail to get non-exist quiz whose name is "A Quiz"', done => {
      client.authenticate()
        .then(() => {
          return client.service('quizzes')
            .find({
              query: {
                title: 'A Quiz'
              }
            });
        })
        .then(quizzes => {
          expect(quizzes).to.exist;
          expect(quizzes.length).to.equal(0);
        })
        .then(() => done());
    })
    it('should get the quiz with the title "Test Quiz"', done => {
      client.authenticate()
        .then(() => {
          return client.service('quizzes')
            .find({
              query: {
                title: 'Test Quiz'
              }
            });
        })
        .then(quizzes => {
          expect(quizzes).to.exist;
          expect(quizzes).to.be.an('array');
          expect(quizzes[0].title).to.equal('Test Quiz');
          expect(quizzes[0].questions).to.be.an('array');
        })
        .then(() => done());
    });
  });

  describe('GET /questions', () => {
    it('should get a list of questions', done => {
      client.authenticate()
        .then(() => {
          return client.service('questions')
            .find()
        })
        .then(questions => {
          expect(questions).to.exist;
          expect(questions).to.be.an('array');
          expect(questions[0].answers).to.be.an('array');
        })
        .then(() => done());
    });
  });

  describe('GET /answers', () => {
    it('should get a list of answers', done => {
      client.authenticate()
        .then(() => {
          return client.service('answers')
            .find()
        })
        .then(answers => {
          expect(answers).to.exist;
          expect(answers).to.be.an('array');
        })
        .then(() => done());
    });
  });


  describe('POST /quizzes', () => {
    it('should create "New Test Quiz" ', done => {
      client.authenticate()
        .then(() => {
          return client.service('users')
            .find({
              query: {
                username: 'alex'
              }
            });
        })
        .then(users => {
          return client.service('quizzes')
            .create({
              title: 'New Test Quiz',
              author: users[0].id
            });
        }).then(quiz => {
          expect(quiz).to.exist;
          expect(quiz.title).to.equal('New Test Quiz');
        })
        .then(() => done());
    });
  });

  describe('POST /questions', () => {
    it('should create 3 questions for "New Test Quiz"', done => {
      //Get the 'New Test Quiz ID first;
      client.authenticate()
        .then(() => {
          return client.service('quizzes')
            .find({
              query: {
                title: 'New Test Quiz'
              }
            })
        })
        .then(quizzes => {
          return client.service('questions')
            .create([{
              title: 'How do you go to work?',
              type: 'single',
              options: JSON.stringify({
                data: ['Public Transport', 'Uber', 'Taxi', 'Driving']
              }),
              quizId: quizzes[0].id
            }, {
              title: 'What is your favourite movie?',
              type: 'text',
              quizId: quizzes[0].id
            }, {
              title: 'What are your hobbies?',
              type: 'multiple',
              options: JSON.stringify({
                data: ['Reading', 'Programming', 'Swimming', 'Basketball']
              }),
              quizId: quizzes[0].id
            }])
        })
        .then(questions => {
          expect(questions).to.exist;
          expect(questions).to.be.an('array');
          expect(questions.length).to.equal(3);
        })
        .then(() => done());
    });
  });

  describe('POST /answers', () => {
    it('should create an answer for "How do you go to work?"[SINGLE]', (done) => {
      client.authenticate()
        .then(() => {
          return client.service('questions')
            .find({
              query: {
                title: 'How do you go to work?'
              }
            })
        })
        .then(questions => {
          return client.service('answers')
            .create({
              content: JSON.stringify({
                data: 0
              }),
              questionId: questions[0].id
            })
        })
        .then(answer => {
          expect(answer).to.exist;
          expect(JSON.parse(answer.content).data).to.be.a('number');
          expect(JSON.parse(answer.content).data).to.equal(0);
        })
        .then(() => done());
    });

    it('should create an answer for "What is your favourite movie?"[TEXT]', (done) => {
      client.authenticate()
        .then(() => {
          return client.service('questions')
            .find({
              query: {
                title: 'What is your favourite movie?'
              }
            })
        })
        .then(questions => {
          return client.service('answers')
            .create({
              content: JSON.stringify({
                data: 'Pulp Fiction'
              }),
              questionId: questions[0].id
            })
        })
        .then(answer => {
          expect(answer).to.exist;
          expect(JSON.parse(answer.content).data).to.be.a('string');
          expect(JSON.parse(answer.content).data).to.equal('Pulp Fiction');
        })
        .then(() => done());
    });

    it('should create an answer for "What are your hobbies?"[MULTIPLE]', (done) => {
      client.authenticate()
        .then(() => {
          return client.service('questions')
            .find({
              query: {
                title: 'What are your hobbies?'
              }
            })
        })
        .then(questions => {
          return client.service('answers')
            .create({
              content: JSON.stringify({
                data: [1, 2]
              }),
              questionId: questions[0].id
            })
        })
        .then(answer => {
          expect(answer).to.exist;
          expect(JSON.parse(answer.content).data).to.be.an('array');
          expect(JSON.parse(answer.content).data).to.deep.equal([1, 2]);
        })
        .then(() => done());
    });
  });

  describe('DELETE /questions', () => {
    it('should delete the question "What are your hobbies?"', (done) => {
      client.authenticate().then(() => {
          return client.service('questions')
            .remove(null, {
              query: {
                title: 'What are your hobbies?'
              }
            })
        })
        .then(questions => {
          expect(questions).to.exist;
          expect(questions).to.be.an('array');
          expect(questions[0].title).to.equal('What are your hobbies?');
          expect(questions[0].answers).to.be.an('array');
          expect(questions[0].answer.length).to.be.above(0);
        })
        .then(() => done());
    });
  });

  describe('DELETE /quizzes', () => {
    it('should delete the quiz "New Test Quiz" and corresponding questions', (done) => {
      client.authenticate()
        .then(() => {
          return client.service('quizzes')
            .remove(null, {
              query: {
                title: 'New Test Quiz'
              }
            })
        })
        .then(quizzes => {
          expect(quizzes).to.exist;
          expect(quizzes).to.be.an('array');
          expect(quizzes[0].title).to.equal('New Test Quiz');
          expect(quizzes[0].questions).to.be.an('array');
          expect(quizzes[0].questions).to.be.above(0);
        })
        .then(() => done());
    });
  });
});
