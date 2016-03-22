export default function apiMiddleware() {
  return (next) => (action) => {
    const { promise, types, ...rest } = action; // eslint-disable-line no-use-before-define
    if (!promise) {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({
      ...rest,
      type: REQUEST,
    });

    return promise().then(
      (result) => next({
        ...rest,
        result,
        type: SUCCESS,
      }),
      (error) => {
        // Reduce nested error properties
        const finalError = (error.error) ? error.error : error;
        return next({
          ...rest,
          error: finalError,
          type: FAILURE,
        });
      }
    );
  };
}
