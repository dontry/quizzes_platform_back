const { rulesToQuery } = require('casl');

function ruleToQuery(rule) {
  if(JSON.stringify(rule.conditions).includes('$all:')) {
    throw new Error('Sequelize does not supprt "all" operation.');
  }

  return rule.inverted ? { $not: rule.conditions } : rule.conditions;
}

module.exports = function toSequelizeQuery(rules) {
  return rulesToQuery(rules, ruleToQuery);
}
