const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const config = require('../../../config.json')
const { sleep } = require('../../../utils/index');
const { QueryType } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('Play a song')
      // .addStringOption(option => {
      //   return option
      //     .setName('Song Name')
      //     .setDescription('A link or name to search');
      // }),
      .addSubcommand(subcommand => {
        subcommand
          .setName('search')
          .setDescription('Searches for song')
          .addStringOption(option => {
            option
              .setName('searchterms')
              .setDescription('search keywords')
              .setRequired(true);
          })
      })
      .addSubcommand(subcommand => {
        subcommand
          .setName('playlist')
          .setDescription('Plays playlist from YouTube')
          .addStringOption(option => {
            option
              .setName('url')
              .setDescription('playlist url')
              .setRequired(true);
          })
      })
      .addSubcommand(subcommand => {
        subcommand
          .setName('song')
          .setDescription('Plays song from YouTube')
          .setRequired(true);
      }),
  async execute(interaction) {
    try {
      if (config.debug.status) {
        if (!config.debug.channels.includes(interaction.channelId)) {
          return await interaction.reply({ content: "Currently testing bot. Try again later!", ephemeral: true });
        }
      }

      if (!interaction.member.voice.channel) {
        return await interaction.reply('You must be in a voice channel to use this command.')
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
      const msg = `${curTimeDate}: ${e.message} ::::\n`;

      fs.appendFile('errors.log', msg, (err) => {
        if (err) console.error(err)
      })
    }
  }
}