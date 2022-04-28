
# 实现React的useState
参考：https://juejin.cn/post/7003489634994880520

核心思路：
1. 用数组保存所有state（React源码是用单向链表实现）
2. 用cursor记录当前state
3. 每次setState之后重置cursor并render

参考代码：
```js
let memoizedState = []; // hooks 的值存放在这个数组里
let cursor = 0; // 当前 memoizedState 的索引
function useState(initialValue) {
  memoizedState[cursor] = memoizedState[cursor] || initialValue;
  const currentCursor = cursor;
  function setState(newState) {
    memoizedState[currentCursor] = newState;
    cursor = 0;
    render(); // 调用render方法
  }
  return [memoizedState[cursor++], setState]; // 返回当前 state，并把 cursor 加 1
}
```

完整demo
```js
import React from "react";
import ReactDOM from "react-dom/client";


render();

function render() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
}

/* ------------useState 实现-------------- */
let memoizedState = []; // hooks 的值存放在这个数组里
let cursor = 0; // 当前 memoizedState 的索引
function useState(initialValue) {
  memoizedState[cursor] = memoizedState[cursor] || initialValue;
  const currentCursor = cursor;
  function setState(newState) {
    memoizedState[currentCursor] = newState;
    cursor = 0;
    render(); // 调用render方法
  }
  return [memoizedState[cursor++], setState]; // 返回当前 state，并把 cursor 加 1
}
/* ------------useState 实现-------------- */

// 测试代码
function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="App">
      <div>count: {count}</div>
      <div>
        <button
          onClick={() => {
            setCount(count + 1);
          }}
        >
          add
        </button>
      </div>
    </div>
  );
}

```

# 实现React的useEffect
参考：https://juejin.cn/post/6844903975838285838#heading-3

核心思路：
1. 用数组保存所有依赖和对应的销毁函数
2. 用effectCursor记录当前effect
3. 每次对比旧的依赖和新的依赖，有变化则先执行上一次的销毁函数然后再执行callback
4. 每次setState之后重置effectCursor并render

参考代码：
```js
var effectDeps = [];
var effectCursor= 0;

function useEffect(callback, deps) {
  if (!effectDeps[effectCursor]) {
    // 初次渲染：赋值 + 调用回调函数
    let destory = callback(); // 返回destory函数
    effectDeps[effectCursor] = [deps, destory];
    effectCursor++;
    return;
  }

  const currenEffectCursor = effectCursor;
  const [rawDeps, rawDestory] = effectDeps[currenEffectCursor];
  // 检测依赖项是否发生变化，发生变化需要重新render
  const isChanged = rawDeps.some(
    (dep, index) => dep !== deps[index]
  );
  if (isChanged) {
    if(rawDestory && typeof rawDestory === 'function') {
      rawDestory();
    }
    let destory = callback();
    effectDeps[effectCursor] = [deps, destory]; 
  }
  effectCursor++;
}
```
完整demo：
```js
import React from "react";
import ReactDOM from "react-dom/client";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

function render() {
  root.render(<App />);
}

/* ------------useState 实现-------------- */
var memoizedState = []; // hooks 的值存放在这个数组里
var cursor = 0; // 当前 memoizedState 的索引
function useState(initialValue) {
  memoizedState[cursor] = memoizedState[cursor] || initialValue;
  const currentCursor = cursor;
  function setState(newState) {
    memoizedState[currentCursor] = newState;
    cursor = 0;
    effectCursor= 0;
    render(); // 调用render方法
  }
  return [memoizedState[cursor++], setState]; // 返回当前 state，并把 cursor 加 1
}
/* ------------useState 实现-------------- */

/* ------------useEffect 实现-------------- */
var effectDeps = [];
var effectCursor= 0;

function useEffect(callback, deps) {
  if (!effectDeps[effectCursor]) {
    // 初次渲染：赋值 + 调用回调函数
    let destory = callback(); // 返回destory函数
    effectDeps[effectCursor] = [deps, destory];
    effectCursor++;
    return;
  }

  const currenEffectCursor = effectCursor;
  const [rawDeps, rawDestory] = effectDeps[currenEffectCursor];
  // 检测依赖项是否发生变化，发生变化需要重新render
  const isChanged = rawDeps.some(
    (dep, index) => dep !== deps[index]
  );
  if (isChanged) {
    if(rawDestory && typeof rawDestory === 'function') {
      rawDestory();
    }
    let destory = callback();
    effectDeps[effectCursor] = [deps, destory]; 
  }
  effectCursor++;
}
/* ------------useEffect 实现-------------- */

// 测试代码
function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let c = count;
    let timer  = setInterval(() => {
      console.log(c);
      c++;
    }, 1000);
    return () => {
      timer && clearInterval(timer);
    }
  }, [count]);
  return (
    <div className="App">
      <div>count: {count}</div>
      <div>
        <button
          onClick={() => {
            setCount(count + 1);
          }}
        >
          add
        </button>
      </div>
    </div>
  );
}

```