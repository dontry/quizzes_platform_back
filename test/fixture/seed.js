const modelNames = ['Answer', 'Question', 'Quiz', 'User'];
const logger = require('winston');


/* eslint-disable no-alert, no-console */
async function clearAll(func = 'UNKNOWN') {
  logger.info(`================CLEAR ALL INVOKED BY ${func}=======================`);
  const models = this.get('models');
  let transactions = [];
  modelNames.forEach(modelName => {
    const transaction = models[modelName].destroy({
      where: {},
      force: true
    });
    transactions.push(transaction);
  });
  await Promise.all(transactions.map(async(transaction) => {
    const res = await transaction;
    logger.info(`Transaction: ${res}`);
  }));
  //TODO: something wrong when deleting all entries in Client test;
  // await this.get('sequelize').sync();
  logger.info(`================CLEAR ALL OVER ${func}=======================`);
}
async function dropAll(func = 'UNKNOWN') {
  logger.info(`================DROP ALL INVOKED BY ${func}=======================`);
  const sequelize = this.get('sequelize');
  const res = await sequelize.drop({
    cascade: true
  });
  logger.info(`DROP TALBES: ${JSON.stringify(res)}`);
  logger.info('================DROP ALL OVER=======================');
}
async function seedUser() {
  return await this.service('users').create([{
    username: 'alex',
    password: '123',
    role: 'admin',
    firstname: 'Alexander',
    lastname: 'Granham',
    gender: 'male'
  }, {
    username: 'alice',
    password: '123',
    role: 'user',
    firstname: 'Alice',
    lastname: 'William',
    gender: 'female'
  },{
    username: 'allen',
    password: '123',
    role: 'user',
    firstname: 'Allen',
    lastname: 'Johnson',
    gender: 'other'
  }]);
}
async function seedQuiz() {
  const User = await this.service('users').find({
    query: {
      username: 'alice'
    }
  });
  return this.service('quizzes').create([{
    title: 'Test Quiz 1',
    author: User[0].id,
    status: 'PUBLISHED'
  }, {
    title: 'Test Quiz 2',
    author: User[0].id,
    status: 'UNPUBLISHED'
  }, {
    title: 'Test Quiz 3',
    author: User[0].id + 1,
    status: 'FINISHED'
  }], ).catch(e => logger.error(e));
}

async function seedQuestion() {
  const Quiz = await this.service('quizzes').find({
    query: {
      title: 'Test Quiz 1'
    }
  });
  // logger.info('Quiz instance: ' + JSON.stringify(Quiz));
  // logger.info('Quiz ID: ' + Quiz.id);
  return this.service('questions').create([{
    title: 'How are you?',
    type: 'multiple',
    options: JSON.stringify({
      data: ['Very good', 'Good', 'Average', 'Bad']
    }),
    quizId: Quiz[0].id
  }, {
    title: 'How old are you?',
    type: 'number',
    quizId: Quiz[0].id
  }, {
    title: 'What is your name?',
    type: 'text',
    quizId: Quiz[0].id
  }, {
    title: 'What animals do you like?',
    type: 'checkbox',
    options: JSON.stringify({
      data: ['Cat', 'Dog', 'Frog', 'Rat', 'Unicorn']
    }),
    quizId: Quiz[0].id
  }, {
    title: 'Who is your favorite football star?',
    type: 'text',
    quizId: Quiz[0].id + 2
  }]).catch(e => logger.info(e));
}

async function seedAnswer() {
  const Questions = await this.service('questions').find();
  // logger.info('Question instances: ' + JSON.stringify(Questions));
  return this.service('answers').create([{
    content: JSON.stringify({
      data: [1]
    }),
    questionId: Questions[0].id
  }, {
    content: JSON.stringify({
      data: 20
    }),
    questionId: Questions[1].id
  }, {
    content: JSON.stringify({
      data: 'Alice William'
    }),
    questionId: Questions[2].id
  }, {
    content: JSON.stringify({
      data: [1, 2, 3]
    }),
    questionId: Questions[3].id
  }, {
    content: JSON.stringify({
      data: 'Lionel Messi'
    }),
    questionId: Questions[4].id
  }]);
}

async function createAll(func = 'UNKNOWN') {
  logger.info(`================CREATE ALL INVOKED BY ${func}=======================`);
  // await clearAll.call(this, func);
  await seedUser.call(this);
  await seedQuiz.call(this);
  await seedQuestion.call(this);
  await seedAnswer.call(this);
  await this.get('sequelize').sync();
  logger.info('================CREATE ALL OVER=======================');
}

module.exports = function (app) {
  return {
    dropAll: dropAll.bind(app),
    clearAll: clearAll.bind(app),
    createAll: createAll.bind(app),
    seedUser: seedUser.bind(app),
    seedQuiz: seedQuiz.bind(app),
    seedQuestion: seedQuestion.bind(app),
    seedAnswer: seedAnswer.bind(app)
  };
};
