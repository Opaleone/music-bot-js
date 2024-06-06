const { Events, ActivityType } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    try {  
      const guilds = client.guilds.cache.map(guild => guild);

      client.user.setActivity('for Siege requests...', { type: ActivityType.Watching });

      console.log(`Ready! Logged in as ${client.user.tag}`);
      for (const guild of guilds) {
        console.log(`Joined ${guild.name}: ${guild.id}`);
      }
    } catch (e) {
      const curTimeDate = new Date().toJSON();
      const msg = `ready.js:: ${curTimeDate}: ${e.message}\n`;

      fs.appendFile('errors.log', msg, (err) => {
        if (err) console.error(err)
      })
    }
  }
}