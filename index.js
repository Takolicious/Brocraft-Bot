const bedrock = require("bedrock-protocol");
const { deathMessages } = require("./death_messages.js");
require("dotenv").config();
const chatchannel = process.env.CHANNELID;
const guild = process.env.GUILDID;
const token = process.env.TOKEN;
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});
const fs = require("fs");
const webhooks = new Discord.WebhookClient(
  {
    url: process.env.WEBHOOK,
  },
  { allowedMentions: { parse: [] } }
);

const prefix = "bc!";

const commands = [];

client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

const CLIENT_ID = "870576516491268096";

client.once("ready", () => {
  console.log("Brocraft bot is now online!");

  const rest = new REST({ version: "9" }).setToken(token);

  (async () => {
    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    if (err) console.log(err);

    await interaction.reply({
      content: "An error occurred while executing that command.",
      ephemeral: true,
    });
  }
});

let bot = bedrock.createClient({
  host: process.env.IP,
  port: Number(String(process.env.PORT)),
  username: process.env.ACCOUNTUSERNAME,
  offline: false,
});
bot.on("disconnect", (packet) => {
  bot.reconnect;
});
bot.on("join", (packet) => {
  console.log("On Server");
  console.log(bot.profile);
});
bot.on("text", (packet) => {
  console.log(Object.getOwnPropertyNames(bot.profile));
  if (packet.type == "chat") {
    if (packet.source_name != bot.options.username) {
      if (packet.source_name != undefined) {
        webhooks.send({
          content: packet.message,
          username: packet.source_name,
        });
      } else {
        var tv = client.guilds.cache.get(guild);
        tv.channels.cache.get(chatchannel).send(`${packet.message}`);
      }
    }
  }
  if (packet.type == "translation") {
    var tv = client.guilds.cache.get(guild);
    console.log(packet);
    if (packet.message == "§e%multiplayer.player.joined") {
      tv.channels.cache
        .get(chatchannel)
        .send(`\`\`\`fix\n${packet.parameters[0]} has joined the game.\`\`\``);
    }
    if (packet.message == "§e%multiplayer.player.left") {
      tv.channels.cache
        .get(chatchannel)
        .send(`\`\`\`fix\n${packet.parameters[0]} has left the game.\`\`\``);
    }
    if (String(packet.message).includes("death.")) {
      let deathMessage = deathMessages[packet.message]
        .replace(`&1`, packet.parameters[0])
      if (packet.parameters[1] != undefined) {
        let entityName = packet.parameters[1]
        entityName = entityName.replace("%entity.", "").replace(".name", "").replace("_", " ").replace("v2", "")
        function titleCase(str) {
          var splitStr = str.toLowerCase().split(' ');
          for (var i = 0; i < splitStr.length; i++) {
              splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
          }
          return splitStr.join(' '); 
        }
        tv.channels.cache.get(chatchannel).send(deathMessage.replace('&2', titleCase(entityName)));
      }else {
        tv.channels.cache.get(chatchannel).send(deathMessage);
      }
    }
  }
});
client.on("message", (message) => {
  if (message.channel.id == chatchannel) {
    if (message.author.id == client.user.id || message.webhookId) return;
    console.log(message);
    bot.queue("command_request", {
      command: `/tellraw @a {"rawtext":[{"text":"§r[§9Discord§r] <${message.author.username}> ${message.content}"}]}`,
      origin: {
        size: 0,
        type: 0,
        uuid: "",
        request_id: "",
        player_entity_id: "",
      },
      interval: false,
    });
  }
});
module.exports = { bot };
client.login(token);
