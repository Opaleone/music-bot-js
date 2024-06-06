const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('../../config.json');
const fs = require('fs');
    
const rest = new REST().setToken(config.token);
rest.get(Routes.applicationCommands(config.clientId))
    .then(data => {
        try {
          const promises = [];
          console.log(`Deleting ${data.length} application (/) commands`)
          for (const command of data) {
              const deleteUrl = `${Routes.applicationCommands(config.clientId)}/${command.id}`;
              promises.push(rest.delete(deleteUrl));
          }

          console.log(`Successfully deleted ${data.length} application commands.`);
          return Promise.all(promises);
        } catch (e) {
          const curTimeDate = new Date().toJSON();
          let msg = `${curTimeDate}: ${e} ::delete-commands.js::\n`;
      
          fs.appendFile('errors.log', msg, (err) => {
            if (err) console.error(err)
          })
        }
    });