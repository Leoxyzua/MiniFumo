import { Interaction } from 'discord.js';
import { Event } from '../Interfaces';

export const event: Event = {
	name: 'interactionCreate',
	run: async (bot, interact: Interaction) => {

		if (interact.isCommand()) {
			const cmd = bot.interact.get(interact.commandName);
			if (!cmd) return interact.reply({ content: `An error has occured`, ephemeral: false });
			const args = [];
			for (let option of interact.options.data) {
				if (option.type === 'SUB_COMMAND_GROUP') {
					if (option.name) args.push(option.name);
					for (const op of option.options) {
						if (op.name) args.push(op.name);
						if (op.value) args.push(op.value);
						op.options.forEach((x) => {
							if (x.value) args.push(x.value);
						});
					}
				} else if (option.type === 'SUB_COMMAND') {
					if (option.name) args.push(option.name);

					option.options?.forEach((x) => {
						if (x.value) args.push(x.value);
					});
				} else if (option.value) args.push(option.value);
			}
			interact.member = interact.guild.members.cache.get(interact.user.id);

			try {
				await cmd.run(bot, interact, args);
			} catch (err) {
				const error = err as Error;

				console.log(error.stack);
				await interact.reply(`An error has occurred: \`${error.message}\``);
			}
		}
		if (interact.isContextMenu()) {
			const cmd = bot.interact.get(interact.commandName);
			if (!cmd) return interact.reply({ content: 'An error occured', ephemeral: true });
			const args = [];
			interact.member = interact.guild.members.cache.get(interact.user.id);

			try {
				await cmd.run(bot, interact, args);
			} catch (err) {
				const error = err as Error;

				console.log(error.stack);
				await interact.reply(`An error has occurred: \`${error.message}\``);
			}
		}
	},
};
