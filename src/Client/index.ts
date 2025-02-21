import { Client, Collection } from 'discord.js';
import { config } from 'dotenv';
import path from 'path';
import { Interaction, Event } from '../Interfaces';
import consola from 'consola';
import { readdirSync } from 'fs';
config();

class Bot extends Client {
	public interact: Collection<string, Interaction> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public config = process.env;
	public console = consola;
	public constructor() {
		super({ ws: { properties: { $browser: "Discord Android", $os: "Android" } }, intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_WEBHOOKS', 'GUILD_MEMBERS'], partials: ['MESSAGE', 'CHANNEL', 'GUILD_MEMBER', 'USER'], allowedMentions: { parse: [] } });
		this.init();
	}

	public async init() {
		await this.login(this.config.TOKEN);

		const eventPath = path.join(__dirname, '..', 'Events');
		readdirSync(eventPath).forEach(async (file) => {
			const { event } = await import(`${eventPath}/${file}`);
			this.events.set(event.name, event);
			this.on(event.name, event.run.bind(null, this));
		});

		const arrayOfInteraction = [];
		const arrayOfInteractionPrivate = [];
		const interacPath = path.join(__dirname, '..', 'Interaction');

		readdirSync(interacPath).forEach((dir) => {
			const interactFolder = readdirSync(`${interacPath}/${dir}`).filter((file) => file.endsWith('.ts'));

			interactFolder.forEach((file) => {
				const { interaction } = require(`${interacPath}/${dir}/${file}`);
				if (interaction?.testOnly) {
					this.interact.set(interaction.name, interaction);
					return arrayOfInteractionPrivate.push(interaction);
				}
				this.interact.set(interaction.name, interaction);
				if (["MESSAGE", "USER"].includes(interaction.type)) delete interaction.description;
				arrayOfInteraction.push(interaction);
			});
		});

		this.once('ready', async () => {
			await this.guilds.cache.get(this.config.TESTSERVER).commands.set(arrayOfInteractionPrivate);
			await this.application.commands.set(arrayOfInteraction);
		});
	}
}

export default Bot;
