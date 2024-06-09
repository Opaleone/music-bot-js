const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const config = require('../../../config.json')
const { sleep } = require('../../../utils/index');
const { QueryType } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('Play a song')
      .addSubcommand(subcommand => {
        return subcommand
          .setName('search')
          .setDescription('Searches for song')
          .addStringOption(option => {
            return option
              .setName('searchterms')
              .setDescription('search keywords')
              .setRequired(true);
          })
      })
      .addSubcommand(subcommand => {
        return subcommand
          .setName('playlist')
          .setDescription('Plays playlist from YouTube')
          .addStringOption(option => {
            return option
              .setName('url')
              .setDescription('playlist url')
              .setRequired(true);
          })
      })
      .addSubcommand(subcommand => {
        return subcommand
          .setName('song')
          .setDescription('Plays song from YouTube')
          .addStringOption(option => {
            return option
              .setName('url')
              .setDescription('url of song')
              .setRequired(true)
          });
      }),
  async execute({client, interaction}) {
    try {
      if (config.debug.status) {
        if (!config.debug.channels.includes(interaction.channelId)) {
          return await interaction.reply({ content: "Currently testing bot. Try again later!", ephemeral: true });
        }
      }

      if (!interaction.member.voice.channel) {
        return await interaction.reply({content: 'You must be in a voice channel to use this command.', ephemeral: true })
      }

      const queue = await client.player.createQueue(interaction.guild);

      if (!queue.connection) await queue.connect(interaction.member.voice.channel);

      let embed = new MessageEmbed();

      if (interaction.options.getSubcommand() === 'song') {
        let url = interaction.options.getString('url');

        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_VIDEO,
        });

        if (result.tracks.length === 0) {
          return await interaction.reply('No results found :(');
        }

        const song = result.tracks[0];
        await queue.addTrack(song);

        embed
          .setDescription(`Added [${song.title}](${song.url}) to the queue`)
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` })
      } else if (interaction.options.getSubcommand() === 'playlist') {
        let url = interaction.options.getString('url');

        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_PLAYLIST,
        });

        if (result.tracks.length === 0) {
          return await interaction.reply('No playlist found :(');
        }

        const playlist = result.tracks[0];
        await queue.addTracks(playlist);

        embed
          .setDescription(`Added [${playlist.title}](${playlist.url}) to the queue`)
          .setThumbnail(playlist.thumbnail)
          .setFooter({ text: `Duration: ${playlist.duration}` })
      } else if (interaction.options.getSubcommand() === 'search') {
        let url = interaction.options.getString('url');

        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        });

        if (result.tracks.length === 0) {
          return await interaction.reply('No results found :(');
        }

        const song = result.tracks[0];
        await queue.addTrack(song);

        embed
          .setDescription(`Added [${song.title}](${song.url}) to the queue`)
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` })
      }

      if (!queue.playing) await queue.play();

      await interaction.reply({
        embeds: [embed]
      })
    } catch(e) {
      const curTimeDate = new Date().toJSON();
      const msg = `${curTimeDate}: ${e.message} ::play.js::\n`;

      fs.appendFile('errors.log', msg, (err) => {
        if (err) console.error(err)
      })
    }
  }
}