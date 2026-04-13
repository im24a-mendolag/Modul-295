
const numbers = process.argv.slice(2).map(Number);
const result = numbers.reduce((total, n) => total + n, 0);
console.log(result);
