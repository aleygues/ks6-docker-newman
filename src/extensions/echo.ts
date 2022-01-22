import { Resolvers } from ".";

const typeDefs = `
    type Query {
        echo(message: String!): String!
    }
`;

const resolvers: Resolvers = {
    Query: {
        echo: (root, { message }, context) => {
            return message;
        }
    }
}

export const echo = { typeDefs, resolvers };
