'use strict';

const {prop} = require('lodash/fp');

// retrieve a local service
const getService = name => {
  return prop(`content-manager.services.${name}`, strapi.plugins);
};

module.exports = {
  async publish(ctx) {
    const {userAbility} = ctx.state;
    const {id, model} = ctx.params;

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({userAbility, model});

    if (permissionChecker.cannot.publish()) {
      return ctx.forbidden();
    }

    const entity = await entityManager.findOneWithCreatorRoles(id, model);

    if (!entity) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.publish(entity)) {
      return ctx.forbidden();
    }

    const result = await entityManager.publish(entity, model);

    if (model === 'application::organisation.organisation') {
      await strapi.plugins['email'].services.email.send({
        to: result.owner.email,
        from: 'bob@reactive-boards.com',
        subject: 'v-Project Organisation Approved',
        text: `Hi ${result.owner.firstName} ${result.owner.lastName}` +
          `\n\n     We are happy to inform you that your organisation ${result.name} was approved by the v-Project curators. You can now start creating projects and tasks.`+
          '\n\n Kind regards,'+
          '\n     v-Project Team'
      });

      const notificationEntry = {
        message: `Hooray!! Your ${result.name} organisation was approved!!`,
        user: result.owner
      }

      await strapi.services.notification.create(notificationEntry);
    }

    ctx.body = permissionChecker.sanitizeOutput(result);
  },

  async delete(ctx) {
    const { userAbility } = ctx.state;
    const { id, model } = ctx.params;

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.delete()) {
      return ctx.forbidden();
    }

    const entity = await entityManager.findOneWithCreatorRoles(id, model);

    if (!entity) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.delete(entity)) {
      return ctx.forbidden();
    }

    const result = await entityManager.delete(entity, model);

    if (model === 'application::organisation.organisation') {
      await strapi.plugins['email'].services.email.send({
        to: result.owner.email,
        from: 'bob@reactive-boards.com',
        subject: 'v-Project Organisation Denied',
        text: `Hi ${result.owner.firstName} ${result.owner.lastName}` +
          `\n\n    Sadly, your organisation ${result.name} was rejected by our curators. Please contact us for more details.`+
          '\n\n Kind regards,'+
          '\n     v-Project Team'
      });

      const notificationEntry = {
        message: `Sadly, your ${result.name} organisation was rejected.`,
        user: result.owner
      }

      await strapi.services.notification.create(notificationEntry);
    }

    ctx.body = permissionChecker.sanitizeOutput(result);
  },
}
