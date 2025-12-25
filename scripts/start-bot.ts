import { bot, initBot } from '../bot/index';

async function main() {
    console.log("Starting Bot...");

    // Initialize background jobs and settings
    await initBot();

    // Start the bot
    await bot.start({
        onStart: (botInfo) => {
            console.log(`Bot @${botInfo.username} started!`);
        },
    });
}

main().catch((err) => {
    console.error("Fatal Bot Error:", err);
    process.exit(1);
});
