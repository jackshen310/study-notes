/**
 参考：https://juejin.cn/post/6845166891061739528
一、Promsie的三种状态
1. pending [待定] 初始状态, promise 对象初始化状态为 pending
2. fulfilled [实现] 操作成功,当调用resolve(成功)，会由pending => fulfilled
3. rejected [被否决] 操作失败,当调用reject(失败)，会由pending => rejected

二、Promise 对象方法 then 实现

三、异步实现，用resolveQueue、rejectQueue 存放回调数组

四、then 的链式调用（巨复杂）new Promise().then().then()
通过在 then 中 return 一个新的 Promise，从而实现 then 的链式调用！

五、onFulfilled 和 onRejected 的异步调用，用setTimeout解决异步问题

六、值穿透
1. onFulfilled 如果不是函数，就忽略 onFulfilled，直接返回 value!
2. onRejected 如果不是函数，就忽略 onRejected，直接扔出错误!

七、Promise 对象方法 catch，catch 是失败的回调，相当于执行 this.then(null,fn)

八、其它
1. Promise 对象方法 all （略）
2. Promise 对象方法 race （略）
3. Promise 对象方法 resolve
4. Promise 对象方法 reject
 */
class MyPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";
  constructor(executor) {
    this.status = MyPromise.PENDING; // 默认状态
    this.value; // resolve 成功时的值
    this.error; // reject 失败时的值

    this.resolveQueue = []; // 成功存放的数组
    this.rejectQueue = []; // 失败存放法数组

    let resolve = (res) => {
      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.FULFILLED;
        this.value = res;
      }
      // 一旦resolve执行，调用成功数组的函数
      this.resolveQueue.forEach((fn) => {
        fn();
      });
    };
    let reject = (err) => {
      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.REJECTED;
        this.error = err;
      }
      // 一旦reject执行，调用失败数组的函数
      this.rejectQueue.forEach((fn) => {
        fn();
      });
    };
    try {
      executor(resolve, reject);
    } catch (err) {
      // 抛出异常也是用reject处理
      reject(err);
    }
  }
  // 实现Promise.then(onFulfilled, onRejected)
  then(onFullfilled, onRejected) {
    /**处理值穿透问题
     * Promise 规范如果 onFulfilled 和 onRejected 不是函数，就忽略他们，所谓“忽略”并不是什么都不干，
     * 1. 对于onFulfilled来说“忽略”就是将value原封不动的返回，
     * 2. 对于onRejected来说就是返回reason，onRejected因为是错误分支，我们返回reason应该throw一个Error
     */
    onFullfilled =
      typeof onFullfilled === "function" ? onFullfilled : (res) => res;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            // 这里按照网友的做法，直接throw err是不行的，还是得返回一个Promise
            return MyPromise.reject(err);
          };
    // 返回一个新的Promise，实现链式调用
    let promise;
    promise = new MyPromise((resolve, reject) => {
      if (this.status == "fulfilled") {
        // 为什么要异步，这是Promise A+的规范，参考：https://github.com/chunpu/blog/issues/96
        setTimeout(() => {
          let x = onFullfilled(this.value);
          resolvePromise(promise, x, resolve, reject);
        }, 0);
      }
      if (this.status == "rejected") {
        setTimeout(() => {
          let x = onRejected(this.error);
          resolvePromise(promise, x, resolve, reject);
        }, 0);
      }
      // 实现异步
      // 当 resolve 在 setTimeout 内执行，then 时 status 还是 pending 等待状态。
      // 我们就需要在 then 调用的时候，将成功和失败存到各自的数组，一旦 reject 或者 resolve，就调用它们。
      if (this.status == "pending") {
        this.resolveQueue.push(() => {
          setTimeout(() => {
            let x = onFullfilled(this.value);
            resolvePromise(promise, x, resolve, reject);
          }, 0);
        });
        this.rejectQueue.push(() => {
          setTimeout(() => {
            let x = onRejected(this.error);
            resolvePromise(promise, x, resolve, reject);
          }, 0);
        });
      }
    });
    return promise;
  }
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
  static resolve(res) {
    return new MyPromise((resolve) => {
      resolve(res);
    });
  }
  static reject(err) {
    return new MyPromise((resolve, reject) => {
      reject(err);
    });
  }
}

/**
 我们暂且将第一个 then 返回的值成为 x，在这个函数中，我们需要去判断 x 是不是 Promise（这里是重点！）：
 1. 是：则取他的结果，作为新的 promise2 成功的结果
 2. 不是：直接作为新的 promise2 成功的结果
 */
function resolvePromise(promise, x, resolve, reject) {
  // 循环引用报错
  if (x === promise) {
    // reject 报错抛出
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  // 锁，防止多次调用
  let called;

  // x 不是 null 且 x 是对象或者函数
  if (x != null && (typeof x === "object" || typeof x === "function")) {
    try {
      // A+ 规定，声明then = x的then方法
      let then = x.then;
      // 如果then是函数，就默认是promise了
      if (typeof then === "function") {
        // 就让then执行 第一个参数是this 后面是成功的回调 和 失败的回调
        then.call(
          x,
          (res) => {
            // 成功和失败只能调用一个
            if (called) return;
            called = true;
            // 核心点2：resolve 的结果依旧是 promise 那就继续递归执行
            resolvePromise(promise, res, resolve, reject);
          },
          (err) => {
            // 成功和失败只能调用一个
            if (called) return;
            called = true;
            reject(err); // 失败了就失败了
          }
        );
      } else {
        resolve(x); // 直接成功即可
      }
    } catch (e) {
      if (called) return;
      called = true;
      // 取then出错了那就不要在继续执行了
      reject(e);
    }
  } else {
    resolve(x);
  }
}

// 以下为测试case
(async () => {
  let r1 = await new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve("hello");
    }, 1000);
  });
  console.log(r1);
  // then链式调用
  let r2 = await new MyPromise((resolve, reject) => {
    resolve("hello");
  }).then((res) => {
    return res + " world";
  });
  console.log(r2);
  // 异常处理
  let r3 = await new MyPromise((resolve, reject) => {
    reject("err");
  }).then(
    (res) => {
      return res + " world";
    },
    (err) => {
      return err.toString();
    }
  );
  console.log(r3);

  // 异常处理 - catch
  let r4 = await new MyPromise((resolve, reject) => {
    reject("err2");
  })
    .then((res) => {
      return res + " world";
    })
    .catch((err) => {
      return err.toString();
    });
  console.log(r4);
})();
