#!/usr/bin/env node

/* Load .env to set process.env */
require("dotenv").load();

/* Load configuration */
var config = require("./config");

/* FIXME: Remove this line when the certificate is not self-signed anymore. */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var nsq = require('nsq.js');
var aqora = require('aqora-client')(config.aqora);

var reader = nsq.reader({
  nsqlookupd:  config.nsq.LOOKUPD_ADDRESSES,
  maxInFlight: config.nsq.MAX_IN_FLIGHT,
  maxAttempts: config.nsq.MAX_ATTEMPTS,
  topic:       config.nsq.TOPIC_NAME,
  channel:     config.nsq.CHANNEL_NAME
});

reader.on('error', function (err) {
  console.error(err.stack);
});

reader.on('discard', function (msg) {
  /* JSON.stringify(msg.json()) is done on purpose, to allow future formatting
   * of the message body. */
  console.error('[-] Discarding the message, max attempts reached (msg.body=%s).',
    JSON.stringify(msg.json())
  );

  return msg.finish();
});

/* Expected payload for the message body:
 *  {
 *    f: <feed_id>,
 *    s: <stream_name>,
 *    t: <new Date().toISOString()>,
 *    v: <value>
 *  }
 */
reader.on('message', function (msg) {
  var msg_json = msg.json();

  var feedID = msg_json.f;
  var datapoint = { t: msg_json.t, v: msg_json.v };

  /* Payload expected by the `PATCH /v1/feeds/:fid` method */
  var payload = {
    streams: [
      {
        name: msg_json.s,
        data: [ datapoint ]
      }
    ]
  }

  return aqora.feeds.sendData(feedID, payload, function (errResponse, succResponse) {
    if (errResponse) {
      console.error('[!] aqora error. status=%d, error_message=%s, payload=%s',
        errResponse.status,
        errResponse.message,
        JSON.stringify(payload)
      );

      if (errResponse.status === 400) {
        /* An HTTP status of 400 indicates the payload is, somehow, invas calid.
         * An invalid feed id may be the cause of the problem, but API version
         * mismatch may be occurring. Since it was logged, discard the message. */
        console.error('[-] Discarding the message, invalid payload (payload=%s).',
          JSON.stringify(payload)
        );
        return msg.finish();
      }

      /* Requeue the message to be sent later. */
      console.info('[!] Requeing the message to be sent later (payload=%s).',
        JSON.stringify(payload)
      );
      return msg.requeue(config.nsq.REQUEUE_DELAY);
    }

    /* Message was delivered successfully. */
    console.log('[+] A ' + config.nsq.TOPIC_NAME + ' message was stored on aqora.');
    return msg.finish();
  });
});
