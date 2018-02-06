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




describe('################# USER TEST ###################', () => {
  before(done => {
    this.server = app.listen(3030, async () => {
      await app.get('sequelize').sync();
      await dbTest.createAll('USER')
      done()
    });
  });

  after(done => {
    dbTest.dropAll('CLIENT')
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
  describe('Login as USER "alice": ', () => {
    let userId;
    const Credential = {
      strategy: 'local',
      username: 'alice',
      password: '123'
    };

    it('should login with valid credential', done => {
      client.authenticate(Credential)
        .then(res => {
          expect(res).to.ok;
          expect(res.accessToken).to.equal(client.get('accessToken'));
          return app.passport.verifyJWT(res.accessToken, app.get('authentication'));
        })
        .then(payload => {
          userId = payload.userId;
          return userId;
        })
        .then(userId => {
          client.service('users').get(userId)
            .then(user => {
              expect(user).to.exist;
              expect(user.username).to.equal('alice');
            })
        })
        .then(() => done())
    });

    describe('GET /users', () => {
      it('should get alice\'s user profile', done => {
        client.service('users').find()
          .then(users => {
            expect(users).to.exist;
            expect(users).to.be.an('array');
            expect(users.length).to.equal(1);
            expect(users[0].username).to.equal('alice');
            expect(users[0].quizzes).to.be.an('array');
            expect(users[0].quizzes.length).to.be.above(0);
          })
          .then(() => done());
      });
    });

    describe('GET /quizzes', () => {
      it('should get 1 quizzes belonging to "alice"', done => {
        client.service('quizzes').find()
          .then(quizzes => {
            expect(quizzes).to.exist;
            expect(quizzes).to.be.an('array');
            expect(quizzes.length).to.equal(2);
          })
          .then(() => done());
      });

      it('should fail to get non-exist quiz whose name is "A Quiz"', done => {
        client.service('quizzes')
          .find({
            query: {
              title: 'A Quiz'
            }
          })
          .then(quizzes => {
            expect(quizzes).to.exist;
            expect(quizzes.length).to.equal(0);
          })
          .then(() => done());
      })

      it('should fail to get the existing quiz "Test Quiz 3" which does not belong to USER "alice"', done => {
        client.service('quizzes')
          .find({
            query: {
              title: 'Test Quiz 3'
            }
          })
          .then(quizzes => {
            expect(quizzes).to.exist;
            expect(quizzes.length).to.equal(0);
          })
          .then(() => done());
      })

      it('should get the quiz with the title "Test Quiz 1"', done => {
        client.service('quizzes')
          .find({
            query: {
              title: 'Test Quiz 1'
            }
          })
          .then(quizzes => {
            expect(quizzes).to.exist;
            expect(quizzes).to.be.an('array');
            expect(quizzes[0].title).to.equal('Test Quiz 1');
            expect(quizzes[0].questions).to.be.an('array');
          })
          .then(() => done());
      });
    });

    describe('GET /questions', () => {
      it('should fail to get question not belonging to her', done => {
        client.service('questions')
          .find({
            query: {
              title: 'Who is your favorite football star?'
            }
          })
          .then(questions => {
            expect(questions).to.exist;
            expect(questions).to.be.an('array');
            expect(questions.length).to.equal(0);
          })
          .then(() => done());
      })
    })

    describe('POST /quizzes', () => {
      it('should create "New Test Quiz" ', done => {
        client.service('quizzes')
          .create({
            title: 'New Test Quiz'
          })
          .then(quiz => {
            expect(quiz).to.exist;
            expect(quiz.title).to.equal('New Test Quiz');
          })
          .then(() => done());
      });
    });

    describe('POST /questions', () => {
      it('should create 3 questions for "New Test Quiz"', done => {
        //Get the 'New Test Quiz ID first;
        client.service('quizzes')
          .find({
            query: {
              title: 'New Test Quiz'
            }
          })
          .then(quizzes => {
            return client.service('questions')
              .create([{
                title: 'How do you go to work?',
                type: 'multiple',
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
                type: 'checkbox',
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
      it('should fail to create an answer for "How do you go to work?" due to USER\'s permission', done => {
        client.service('questions')
          .find({
            query: {
              title: 'How do you go to work?'
            }
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
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to create answers');
          })
          .then(() => done());
      });
    });

    describe('PUT /users', () => {
      it('should update the user\'s last name', done => {
        client.service('users')
          .update(userId, {
            username: 'alice',
            password: '123',
            role: 'user',
            firstname: 'Alice',
            lastname: 'Williamson',
            gender: 'female'
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.lastname).to.equal('Williamson');
          })
          .then(() => done());
      })
    })

    describe('PUT /quizzes', () => {
      it('should update the status of quiz "Test Quiz 2" to \'PUBLISHED\'', done => {
        // Update does not support query param, so we have to find the id first;
        client.service('quizzes')
          .find({
            query: {
              title: 'Test Quiz 2'
            }
          })
          .then(quizzes => {
            return client.service('quizzes')
              .update(quizzes[0].id, {
                title: 'Test Quiz 2',
                author: userId,
                status: 'PUBLISHED'
              });
          })
          .then(quiz => {
            expect(quiz).to.exist;
            expect(quiz.status).to.equal('PUBLISHED');
          })
          .then(() => done());
      })
    })

    describe('PATCH /users', () => {
      it('should change the user\'s firstname', done => {
        client.service('users')
          .patch(userId, {
            firstname: 'Alison'
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.firstname).to.equal('Alison');
          })
          .then(() => done());
      })

      it('should fail to change the role', done => {
        client.service('users')
          .patch(userId, {
            role: 'ADMIN'
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

      it('should fail to change the username', done => {
        client.service('users')
          .patch(userId, {
            username: 'alice1'
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
      it('should change the status of quiz "Test Quiz 2" to \'FINISHED\'', done => {
        client.service('quizzes')
          .patch(null, {
            status: 'FINISHED'
          }, {
            query: {
              title: 'Test Quiz 2'
            }
          })
          .then(quizzes => {
            expect(quizzes).to.exist;
            expect(quizzes).to.be.an('array');
            expect(quizzes.length).to.equal(1);
            expect(quizzes[0].status).to.equal('FINISHED');
          })
          .then(() => done());
      })

      it('should change the staus of quiz 1 to \'FINISHED\'', done => {
        client.service('quizzes')
          .patch(1, {
            status: 'FINISHED'
          })
          .then(quiz => {
            expect(quiz).to.exist;
            expect(quiz.status).to.equal('FINISHED');
          })
          .then(() => done())
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
            expect(err.message).to.equal('No record found for id \'5\'');
          })
          .then(() => done());
      })

      it('should change the question "What is your name" to "What is your full name"', done => {
        client.service('questions')
          .patch(null, {
            title: 'What is your full name?'
          }, {
            query: {
              title: 'What is your name?'
            }
          })
          .then(questions => {
            expect(questions).to.exist;
            expect(questions).to.be.an('array');
            expect(questions.length).to.equal(1);
            expect(questions[0].title).to.equal('What is your full name?');
          })
          .then(() => done());
      })
    })

    describe('PATCH /answers', () => {
      it('should fail to change the answer due to user permission', done => {
        client.service('answers')
          .patch(1, {
            data: []
          })
          .then(answer => {
            expect(answer).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('You are not allowed to update answers');
          })
          .then(() => done());
      })
    })

    describe('DELETE /answers', () => {
      it('should fail to delete anwer 5 due to authorship', done => {
        client.service('answers')
          .remove(5)
          .then(answer => {
            expect(answer).to.not.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('No record found for id \'5\'');
          })
          .then(() => done());
      })

      it('should delete answer 1', done => {
        client.service('answers')
          .remove(1)
          .then(answer => {
            expect(answer).to.exist;
            expect(answer.id).to.equal(1);
          })
          .then(() => done());
      })
    })

    describe('DELETE /questions', () => {
      it('should delete the question "What are your hobbies?"', done => {
        client.service('questions')
          .remove(null, {
            query: {
              title: 'What are your hobbies?',
            }
          })
          .then(questions => {
            expect(questions).to.exist;
            expect(questions).to.be.an('array');
            expect(questions[0].title).to.equal('What are your hobbies?');
          })
          .then(() => done());
      })
    })

    describe('DELETE /quizzes', () => {
      it('should delete the quiz "Test Quiz 1" and corresponding questions', done => {
        client.service('quizzes')
          .remove(null, {
            query: {
              title: 'Test Quiz 1',
            }
          })
          .then(quizzes => {
            expect(quizzes).to.exist;
            expect(quizzes).to.be.an('array');
            expect(quizzes[0].title).to.equal('Test Quiz 1');
          })
          .then(() => client.logout())
          .then(() => done());
      });
    });
  });
});
