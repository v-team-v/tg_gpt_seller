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
    if (err instanceof Object && 'error_code' in err && err.error_code === 409) {
        console.error("Conflict: Another bot instance is running. Please stop it first.");
    } else {
        console.error("Fatal Bot Error:", err);
    }
    process.exit(1);
});
