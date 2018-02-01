const hydrate = require('feathers-sequelize/hooks/hydrate');

function checkAuthor() {
  return async function (hook) {
    if(hook.method === 'create' || !hook.params.user || hook.params.user.role !== 'USER')  return Promise.resolve(hook);
    const app = hook.app;
    const user = hook.params.user;
    const quizId =  hook.result[0].quizId;
    const quiz = await app.service('quizzes').get(quizId);

    if( user.id !== quiz.author ) {
      return Promise.reject(new Error('Request for question failed due to user permission.'));
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
    all: [includeAnswer()]
  },
  after: {
    all: [checkAuthor(), includeAnswer()]
  }
};
