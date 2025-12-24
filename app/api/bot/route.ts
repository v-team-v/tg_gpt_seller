import { bot } from '@/bot/index';
import { webhookCallback } from 'grammy';

export const POST = webhookCallback(bot, 'std/http');
