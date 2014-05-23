var config = {};

config.aqora = {
  HOST:       process.env.AQORA_HOST,
  PORT:       process.env.AQORA_PORT,
  PROTOCOL:   process.env.AQORA_PROTOCOL,

  API_KEY:    process.env.AQORA_API_KEY,
  API_SECRET: process.env.AQORA_API_SECRET
}

config.nsq = {
  LOOKUPD_ADDRESSES: process.env.NSQ_LOOKUPD_ADDRESSES ? process.env.NSQ_LOOKUPD_ADDRESSES.split(',') : undefined,
  MAX_IN_FLIGHT:     process.env.NSQ_MAX_IN_FLIGHT,
  MAX_ATTEMPTS:      process.env.NSQ_MAX_ATTEMPTS,
  REQUEUE_DELAY:     process.env.NSQ_REQUEUE_DELAY,
  TOPIC_NAME:        process.env.NSQ_TOPIC_NAME,
  CHANNEL_NAME:      process.env.NSQ_CHANNEL_NAME
};

var subconfigs =
[
  config.aqora,
  config.nsq
];

subconfigs.forEach(function (subconfig)
{
  Object.keys(subconfig).forEach(function (param)
  {
    if (subconfig[param] === undefined)
    {
      console.error('Error: one or more configurations are undefined.');
      console.dir(config);
      process.exit(-1);
    }
  });
});

module.exports = config;
