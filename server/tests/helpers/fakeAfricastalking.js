'use strict';

/**
 * Fake Africa's Talking SMS client. Mimics the shape of the real SDK's
 * `SMS.send()` response: `{ SMSMessageData: { Recipients: [...] } }`.
 */

function createFakeSms({ fail = false } = {}) {
  const sent = [];
  return {
    sent,
    fail,
    async send(params) {
      sent.push(params);
      if (fail) {
        const err = new Error('AT API error');
        err.response = { data: { message: 'Authentication to the service denied.' } };
        throw err;
      }
      return {
        SMSMessageData: {
          Message: 'Sent to 1 recipients',
          Recipients: [
            {
              status: 'Success',
              number: params.to,
              cost: 'RWF 1',
              messageId: 'ATXid_abc123',
            },
          ],
        },
      };
    },
  };
}

module.exports = { createFakeSms };
