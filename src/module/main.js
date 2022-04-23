
const {MyModule} = require('./MyModule');
console.log(MyModule);
const myModule = new MyModule();
console.log('main 开始');
const a = myModule.require('./a.js');
const b = myModule.require('./b.js');
console.log('在 main 中，a.done=%j，b.done=%j', a.done, b.done);

console.log(MyModule);