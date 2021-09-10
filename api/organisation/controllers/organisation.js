'use strict';

const {parseMultipartData, sanitizeEntity} = require('strapi-utils');

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    const {id: userID} = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx);

    let entity;
    if (ctx.is('multipart')) {
      const {data, files} = parseMultipartData(ctx);

      // TODO: this is a hack
      data.published_at = null;
      data.owner = userID;
      entity = await strapi.services.organisation.create(data, {files});
    } else {

      const data = ctx.request.body;
      data.published_at = null;
      data.owner = userID;
      entity = await strapi.services.organisation.create(ctx.request.body);
    }

    await strapi.plugins['email'].services.email.send({
      to: 'catalin.bora@gmail.com',
      from: 'bob@reactive-boards.com',
      subject: 'v-Project Organisation Request',
      text: 'Some one created a new Organisation in v-Project. Please approve or deny it!',
    });

    // TODO: return a status not the object
    return sanitizeEntity(entity, {model: strapi.models.organisation});
  },

  async join(ctx) {
    const {id: userID} = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx);
    const user = await strapi.query('user', 'users-permissions').findOne({ id:userID }, ['role']);
    const {id} = ctx.params;

    const org = await strapi.services.organisation.findOne({id});

    // TODO: if auto join
    org.members.push(user);
    const updatedOrg = await strapi.services.organisation.update({id}, {
      members: org.members
    });

    // TODO: notify user
    // TODO: notify org manage/owner
    // TODO: send email to someone ?
    return sanitizeEntity(updatedOrg, {model: strapi.models.organisation});
  }
};
