const { Events } = require('discord.js');
const fs = require("fs");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found`);
        return;
      }
      
      await command.execute(interaction);
    } catch (e) {
      const curTimeDate = new Date().toJSON();
      const msg = `${curTimeDate}: ${e.message} ::interactionCreate.js::\n`;

      fs.appendFile('errors.log', msg, (err) => {
        if (err) console.error(err)
      })
    }
  }
}