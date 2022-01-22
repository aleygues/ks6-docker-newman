
import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import { lists } from './src/schema';
import { Extensions } from './src/extensions';

let sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The SESSION_SECRET environment variable must be set in production'
    );
  } else {
    sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
  }
}

let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

// createAuth configures signin functionality based on the config below. Note this only implements
// authentication, i.e signing in as an item using identity and secret fields in a list. Session
// management and access control are controlled independently in the main keystone config.
const { withAuth } = createAuth({
  // This is the list that contains items people can sign in as
  listKey: 'User',
  // The identity field is typically a username or email address
  identityField: 'email',
  // The secret field must be a password type field
  secretField: 'password',
  
  // initFirstItem turns on the "First User" experience, which prompts you to create a new user
  // when there are no items in the list yet
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ['name', 'email', 'password'],
    skipKeystoneWelcome: true,
    itemData: {
      name: 'Admin',
      email: 'admin@aleygues.fr',
      password: 'supersecret',
      isAdmin: true
    }
  },
  
  sessionData: 'id isAdmin'
});

// Stateless sessions will store the listKey and itemId of the signed-in user in a cookie.
// This session object will be made available on the context object used in hooks, access-control,
// resolvers, etc.
const session = statelessSessions({
  // The session secret is used to encrypt cookie data (should be an environment variable)
  secret: 'supersecretword!thisisasuperlongsentence',
});

// We wrap our config using the withAuth function. This will inject all
// the extra config required to add support for authentication in our system.
export default withAuth(
  config({
    extendGraphqlSchema: Extensions,
    db: {
      prismaPreviewFeatures: ['interactiveTransactions'],
      provider: 'postgresql',
      url: process.env.DATABASE_URL || 'postgres://superuser:supersecret@db/dbname',
      onConnect: async context => {
        console.log('Connected');
        //CronService.launchCron(context);
      }
    },
    //extendGraphqlSchema: extendGraphqlSchema,
    graphql: {
      cors: {
        "origin": "https://studio.apollographql.com",
        "credentials": true
      },
    },
    server: {
      port: 3200,
      cors: true,
      extendExpressApp: (app, createContext) => {
        app.use('/images/:filename', (req, res, next) => {
          console.log(`/uploads/images/${req.params.filename}`);
          res.sendFile(`/uploads/images/${req.params.filename}`, {
            maxAge: 1000 * 3600 * 24 * 100
          });
        });
        app.get('/rest/campaigns', async (req, res) => {
          const context = await createContext(req, res);
          const now = new Date();
          const currentCampaigns = await context.query.Campaign.findMany({
            where: {
              startDatetime: { lte: now.toISOString() },
              endDatetime: { gte: now.toISOString() }
            },
            query: `
              id
            `
          });
          res.json({ currentCampaigns: currentCampaigns });
        });
      },
    },
    lists,
    // We add our session configuration to the system here.
    session,
    images: {
      upload: 'local',
      local: {
        storagePath: '/uploads/images',
        baseUrl: '/_images',
      },
    },
    files: {
      upload: 'local',
      local: {
        storagePath: '/uploads/files',
        baseUrl: '/files',
      },
    },
  })
);
