const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const config = require('../../../config.json')
const { sleep } = require('../../../utils/index');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('Play a song')
      .addStringOption(option => {
        return option
          .setName('Song Name')
          .setDescription('A link or name to search');
      }),
  async execute(interaction) {
    try {
      if (config.debug.status) {
        if (!config.debug.channels.includes(interaction.channelId)) {
          return await interaction.reply({ content: "Currently testing bot. Try again later!", ephemeral: true });
        }
      }


    } catch(e) {
      const curTimeDate = new Date().toJSON();
      const msg = `${curTimeDate}: ${e.message} ::::\n`;

      fs.appendFile('errors.log', msg, (err) => {
        if (err) console.error(err)
      })
    }
  }
}