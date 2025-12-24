import 'dotenv/config'; // Load .env
import { bot } from '../bot/index';

console.log('Starting bot in development mode (Long Polling)...');

bot.start({
    onStart: (botInfo) => {
        console.log(`Bot @${botInfo.username} started!`);
    },
});
