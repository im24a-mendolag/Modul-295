const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Library API',
    description: 'REST API for managing books and lends',
  },
  host: 'localhost:3000',
  tags: [
    { name: 'Books', description: 'Book management' },
    { name: 'Lends', description: 'Lend management' },
  ],
};

const outputFile = './swagger.json';
const routes = ['./library.js'];

swaggerAutogen(outputFile, routes, doc);
