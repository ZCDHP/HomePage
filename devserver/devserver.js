const static = require('koa-static');
const Koa = require('koa');
const app = new Koa();
const dist = require('path').join(__dirname, "../dist");

app.use(static(dist));
app.listen(3000);
console.log('listening on port 3000');
