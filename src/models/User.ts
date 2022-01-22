import { list } from "@keystone-6/core";
import { checkbox, password, text, timestamp } from "@keystone-6/core/fields";
import { Lists } from '.keystone/types';

const User: Lists.User = list({
    fields: {
        name: text({ validation: { isRequired: true } }),
        email: text({ validation: { isRequired: true }, isIndexed: 'unique', isFilterable: true }),
        password: password(),
        isAdmin: checkbox({ defaultValue: false }),
        createdAt: timestamp(),
    },
    hooks: {
        resolveInput: ({ resolvedData, operation }) => {
            if (operation === 'create') {
                resolvedData.createdAt = new Date();
            }
            return resolvedData;
        }
    }
});

export default User;