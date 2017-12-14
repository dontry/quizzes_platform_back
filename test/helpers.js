const supertest = require('supertest');
const chai = require('chai');
const app = require('../src/app');
const assert = require('assert');

global.app = app;
global.request = supertest(app);
global.expect = chai.expect;
global.assert = assert;
