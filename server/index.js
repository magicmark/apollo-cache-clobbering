import { buildSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import express from 'express';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
    type Book {
      id: ID!
      title: String!
      author: Author!
    }

    type Author {
      name: String!
      dateOfBirth: String!
    }

    type Query {
      favoriteBook: Book!
    }
`);

const root = {
    favoriteBook() {
        return {
            id: 3,
            title: 'Fantastic Mr. Fox',
            author: {
                name: 'Roald Dahl',
                dateOfBirth: '13th September 1916',
            },
        };
    },
};

const app = express();

app.use('/', express.static('frontend/dist'));

app.all(
    '/graphql',
    createHandler({
        schema: schema,
        rootValue: root,
    }),
);

// Start the server at port
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
