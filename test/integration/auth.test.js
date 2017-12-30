const createDbTest = require('./seed');
const auth = require('@feathersjs/authentication-client');
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const localStorage = require('localstorage-memory');
const hooks = require('feathers-hooks');
const superagent = require('superagent');
const Promise =require('bluebird');

const client = feathers();
client.configure(hooks())
  .configure(rest('http://localhost:3030').superagent(superagent))
  .configure(auth({
    storage: localStorage
  }));
let dbTest;
let expiredToken;
let accessToken;
let authOptions = app.get('authentication');;
const Credential = {
  strategy: 'local',
  username: 'alex',
  password: '123'
};


describe('Authentication: ', () => {
  before(done => {
    this.server = app.listen(3030);
    dbTest = createDbTest(app);
    dbTest.createAll().then(() => {
        const options = Object.assign({}, authOptions, {
          jwt: {
            expiredIn: '1ms'
          }
        });
        expiredToken = app.passport.createJWT({}, options); //create expired token for testing
      })
      .then(() => done());
  });

  after((done)=> {
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

  describe('Login', () => {
    describe('login using invalid credentials', () => {
      it('should fail to login when using empty credentials', done => {
        client.authenticate({})
          .then(res => {
            expect(res).to.not.be.ok; //should not get there
          })
          .catch(err => {
            expect(err).exist;
            expect(err.code).to.equal(401);
            expect(err.name).to.equal('NotAuthenticated');
            expect(err.message).to.equal('Could not find stored JWT and no authentication strategy was given');
          })
          .then(() => done());
      });
    });

    describe('login using valid credentials', () => {
      it('should login with username "alex"', done => {
        client.authenticate(Credential)
          .then(res => {
            expect(res).to.exist;
            accessToken = client.get('accessToken');
            return client.passport.verifyJWT(client.get('accessToken'));
          })
          .then(payload => {
            expect(payload).to.exist;
            expect(payload.iss).to.be.equal(authOptions.jwt.issuer);
            return client.service('users').find(payload.id);
          })
          .then(user => {
            expect(user).to.exist;
            expect(user).to.be.an('array');
            expect(user[0].username).to.equal('alex');
          })
          .then(() => done());
      });
    });
  });

  describe('when using a valid token', () => {
    it('should use client.passport.getJWT() to get the accessToken', done => {
      client.authenticate(Credential)
        .then(res => {
          client.passport.getJWT().then(accessToken => {
            expect(accessToken).to.equal(res.accessToken);
          });
        });
      done();
    });

    it('should decode an accessToken with client.passport.verifyToken()', () => {
      return client.authenticate(Credential)
        .then(res => {
          return client.passport.verifyJWT(res.accessToken)
            .then(payload => {
              expect(payload.iss).to.equal(authOptions.jwt.issuer);
              expect(payload.sub).to.equal(authOptions.jwt.subject);
            });
        });
    });

    // Not working
    it.skip('should emit `Authenticated` event', done => {
      client.once('authenticated', res => {
        try {
          expect(res.accessToken).to.not.exist;
          expect(accessToken).to.deep.equal(res.accessToken)
          done();
        } catch (err) {
          done(err);
        };
      });
    });

    it('should access to protected service with valid credentials', () => {
      return client.authenticate(Credential).then(res => {
        expect(res.accessToken).to.exist;
        return client.service('users').find({
          query: {
            username: 'alex'
          }
        }).then(users => {
          expect(users).to.exist;
          expect(users[0].username).to.equal('alex');
        });
      });
    });

    it('should fail the authentication with no options and no stored accessToken', done => {
      client.authenticate().catch(err => {
        expect(err.message).to.equal('Could not find stored JWT nad no authentication type was given.');
        expect(err.code).to.equal(401);
      }).then(() => done());
    });

    it('should use localStorage compatible stores', () => {
      const oldStorage = client.get('storage');
      client.set('storage', localStorage);

      return client.authenticate(Credential).then(res => {
        expect(res.accessToken).to.equal(localStorage.getItem('feathers-jwt'));
        client.set('storage', oldStorage);
      });
    });

    it('accessToken is stored and re-authentication with stored accessToken should work', done => {
      client.authenticate(Credential).then(res => {
        expect(res.accessToken).to.exist;
        return client.authenticate().then(res => {
          expect(client.get('accessToken')).to.equal(res.accessToken);
        });
      }).then(() => done());
    });

    it('logout should work, does not grant access to protected service and accessToken is removed from localStorage', done => {
      client.authenticate(Credential).then(res => {
          expect(res.accessToken).to.exist;
          return client.logout();
        })
        .then(() => {
          expect(client.get('accessToken')).to.equal(null);
          return Promise.resolve(client.get('storage').getItem('feathers-jwt'));
        })
        .then(accessToken => {
          expect(accessToken).to.not.exist;
          return client.service('users').get(0)
            .catch(err => {
              expect(err.code).to.equal(401);
            });
        })
        .then(() => done());
    });

    //TODO: what is client.once()??
    it.skip('`logout` event', done => {
      client.once('logout', () => done());

      client.authenticate(Credential).then(res => {
        expect(res.accessToken).to.exist;
        return client.logout();
      });
    });
  });
});
