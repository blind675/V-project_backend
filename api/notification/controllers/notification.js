'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  findMy: async (ctx) => {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: 'No authorization header was found' }] }]);
    }

    const data = await strapi.services.notification.find({user:user.id});

    if(!data){
      return ctx.notFound();
    }

    ctx.send(data);
  },
};
