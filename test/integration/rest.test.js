const createDbTest = require('./seed');
const auth = require('@feathersjs/authentication-client');
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const localStorage = require('localstorage-memory');
const hooks = require('feathers-hooks');
const superagent = require('superagent');

let dbTest;
let expiredToken;
let accessToken;
let authOptions = app.get('authentication');
const Credential = {
  strategy: 'local',
  username: 'alex',
  password: '123'
};


describe('Rest: ', () => {
  before(done => {
    this.server = app.listen(3030);
    dbTest = createDbTest(app);
    dbTest.seedUser()
      .then(() => {
        return app.passport.createJWT({userId: 0}, authOptions); //create an access token
      })
      .then(token => {
        accessToken = token;
        const options = Object.assign({}, authOptions, {
          jwt: {
            expiredIn: '1ms'
          }
        });
        return app.passport.createJWT({}, options); //create an expired token for testing
      })
      .then(token => {
        expiredToken = token;
      })
      .catch((err) => {
        console.log(err);
      })
      .then(() => done());
  });

  after((done) => {
    const transactions = dbTest.clearAll();
    const _this = this;
    transactions.push(new Promise(() => {
      _this.server.close(done);
    }))
    transactions.forEach(async(transaction) => {
      await transaction;
    });
  });

  describe('Login: ', () => {
    it('returns a valid access token', done => {
      request(app)
        .post('/authentication')
        .send(Credential)
        .then(res => {
          expect(res.body.accessToken).to.exist;
          return app.passport.verifyJWT(res.body.accessToken, authOptions);
        })
        .then(payload => {
          expect(payload).to.exist;
          expect(payload.iss).to.equal(authOptions.jwt.issuer);
          done();
        })
    });
  });

  describe('when calling a protected service method', () => {
    describe('when header is invalid', () => {
      it('returns not authenticated error', done => {
        request(app)
          .get('/users')
          .set('X-Authorization', accessToken)
          .then(res => {
            expect(res).to.not.be.ok;
          })
          .catch(err => {
            const errorInfo = err.actual.body || {};
            expect(errorInfo).exist;
            expect(errorInfo.code).to.equal(401);
            expect(errorInfo.name).to.equal('NotAuthenticated');
            expect(errorInfo.message).to.equal('No auth token');
          })
          .then(() => done());
      });
    });

    describe('when token is invalid', () => {
      it('should return not authenticated error', done => {
        request(app)
          .get('/users')
          .query({
            Authorization: 'invalid'
          })
          .then(res => {
            expect(res).to.not.be.ok;
          })
          .catch(err => {
            const errorInfo = err.actual.body || {};
            expect(errorInfo).to.exist;
            expect(errorInfo.code).to.equal(401);
            expect(errorInfo.name).to.equal('NotAuthenticated');
            expect(errorInfo.message).to.equal('No auth token');
          })
          .then(() => done());
      });
    });

          describe('when token is expired', () => {
        it('should return not authenticated error', done => {
          request(app)
            .get('/users')
            .query({
              Authorization: expiredToken
            })
            .then(res => {
              expect(res).to.not.be.ok;
            })
            .catch(err => {
              expect(err.actual.body).to.exist;
              expect(err.actual.body.code).to.equal(401);
              expect(err.actual.body.name).to.equal('NotAuthenticated');
              expect(err.actual.body.message).to.equal('No auth token');
            })
            .then(() => done());
        });
      });

      //TODO not working
      describe('when token is valid', () => {
        it('should return data', done => {
          request(app)
            .get('/users')
            .query({Authorization: accessToken})
            .then(res => {
              expect(res.body.length).to.be.above(0);
              epxect(res.body[0].username).to.equal('alex');
            })
            .catch(err => {
              expect(err).to.exist;
            })
            .then(() => done());
        })
      });
  });
});
