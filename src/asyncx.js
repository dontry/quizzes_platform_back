const timeout = function (delay) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, delay);
  });
};

const timer = async () => {
  console.log('timer started');
  await Promise.resolve(timeout(3000));
  console.log('timer finished');
};

timer();
