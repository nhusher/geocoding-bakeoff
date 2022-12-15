const SLOP = 0.1;

function sleep (seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function throttle(maxIps) {
  return async function * rateLimit (up) {
    // let start = Math.floor(Date.now() / 1000);
    // let items = 0;

    for await (const item of up) {
      // const now = Math.floor(Date.now() / 1000);
      await sleep(1 / maxIps + SLOP);
      yield item;
      // items += 1;
    }
  };
}
