const hydrate = require('feathers-sequelize/hooks/hydrate');

function defineScope() {
  return async function (hook) {
    if (hook.method === 'create' || !hook.params.user || hook.params.user.role !== 'USER') return Promise.resolve(hook);
    const app = hook.app;
    const user = hook.params.user;
    const quizzes = await app.service('quizzes').find({
      query: {
        author: user.id
      }
    });
    hook.params.query = Object.assign(hook.params.query, {
      quizId: {
        $in: quizzes.map(quiz => quiz.id)
      }
    });
    return Promise.resolve(hook);
  };
}

function checkAuthor() {
  return async function (hook) {
    if (hook.method === 'create' || !hook.params.user || hook.params.user.role !== 'USER') return Promise.resolve(hook);
    const app = hook.app;
    const user = hook.params.user;
    const questions = hook.result;
    const quizTasks = []
    questions.forEach(question => {
      const quiz = app.service('quizzes').get(question.quizId);
      quizTasks.push(quiz);
    })
    const quizzes = await Promise.all(quizTasks);

    for (let i = 0; i < quizzes.length; i++) {
      if (quizzes[0].author !== user.id) {
        return Promise.reject(new Error('Request for question failed due to authorship.'));
      }
    }
  }
}

function includeAnswer() {
  return function (hook) {
    const Answer = hook.app.get('models').Answer;
    const association = {
      include: [{
        model: Answer,
        as: 'answers'
      }]
    };
    switch (hook.type) {
      case 'before':
        hook.params.sequelize = Object.assign(association, {
          raw: false
        });
        return Promise.resolve(hook);
      case 'after':
        hydrate(association).call(this, hook);
        break;
    }
  };
}
module.exports = {
  before: {
    all: [defineScope(), includeAnswer()]
  },
  after: {
    all: [includeAnswer()]
  }
};
