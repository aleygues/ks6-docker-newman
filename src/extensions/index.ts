import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { echo } from './echo';
import { graphQLSchemaExtension } from '@keystone-6/core';
import { KeystoneContext } from "@keystone-6/core/types";

export interface Resolvers {
    Mutation?: { [key: string]: (root: any, params: any, context: KeystoneContext) => any },
    Query?: { [key: string]: (root: any, params: any, context: KeystoneContext) => any }
}

export const Extensions = graphQLSchemaExtension({
    typeDefs: mergeTypeDefs([
        echo.typeDefs
    ]) as any,
    resolvers: mergeResolvers([
        echo.resolvers as any
    ]) as any,
});

