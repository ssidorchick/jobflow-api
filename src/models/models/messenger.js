import Hoek from 'hoek';
import Wreck from 'wreck';


const internals = {};

internals._defaults = {};

internals.Messenger = class {
  constructor(options) {
    this.config = options.config;
    this.User = options.User;
    this.Upwork = options.Upwork;
  }

  readMessage(data) {
    if (data.object === 'page') {
      // Iterate over each entry
      // There may be multiple if batched
      data.entry.forEach(pageEntry => {
        const pageID = pageEntry.id;
        const timeOfevent = pageEntry.time;

        pageEntry.messaging.forEach(ev => {
          if (ev.account_linking) {
            this._receivedLinkMessage(ev);
          } else if (ev.message) {
            this._receivedMessage(ev);
          } else if (ev.delivery) {
            // Message delivered.
          } else if (ev.read) {
            // Message read.
          } else if (ev.postback) {
            this._receivedPostback(ev);
          } else {
            throw Error(`Received unknown event: ${JSON.stringify(ev)}`);
          }
        });
      });
    } else {
      throw Error(`Only "page" subscriptions are supported. Subscription type: ${data.oject}`);
    }
  }

  sendTextMessage(recipientId, message) {
    console.log('sending text message', message, recipientId);
    const payload = {
      recipient: {id: recipientId},
      message: {text: message}
    };

    this._sendMessage(payload)
      .catch(err => console.log(err));
  }

  sendLinkMessage(recipientId) {
    const payload = {
      recipient: {id: recipientId},
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: 'Welcome to Upwork',
              image_url: 'http://www.example.com/images/m-bank.png',
              buttons: [{
                type: 'account_link',
                url: `${this.config.get('API_ENDPOINT')}/messenger/authorize`
              }]
            }]
          }
        }
      }
    };

    this._sendMessage(payload);
  }

  sendUnlinkMessage(recipientId) {
    const payload = {
      recipient: {id: recipientId},
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: 'Logout from Upwork',
              image_url: 'http://www.example.com/images/m-bank.png',
              buttons: [{
                type: 'account_unlink',
              }]
            }]
          }
        }
      }
    };

    this._sendMessage(payload);
  }

  sendJobsMessage(recipientId) {
    this.User.getByRecipientId(recipientId)
      .then(user => {
        const upwork = new this.Upwork(user.connections.upwork);

        return upwork.getJobs({q: 'javascript'}, 5);
      })
      .then(result => {
        const payload = {
          recipient: {id: recipientId},
          message: {text: JSON.stringify(result, null, 2)}
        };

        console.log('sending jobs message', recipientId);
        return this._sendMessage(payload)
      })
      .catch(err => console.log(err));
  }

  _sendMessage(payload) {
    const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${this.config.get('MESSENGER_ACCESS_TOKEN')}`;

    return new Promise((resolve, reject) => {
      Wreck.post(url, {json: 'force', payload}, (err, res, payload) => {
        if (!err && res.statusCode === 200) {
          const {recipient_id: recipientId, message_id: messageId} = payload;
          resolve({recipientId, messageId});
        } else {
          reject(err || payload.error);
        }
      });
    });
  }

  _receivedLinkMessage(ev) {
    const senderId = ev.sender.id;
    const auth_code = ev.account_linking.authorization_code;

    this.User.getByAuthCode(auth_code)
      .then(user => {
        if (!user) {
          throw Error(`User not found. auth_code: ${auth_code}`);
        }
        return user.update(null, null, {sender_id: senderId, auth_code: null});
      })
      .then(() => this.sendTextMessage(senderId, `Authentication successful`))
      .catch(err => {
        this.sendTextMessage(senderId, `Authentication failed`);
        console.log(err);
      });
  }

  _receivedMessage(ev) {
    const senderId = ev.sender.id;
    const recipientId = ev.recipient.id;
    const timeOfMessage = ev.timestamp;
    const message = ev.message;

    console.log(`Received message for user ${senderId} and page ${recipientId} at ${timeOfMessage} with message: ${JSON.stringify(message)}`);

    // You may get a text or attachment but not both.
    const messageText = message.text;
    const messageAttachments = message.attachments;

    if (messageText) {
      // If we receive a text message, check to see if it matches any special
      // keywords and send back the corresponding example. Otherwise, just echo
      // the text we received.
      switch (messageText) {
        case 'login':
          this.sendLinkMessage(senderId);
          break;
        case 'logout':
          this.sendUnlinkMessage(senderId);
          break;
        case 'generic':
          this.sendGenericMessage(senderId);
          break;
        case 'get jobs':
          this.sendJobsMessage(senderId);
          break;
        default:
          this.sendTextMessage(senderId, messageText);
      }
    } else if (messageAttachments) {
      this.sendTextMessage(senderId, 'Message with attachment received');
    } else {
      throw Error('Cannot handle recieved empty message');
    }
  }

  _receivedPostback(ev) {
    const senderId = ev.sender.id;
    const recipientId = ev.recipient.id;
    const timeOfPostback = ev.timestamp;
    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    const payload = ev.postback.payload;

    console.log(`Received postback for user ${senderId} and page ${recipientId} with payload ${payload} at ${timeOfMessage}`);

    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    this.sendTextMessage(senderId, 'Postback called');
  }
};

module.exports = internals.Messenger;
