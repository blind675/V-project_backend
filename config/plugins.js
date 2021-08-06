module.exports = ({ env }) => ({
  email: {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: env('SENDGRID_API_KEY'),
    },
    settings: {
      defaultFrom: 'bob@reactive-boards.com',
      defaultReplyTo: 'bob@reactive-boards.com',
      testAddress: 'bob@reactive-boards.com',
    },
  },
});
