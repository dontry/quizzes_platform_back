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
    const questions = await app.service('questions').find({
      query: {
        quizId: {
          $in: quizzes.map(quiz => quiz.id)
        }
      }
    });

    hook.params.query = Object.assign(hook.params.query, {
      questionId: {
        $in: questions.map(question => question.id)
      }
    });

    return Promise.resolve(hook);
  };
}

module.exports = {
  before: {
    all: [defineScope()]
  }
}
