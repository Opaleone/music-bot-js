const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const config = require('../../../config.json')

module.exports = {
  data: new SlashCommandBuilder()
      .setName('skip')
      .setDescription('Skip a song'),
  async execute(interaction) {
    try {
      // for debugging
      if (config.debug.status) {
        if (!config.debug.channels.includes(interaction.channelId)) {
          return await interaction.reply({ content: "Currently testing bot. Try again later!", ephemeral: true });
        }
      }

      
    } catch (e) {
      const todayDate = new Date().toJSON();
      const msg = `${todayDate}: ${e} ::skip.js::\n`;

      // Log error to file
      fs.appendFile('errors.log', msg, (err) => {
        if (err) console.error(err)
      })
    }
  }
}