const _ = require('lodash');

export default () => (next) => (action) => {
  function makeAction(suffix, data) {
    let newAction = _.extend({}, action, { type: action.type + suffix }, data); // eslint-disable-line
    delete newAction.promise;
    return newAction;
  }

  if (typeof action.promise !== 'undefined' && typeof action.promise.then === 'function') {
    // Pass along a new action with the promise stripped out, a suffix added to the action type
    // and optionally some additional data
    next(makeAction(''));
    action.promise.then(
      (data) => next(makeAction('_SUCCESS', {
        response: data.data,
        headers: data.headers,
        statusCode: data.statusCode,
        originalAction: _.omit(action, 'promise'),
      })),
      (response) => {
        return next(makeAction('_FAILURE', {
          error: response,
          originalAction: _.omit(action, 'promise'),
        }));
      }
    )
    .done();
  } else {
    return next(action);
  }
};
