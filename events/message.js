const reqEvent = (event) => require(`../events/${event}`);

module.exports = client => {
  client.on('ready', () => reqEvent('ready')(client));
  // v14'te 'message' yerine 'messageCreate' kullanılır
  client.on('messageCreate', reqEvent('message')); 
};
