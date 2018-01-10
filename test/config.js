process.env.NODE_ENV = 'test';
const supertest = require('supertest');
const chai = require('chai');
const app = require('../src/app');
const assert = require('assert');
const superagent = require('superagent');
const createDbTest = require('./fixture/seed');

global.dbTest = createDbTest(app);
global.app = app;
global.request = supertest;
global.superagent = superagent;
global.expect = chai.expect;
global.assert = assert;
