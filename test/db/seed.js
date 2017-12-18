const timeout = require('../../src/utils/timeout');
const modelNames = ['question', 'answer', 'quiz'];
/* eslint-disable no-alert, no-console */
function clearAll() {
  const models = this.get('models');
  let transactions = [];
  modelNames.forEach(modelName => {
    const transaction = models[modelName].destroy({
      where: {},
      force: true
    });
    transactions.push(transaction);
  });
  return transactions;
}

function seedQuiz() {
  return this.service('quizzes').create([{
    title: 'Test Quiz',
    author: 'Dong Cai'
  }, {
    title: 'Test Quiz 2',
    author: 'Dong Cai'
  }], ).catch(e => console.info(e));
}

async function seedQuestion() {
  const Quiz = await this.service('quizzes').find({
    query: {
      title: 'Test Quiz'
    }
  });
  console.info('Quiz instance: ' + JSON.stringify(Quiz));
  console.info('Quiz ID: ' + Quiz.id);
  return this.service('questions').create([{
    title: 'How are you?',
    type: 'single',
    options: JSON.stringify({
      data: ['Very good', 'Good', 'Average', 'Bad']
    }),
    quizId: Quiz.data[0].id
  }, {
    title: 'How old are you?',
    type: 'number',
    quizId: Quiz.data[0].id
  }, {
    title: 'What is your name?',
    type: 'text',
    quizId: Quiz.data[0].id
  }, {
    title: 'What animals do you like?',
    type: 'multiple',
    options: JSON.stringify({
      data: ['Cat', 'Dog', 'Frog', 'Rat', 'Unicorn']
    }),
    quizId: Quiz.data[0].id
  }]).catch(e => console.log(e));
}

async function seedAnswer() {
  const Questions = await this.service('questions').find();
  console.info('Question instances: ' + JSON.stringify(Questions));
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

async function createAll() {
  const sequelize = this.get('sequelize');
  const transactions = clearAll.call(this);
  await Promise.all(transactions);
  await seedQuiz.call(this);
 
  await seedQuestion.call(this);
  await seedAnswer.call(this);
  sequelize.sync();
}


module.exports = function (app) {
  return {
    clearAll: clearAll.bind(app),
    createAll: createAll.bind(app),
    seedQuiz: seedQuiz.bind(app),
    seedQuestion: seedQuestion.bind(app),
    seedAnswer: seedAnswer.bind(app)
  };
};
