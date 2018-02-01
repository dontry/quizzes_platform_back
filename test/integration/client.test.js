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




describe('################# CLIENT TEST ###################', () => {
  before(done => {
    this.server = app.listen(3030, async() => {
      await app.get('sequelize').sync();
      await dbTest.createAll('CLIENT')
      done()
    });
  });

  after(done => {
    dbTest.dropAll('CLIENT')
      .then(async() => {
        await client.logout();
        await this.server.close();
      })
      .catch((err) => {
        console.log('ERROR:' + err);
        this.server.close();
      })
      .then(() => done());
  });

  describe('Login failure', () => {
    it('should fail to get a list of users without authentication', done => {
      client.service('users').find()
        .then(users => {
          expect(users).to.not.ok; //should not get there
        })
        .catch(err => {
          expect(err).to.exist;
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


  //=============ADMIN alex========================//
  describe('Login as ADMIN "alex": ', () => {
    let userId;
    const Credential = {
      strategy: 'local',
      username: 'alex',
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
              expect(user.username).to.equal('alex');
            })
        })
        .then(() => done())
    });

    describe('GET /users', () => {
      it('should get a list of all 3 users', done => {
        client.service('users').find()
          .then(users => {
            expect(users).to.exist;
            expect(users).to.be.an('array');
            expect(users.length).to.equal(3);
            expect(users[0].quizzes).to.be.an('array');
            expect(users[0].quizzes.length).to.be.above(0);
          })
          .then(() => done());
      });
    });

    describe('GET /quizzes', () => {
      it('should get all 3 quizzes by ADMIN "alex"', done => {
        client.service('quizzes').find()
          .then(quizzes => {
            expect(quizzes).to.exist;
            expect(quizzes).to.be.an('array');
            expect(quizzes.length).to.equal(3);
            expect(quizzes[0].questions).to.be.an('array');
            expect(quizzes[0].questions.length).to.be.above(0);
          })
          .then(() => done());
      });

      it('should fail to get non-exist quiz titled "A Quiz"', done => {
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

      it('should get the existing quiz "Test Quiz 3" which does not belong to "alex"', done => {
        client.service('quizzes')
          .find({
            query: {
              title: 'Test Quiz 3'
            }
          })
          .then(quizzes => {
            expect(quizzes).to.exist;
            expect(quizzes.length).to.equal(1);
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
      it('should get all questions', done => {
        client.service('questions').find()
          .then(questions => {
            expect(questions).to.exist;
            expect(questions).to.be.an('array');
            expect(questions[0].answers).to.be.an('array');
          })
          .then(() => done());
      });
    });

    describe('GET /answers', () => {
      it('should get all answers', done => {
        client.service('answers')
          .find()
          .then(answers => {
            expect(answers).to.exist;
            expect(answers).to.be.an('array');
          })
          .then(() => done());
      });
    });

    describe('POST /users', () => {
      it('should create a new USER "bob"', done => {
        client.service('users')
          .create({
            username: 'bob',
            password: '123',
            gender: 'male',
            firstname: 'Bobby',
            lastname: 'Brown'
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.username).to.equal('bob');
            expect(user.role).to.equal('USER');
          })
          .then(() => done());
      });
    });

    describe('POST /quizzes', () => {
      it('should create a new quiz "Test Quiz 4" for USER "alice"', done => {
        client.service('users')
          .find({
            query: {
              username: 'alice'
            }
          })
          .then(users => {
            return client.service('quizzes')
              .create({
                title: 'Test Quiz 4',
                author: users[0].id
              })
          })
          .then(quiz => {
            expect(quiz).to.exist;
            expect(quiz.title).to.equal('Test Quiz 4');
          })
          .then(() => done());
      });
    });

    describe('POST /questions', () => {
      it('should create 3 questions for "Test Quiz 4"', done => {
        //Get the 'New Test Quiz ID first;
        client.service('quizzes')
          .find({
            query: {
              title: 'Test Quiz 4'
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
      it('should create an answer for "How do you go to work?"[MULTIPLE]', done => {
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
          .then(answer => {
            expect(answer).to.exist;
            expect(JSON.parse(answer.content).data).to.be.a('number');
            expect(JSON.parse(answer.content).data).to.equal(0);
          })
          .then(() => done());
      });

      it('should create an answer for "What is your favourite movie?"[TEXT]', done => {
        client.service('questions')
          .find({
            query: {
              title: 'What is your favourite movie?'
            }
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

      it('should create an answer for "What are your hobbies?"[CHECKBOX]', done => {
        client.service('questions')
          .find({
            query: {
              title: 'What are your hobbies?'
            }
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
    })

    describe('DELETE /questions', () => {
      it('should delete the question "What are your hobbies?"', done => {
        client.service('questions')
          .remove(null, {
            query: {
              title: 'What are your hobbies?'
            }
          })
          .then(questions => {
            expect(questions).to.exist;
            expect(questions).to.be.an('array');
            expect(questions[0].title).to.equal('What are your hobbies?');
            expect(questions[0].answers).to.be.an('array');
            expect(questions[0].answers.length).to.be.above(0);
          })
          .then(() => done());
      });
    });

    describe('DELETE /quizzes', () => {
      it('should delete the quiz "Test Quiz 4" and corresponding questions', done => {
        client.service('quizzes')
          .remove(null, {
            query: {
              title: 'Test Quiz 4'
            }
          })
          .then(quizzes => {
            expect(quizzes).to.exist;
            expect(quizzes).to.be.an('array');
            expect(quizzes[0].title).to.equal('Test Quiz 4');
            expect(quizzes[0].questions).to.be.an('array');
            expect(quizzes[0].questions.length).to.be.above(0);
          })
          .then(() => done());
      });
    });

    describe('LOGOUT', () => {
      it('should logout', done => {
        client.logout()
          .then(() => {
            done();
          });
      });
    })
  })


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
          .then(res => {
            expect(res).to.not.be.ok;
          })
          .catch(err => {
            expect(err).to.exist;
            expect(err.message).to.equal('Request for question failed due to user permission.');
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
