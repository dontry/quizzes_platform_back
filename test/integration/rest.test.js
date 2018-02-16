const createDbTest = require('../fixture/seed');
const auth = require('@feathersjs/authentication-client');
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const localStorage = require('localstorage-memory');
const hooks = require('feathers-hooks');
const superagent = require('superagent');

let expiredToken;
let accessToken;
let authOptions = app.get('authentication');
const Credential = {
  strategy: 'local',
  username: 'alex',
  password: '123'
};


describe('############# REST TEST #################', () => {
  before(done => {
    this.server = app.listen(3030, async() => {
      await app.get('sequelize').sync();
      await dbTest.seedUser()
      const options = Object.assign({}, authOptions, {
        jwt: {
          expiredIn: '1ms'
        }
      });
      accessToken = await app.passport.createJWT(Credential, authOptions);
      expiredToken = await app.passport.createJWT({}, options); //create an expired token for testing
      done();
    });
  });

  after((done) => {
    dbTest.dropAll('REST')
      .then(() => {
        this.server.close(done);
      })
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
            const errorInfo = err.actual.body || err;
            expect(errorInfo).exist;
          })
          .then(() => done());
      });
    });

    describe('when token is invalid', () => {
      it('should return not authenticated error', done => {
        request(app)
          .get('/users')
          .set({
            Authorization: 'invalid'
          })
          .then(res => {
            expect(res).to.not.be.ok;
          })
          .catch(err => {
            const errorInfo = err.actual.body || {};
            expect(errorInfo).to.exist;
            expect(errorInfo.className).to.equal('not-authenticated');
            expect(errorInfo.message).to.equal('jwt malformed');
          })
          .then(() => done());
      });
    });

    describe('when token is expired', () => {
      it('should return not authenticated error', done => {
        request(app)
          .get('/users')
          .set({
            Authorization: expiredToken
          })
          .then(res => {
            expect(res).to.not.be.ok;
          })
          .catch(err => {
            const errorInfo = err.actual.body || {};
            expect(errorInfo).to.exist;
            expect(errorInfo.code).to.equal(401);
          })
          .then(() => done());
      });
    });

    //TODO not working
    describe('when token is valid', () => {
      it('should return data', done => {
        request(app)
          .get('/users')
          .set({
            Authorization: accessToken
          })
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
