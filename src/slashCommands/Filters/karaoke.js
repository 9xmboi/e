const { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, Client } = require("discord.js");

module.exports = {
  name: 'karaoke',
  description: 'Sets karaoke Filter.',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction, prefix) => {
    await interaction.deferReply({
      ephemeral: false,
    });

    const player = client.manager.players.get(interaction.guild.id);
    if (!player.current) {
      let thing = new MessageEmbed().setColor('RED').setDescription('There is no music playing.');
      return interaction.editReply({ embeds: [thing] });
    }
    const emojiequalizer = interaction.client.emoji.filter;
    const embed = new MessageEmbed()
      .setColor(client.embedColor)
      .setDescription(`Chose The Buttons`);

    const but = new MessageButton().setCustomId('clear_but').setLabel('OFF').setStyle('DANGER');
    const but2 = new MessageButton().setCustomId('Karaoke_but').setLabel('ON').setStyle('PRIMARY');

    const but_ = new MessageButton()
      .setCustomId('clear_but_')
      .setLabel('OFF')
      .setStyle('DANGER')
      .setDisabled(true);
    const but_2 = new MessageButton()
      .setCustomId('Karaoke_but_')
      .setLabel('ON')
      .setStyle('PRIMARY')
      .setDisabled(true);

    const row1 = new MessageActionRow().addComponents(but, but_2);
    const row2 = new MessageActionRow().addComponents(but2, but_);
    const row3 = new MessageActionRow().addComponents(but2, but_);

    const m = await interaction.editReply({ embeds: [embed], components: [row3] });

    const embed1 = new MessageEmbed().setColor(client.embedColor);
    const collector = m.createMessageComponentCollector({
      filter: (f) =>
        f.user.id === interaction.member.user.id ? true : false && f.deferUpdate().catch(() => {}),
      time: 60000,
      idle: 60000 / 2,
    });
    collector.on('end', async () => {
      if (!m) return;
      await m.edit({
        embeds: [embed1.setDescription(`Time is Out type again ${prefix}karaoke`)],
        components: [
          new MessageActionRow().addComponents(but2.setDisabled(true), but.setDisabled(true)),
        ],
      });
    });
    collector.on('collect', async (b) => {
      if (!b.replied) await b.deferUpdate({ ephemeral: true });
      if (b.customId === 'clear_but') {
        await player.player.clearFilters();
        return await b.editReply({
          embeds: [embed1.setDescription(`${emojiequalizer}Karaoke Mode Is \`OFF\``)],
          components: [row2],
        });
      } else if (b.customId === 'Karaoke_but') {
        await player.player.setFilters({
          op: 'filters',
          guildId: interaction.guild.id,
          karaoke: {
            level: 1.0,
            monoLevel: 1.0,
            filterBand: 220.0,
            filterWidth: 100.0,
          },
        });
        return await b.editReply({
          embeds: [embed1.setDescription(`${emojiequalizer} Karaoke Mode Is \`ON\``)],
          components: [row1],
        });
      }
    });
  },
};
