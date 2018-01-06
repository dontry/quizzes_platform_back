const modelNames = ['Answer', 'Question', 'Quiz', 'User'];
/* eslint-disable no-alert, no-console */
async function clearAll(func = 'UNKNOWN') {
  console.log(`================CLEAR ALL INVOKED BY ${func}=======================`);
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
    console.log(`Transaction: ${res}`);
  }));
  //TODO: something wrong when deleting all entries in Client test;
  // await this.get('sequelize').sync();
  console.log(`================CLEAR ALL OVER ${func}=======================`);
}
async function seedUser() {
  return await this.service('users').create([{
    username: 'alex',
    password: '123',
    firstname: 'Alexander',
    lastname: 'Granham',
    gender: 'male'
  }, {
    username: 'alice',
    password: '123',
    firstname: 'Alice',
    lastname: 'Williams',
    gender: 'female'
  }]);
}
async function seedQuiz() {
  const User = await this.service('users').find({
    query: {
      username: 'alex'
    }
  });
  return this.service('quizzes').create([{
    title: 'Test Quiz',
    author: User[0].id
  }, {
    title: 'Test Quiz 2',
    author: User[0].id
  }], ).catch(e => console.info(e));
}

async function seedQuestion() {
  const Quiz = await this.service('quizzes').find({
    query: {
      title: 'Test Quiz'
    }
  });
  // console.info('Quiz instance: ' + JSON.stringify(Quiz));
  // console.info('Quiz ID: ' + Quiz.id);
  return this.service('questions').create([{
    title: 'How are you?',
    type: 'single',
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
    type: 'multiple',
    options: JSON.stringify({
      data: ['Cat', 'Dog', 'Frog', 'Rat', 'Unicorn']
    }),
    quizId: Quiz[0].id
  }]).catch(e => console.log(e));
}

async function seedAnswer() {
  const Questions = await this.service('questions').find();
  // console.info('Question instances: ' + JSON.stringify(Questions));
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
      data: 'Alex McQueen'
    }),
    questionId: Questions[2].id
  }, {
    content: JSON.stringify({
      data: [1, 2, 3]
    }),
    questionId: Questions[3].id
  }]);
}

async function createAll(func = 'UNKNOWN') {
  console.log(`================CREATE ALL INVOKED BY ${func}=======================`);
  // await clearAll.call(this, func);
  await seedUser.call(this);
  await seedQuiz.call(this);
  await seedQuestion.call(this);
  await seedAnswer.call(this);
  await this.get('sequelize').sync();
  console.log('================CREATE ALL OVER=======================');
}


module.exports = function (app) {
  return {
    clearAll: clearAll.bind(app),
    createAll: createAll.bind(app),
    seedUser: seedUser.bind(app),
    seedQuiz: seedQuiz.bind(app),
    seedQuestion: seedQuestion.bind(app),
    seedAnswer: seedAnswer.bind(app)
  };
};
