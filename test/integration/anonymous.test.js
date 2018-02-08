const auth = require('@feathersjs/authentication-client');
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const localStorage = require('localstorage-memory');
const hooks = require('feathers-hooks');

const client = feathers();
client.configure(hooks())
  .configure(rest('http://localhost:3030').superagent(superagent))
  .configure(auth({
    storage: localStorage
  }));




describe('################# ANONYMOUS TEST ###################', () => {
  before(done => {
    this.server = app.listen(3030, async () => {
      await app.get('sequelize').sync();
      await dbTest.createAll('USER')
      done()
    });
  });

  after(done => {
    dbTest.dropAll('ANONYMOUS')
      .then(async () => {
        await client.logout();
        await this.server.close();
      })
      .catch((err) => {
        console.log('ERROR:' + err);
        this.server.close();
      })
      .then(() => done());
  });

  //=============USER alice========================//
  describe('Login as ANONYMOUS: ', () => {
    let userId;
    const Credential = {
      strategy: 'local',
      username: 'alice',
      password: '123'
    };

    describe('GET /users', () => {
      it('should fail to get users\' profile', done => {
        client.service('users')
          .find()
          .then(users => {
            expect(users).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to find users');
          })
          .then(() => done());
      });
    });

    describe('GET /quizzes', () => {
      it('should get PUBLISHED quiz 1', done => {
        client.service('quizzes').get(1)
          .then(quiz => {
            expect(quiz).to.exist;
            expect(quiz.id).to.equal(1)
          })
          .then(() => done());
      });

      it('should fail to get UNPUBLISHED quiz 2', done => {
        client.service('quizzes').get(2)
          .then(quiz => {
            expect(quiz).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to get quizzes');
          })
          .then(() => done());
      });

      it('should fail to get FINISHED quiz 3', done => {
        client.service('quizzes').get(3)
          .then(quiz => {
            expect(quiz).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to get quizzes');
          })
          .then(() => done());
      });

      it('should fail to find quiz by searching title', done => {
        client.service('quizzes')
          .find({
            query: {
              title: 'Test Quiz 3'
            }
          })
          .then(quizzes => {
            expect(quizzes).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to find quizzes');
          })
          .then(() => done());
      })
    });

    describe('GET /questions', () => {
      it('should fail to get questions', done => {
        client.service('questions')
          .find()
          .then(questions => {
            expect(questions).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to find questions');
          })
          .then(() => done());
      })
    })

    describe('POST /quizzes', () => {
      it('should fail to create "New Test Quiz" ', done => {
        client.service('quizzes')
          .create({
            title: 'New Test Quiz'
          })
          .then(quiz => {
            expect(quiz).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to create quizzes');
          })
          .then(() => done());
      });
    });

    describe('POST /answers', () => {
      it('should create an answer for question 1', done => {
        client.service('answers')
          .create({
            content: JSON.stringify({
              data: 0
            }),
            questionId: 1
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to create answers');
          })
          .then(() => done());
      });
    });

    describe('PUT /users', () => {
      it('should fail to update the user 1\'s last name', done => {
        client.service('users')
          .update(1, {
            username: 'alice',
            password: '123',
            role: 'user',
            firstname: 'Alice',
            lastname: 'Williamson',
            gender: 'female'
          })
          .then(user => {
            expect(user).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to update users');
          })
          .then(() => done());
      })
    })

    describe('PUT /quizzes', () => {
      it('should fail to update the status of quiz 2 to \'PUBLISHED\'', done => {
        // Update does not support query param, so we have to find the id first;
        client.service('quizzes')
          .update(2, {
            title: 'Test Quiz 2',
            author: userId,
            status: 'PUBLISHED'
          })
          .then(quiz => {
            expect(quiz).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to update quizzes');
          })
          .then(() => done());
      })
    })

    describe('PATCH /users', () => {
      it('should fail to change the attribute \'firstname\' of user 1', done => {
        client.service('users')
          .patch(1, {
            firstname: 'Alison'
          })
          .then(user => {
            expect(user).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to patch users');
          })
          .then(() => done());
      })
    })

    describe('PATCH /quizzes', () => {
      it('should fail to change the status of quiz 2 to \'FINISHED\'', done => {
        client.service('quizzes')
          .patch(2, {
            status: 'FINISHED'
          })
          .then(quizzes => {
            expect(quizzes).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to patch quizzes');
          })
          .then(() => done());
      })
    })

    describe('PATCH /questions', () => {
      it('should fail to change the question 5', done => {
        client.service('questions')
          .patch(5, {
            title: 'Who is your favorite basketball star?'
          })
          .then(question => {
            expect(question).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to patch questions');
          })
          .then(() => done());
      })
    })

    describe('PATCH /answers', () => {
      it('should fail to change the answer 1', done => {
        client.service('answers')
          .patch(1, {
            data: []
          })
          .then(answer => {
            expect(answer).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to patch answers');
          })
          .then(() => done());
      })
    })

    describe('DELETE /answers', () => {
      it('should fail to delete answer 5', done => {
        client.service('answers')
          .remove(5)
          .then(answer => {
            expect(answer).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to remove answers');
          })
          .then(() => done());
      })
   })

    describe('DELETE /questions', () => {
      it('should fail to delete the question 1', done => {
        client.service('questions')
          .remove(1)
          .then(question => {
            expect(qestion).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to remove questions');
          })
          .then(() => done());
      })
    })

    describe('DELETE /quizzes', () => {
      it('should fail to delete the quiz 1', done => {
        client.service('quizzes')
          .remove(1)
          .then(quiz => {
            expect(quiz).to.not.ok
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to remove quizzes');
          })
          .then(() => client.logout())
          .then(() => done());
      });
    });
  });
});
