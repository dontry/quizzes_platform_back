const modelNames = ['question', 'answer', 'quiz'];

function clearAll(app) {
  const models = app.get('models');
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

function seedQuiz(app) {
  return app.service('quizzes').create([{
    title: 'Test Quiz',
    author: 'Dong Cai'
  }, {
    title: 'Test Quiz2',
    author: 'Dong Cai'
  }], ).catch(e => console.log(e));
}

async function seedQuestion(app) {
  const Quiz = await app.service('quizzes').find({
    query: {
      title: 'Test Quiz'
    }
  });
  return app.service('questions').create([{
    title: 'How are you?',
    type: 'single',
    options: {
      data: ['Very good', 'Good', 'Average', 'Bad']
    },
    quizId: Quiz.id
  }, {
    title: 'How old are you?',
    type: 'number',
    quizId: Quiz.id
  }, {
    title: 'What is your name?',
    type: 'text',
    quizId: Quiz.id
  }, {
    title: 'What animals do you like?',
    type: 'multiple',
    options: {
      data: ['Cat', 'Dog', 'Frog', 'Rat', 'Unicorn']
    },
    quizId: Quiz.id
  }]).catch(e => console.log(e));
}

async function seedAnswer(app) {
  const Questions = await app.service('questions').find();
  return app.service('answers').create([{
    content: {
      data: [1]
    },
    questionId: Questions[0].id
  }, {
    content: {
      data: 20
    },
    questionId: Questions[1].id
  }, {
    content: {
      data: 'Alex McQueen'
    },
    questionId: Questions[2].id
  }, {
    content: {
      data: [1, 2, 3]
    },
    questionId: Questions[3].id
  }])
}


module.exports = {
  clearAll,
  seedQuiz,
  seedQuestion,
  seedAnswer
};
