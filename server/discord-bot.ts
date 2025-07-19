import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ChatInputCommandInteraction } from 'discord.js';
import { storage } from './storage';

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('Missing required Discord bot environment variables');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Define slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your current balance')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check balance for (optional)')
        .setRequired(false)
    ),
  
  new SlashCommandBuilder()
    .setName('transaction')
    .setDescription('Get details about a specific transaction')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Transaction ID')
        .setRequired(true)
    ),
  
  new SlashCommandBuilder()
    .setName('history')
    .setDescription('View transaction history')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check history for (optional)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Number of transactions to show (default: 5)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20)
    ),
  
  new SlashCommandBuilder()
    .setName('merchants')
    .setDescription('List all available merchants'),
  
  new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Send money to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to send money to')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('amount')
        .setDescription('Amount to send')
        .setRequired(true)
        .setMinValue(0.01)
    ),

  new SlashCommandBuilder()
    .setName('order')
    .setDescription('Place an order with a merchant')
    .addStringOption(option =>
      option.setName('merchant')
        .setDescription('Merchant name')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('amount')
        .setDescription('Order amount')
        .setRequired(true)
        .setMinValue(0.01)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Order description')
        .setRequired(false)
    ),
];

// Register slash commands
async function registerCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(token);
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Generate unique transaction ID
function generateTransactionId(): string {
  return 'TX' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

// Format time ago
function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Command handlers
async function handleBalanceCommand(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  
  let user = await storage.getUserByDiscordId(targetUser.id);
  
  if (!user) {
    // Create user if doesn't exist
    user = await storage.createUser({
      discordId: targetUser.id,
      username: targetUser.username,
      balance: "100.00", // Starting balance
    });
  }

  await storage.createBotCommand({
    commandName: 'balance',
    userId: user.id,
    parameters: targetUser.id !== interaction.user.id ? `user:${targetUser.id}` : null,
    response: `Balance: $${user.balance}`,
  });

  await interaction.reply({
    content: `💰 **Balance for ${targetUser.username}**: $${user.balance}`,
    ephemeral: true,
  });
}

async function handleTransactionCommand(interaction: ChatInputCommandInteraction) {
  const transactionId = interaction.options.getString('id', true);
  
  const user = await ensureUser(interaction.user);
  const transaction = await storage.getTransactionByTransactionId(transactionId);
  
  await storage.createBotCommand({
    commandName: 'transaction',
    userId: user.id,
    parameters: `id:${transactionId}`,
    response: transaction ? `Found transaction ${transactionId}` : `Transaction ${transactionId} not found`,
  });

  if (!transaction) {
    await interaction.reply({
      content: `❌ Transaction \`${transactionId}\` not found.`,
      ephemeral: true,
    });
    return;
  }

  const transactionUser = await storage.getUser(transaction.userId);
  const merchant = await storage.getMerchant(transaction.merchantId);
  
  const statusEmoji = {
    pending: '⏳',
    completed: '✅',
    cancelled: '❌',
    failed: '⚠️',
  }[transaction.status] || '❓';

  await interaction.reply({
    content: `📋 **Transaction Details**\n` +
            `**ID**: \`${transaction.transactionId}\`\n` +
            `**User**: ${transactionUser?.username || 'Unknown'}\n` +
            `**Merchant**: ${merchant?.name || 'Unknown'}\n` +
            `**Amount**: $${transaction.amount}\n` +
            `**Status**: ${statusEmoji} ${transaction.status}\n` +
            `**Description**: ${transaction.description || 'N/A'}\n` +
            `**Created**: ${timeAgo(transaction.createdAt)}`,
    ephemeral: true,
  });
}

async function handleHistoryCommand(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const limit = interaction.options.getInteger('limit') || 5;
  
  const user = await ensureUser(targetUser);
  const transactions = await storage.getTransactionsByUserId(user.id, limit);

  await storage.createBotCommand({
    commandName: 'history',
    userId: user.id,
    parameters: `${targetUser.id !== interaction.user.id ? `user:${targetUser.id} ` : ''}limit:${limit}`,
    response: `Found ${transactions.length} transactions`,
  });

  if (transactions.length === 0) {
    await interaction.reply({
      content: `📝 No transaction history found for ${targetUser.username}.`,
      ephemeral: true,
    });
    return;
  }

  let response = `📝 **Transaction History for ${targetUser.username}**\n\n`;
  
  for (const transaction of transactions) {
    const merchant = await storage.getMerchant(transaction.merchantId);
    const statusEmoji = {
      pending: '⏳',
      completed: '✅',
      cancelled: '❌',
      failed: '⚠️',
    }[transaction.status] || '❓';

    response += `${statusEmoji} \`${transaction.transactionId}\` - ${merchant?.name || 'Unknown'} - $${transaction.amount} - ${timeAgo(transaction.createdAt)}\n`;
  }

  await interaction.reply({
    content: response,
    ephemeral: true,
  });
}

async function handleMerchantsCommand(interaction: ChatInputCommandInteraction) {
  const merchants = await storage.getAllMerchants();
  const activeMerchants = merchants.filter(m => m.isActive);

  const user = await ensureUser(interaction.user);
  await storage.createBotCommand({
    commandName: 'merchants',
    userId: user.id,
    parameters: null,
    response: `Listed ${activeMerchants.length} merchants`,
  });

  if (activeMerchants.length === 0) {
    await interaction.reply({
      content: '🏪 No merchants available at the moment.',
      ephemeral: true,
    });
    return;
  }

  let response = '🏪 **Available Merchants**\n\n';
  
  activeMerchants.forEach(merchant => {
    const categoryEmoji = {
      food: '🍔',
      items: '🎮',
      services: '🛠️',
    }[merchant.category] || '🏪';
    
    response += `${categoryEmoji} **${merchant.name}** (${merchant.category})\n`;
    if (merchant.description) {
      response += `   ${merchant.description}\n`;
    }
    response += '\n';
  });

  await interaction.reply({
    content: response,
    ephemeral: true,
  });
}

async function handlePayCommand(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('user', true);
  const amount = interaction.options.getNumber('amount', true);

  if (targetUser.id === interaction.user.id) {
    await interaction.reply({
      content: '❌ You cannot send money to yourself.',
      ephemeral: true,
    });
    return;
  }

  const fromUser = await ensureUser(interaction.user);
  const toUser = await ensureUser(targetUser);

  // Check if sender has sufficient balance
  if (parseFloat(fromUser.balance) < amount) {
    await interaction.reply({
      content: `❌ Insufficient balance. You have $${fromUser.balance} but tried to send $${amount.toFixed(2)}.`,
      ephemeral: true,
    });
    return;
  }

  // Check for duplicate transaction (fraud detection)
  const recentTransactions = await storage.getTransactionsByUserId(fromUser.id, 5);
  const duplicateCheck = recentTransactions.find(t => 
    parseFloat(t.amount) === amount && 
    Date.now() - t.createdAt.getTime() < 60000 // Within last minute
  );

  if (duplicateCheck) {
    await storage.createAlert({
      type: 'fraud',
      message: `Duplicate transaction attempted by user ${fromUser.username}`,
      severity: 'warning',
      isRead: false,
    });

    await interaction.reply({
      content: '❌ Duplicate transaction detected. Please wait before sending another payment.',
      ephemeral: true,
    });
    return;
  }

  // Create transaction
  const transactionId = generateTransactionId();
  const transaction = await storage.createTransaction({
    transactionId,
    userId: fromUser.id,
    merchantId: 1, // Use first merchant as placeholder for P2P
    amount: amount.toFixed(2),
    status: 'completed',
    description: `Payment to ${targetUser.username}`,
  });

  // Update balances
  await storage.updateUserBalance(fromUser.id, (parseFloat(fromUser.balance) - amount).toFixed(2));
  await storage.updateUserBalance(toUser.id, (parseFloat(toUser.balance) + amount).toFixed(2));

  await storage.createBotCommand({
    commandName: 'pay',
    userId: fromUser.id,
    parameters: `user:${targetUser.id} amount:${amount}`,
    response: `Sent $${amount.toFixed(2)} to ${targetUser.username}`,
  });

  await interaction.reply({
    content: `✅ Successfully sent $${amount.toFixed(2)} to ${targetUser.username}!\n` +
            `**Transaction ID**: \`${transactionId}\`\n` +
            `**Your new balance**: $${(parseFloat(fromUser.balance) - amount).toFixed(2)}`,
    ephemeral: true,
  });
}

async function handleOrderCommand(interaction: ChatInputCommandInteraction) {
  const merchantName = interaction.options.getString('merchant', true);
  const amount = interaction.options.getNumber('amount', true);
  const description = interaction.options.getString('description');

  const user = await ensureUser(interaction.user);
  const merchant = await storage.getMerchantByName(merchantName);

  if (!merchant) {
    await interaction.reply({
      content: `❌ Merchant "${merchantName}" not found. Use \`/merchants\` to see available merchants.`,
      ephemeral: true,
    });
    return;
  }

  if (!merchant.isActive) {
    await interaction.reply({
      content: `❌ Merchant "${merchantName}" is currently not accepting orders.`,
      ephemeral: true,
    });
    return;
  }

  // Check if user has sufficient balance
  if (parseFloat(user.balance) < amount) {
    await interaction.reply({
      content: `❌ Insufficient balance. You have $${user.balance} but the order costs $${amount.toFixed(2)}.`,
      ephemeral: true,
    });
    return;
  }

  // Create transaction
  const transactionId = generateTransactionId();
  const transaction = await storage.createTransaction({
    transactionId,
    userId: user.id,
    merchantId: merchant.id,
    amount: amount.toFixed(2),
    status: 'pending',
    description: description || `Order from ${merchant.name}`,
  });

  // Update user balance
  await storage.updateUserBalance(user.id, (parseFloat(user.balance) - amount).toFixed(2));

  await storage.createBotCommand({
    commandName: 'order',
    userId: user.id,
    parameters: `merchant:${merchantName} amount:${amount}${description ? ` description:${description}` : ''}`,
    response: `Created order ${transactionId} with ${merchantName}`,
  });

  // Simulate order completion after a delay
  setTimeout(async () => {
    await storage.updateTransactionStatus(transaction.id, 'completed');
  }, Math.random() * 30000 + 10000); // 10-40 seconds

  await interaction.reply({
    content: `🛒 **Order Placed Successfully!**\n` +
            `**Merchant**: ${merchant.name}\n` +
            `**Amount**: $${amount.toFixed(2)}\n` +
            `**Transaction ID**: \`${transactionId}\`\n` +
            `**Status**: ⏳ Pending\n` +
            `**Your new balance**: $${(parseFloat(user.balance) - amount).toFixed(2)}\n\n` +
            `Your order is being processed and will be completed shortly!`,
    ephemeral: true,
  });
}

async function ensureUser(discordUser: any) {
  let user = await storage.getUserByDiscordId(discordUser.id);
  
  if (!user) {
    user = await storage.createUser({
      discordId: discordUser.id,
      username: discordUser.username,
      balance: "100.00", // Starting balance
    });
  }
  
  return user;
}

// Event handlers
client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`Received command: ${interaction.commandName} from user: ${interaction.user.username}`);

  try {
    switch (interaction.commandName) {
      case 'balance':
        await handleBalanceCommand(interaction);
        break;
      case 'transaction':
        await handleTransactionCommand(interaction);
        break;
      case 'history':
        await handleHistoryCommand(interaction);
        break;
      case 'merchants':
        await handleMerchantsCommand(interaction);
        break;
      case 'pay':
        await handlePayCommand(interaction);
        break;
      case 'order':
        await handleOrderCommand(interaction);
        break;
      default:
        await interaction.reply({
          content: '❌ Unknown command.',
          ephemeral: true,
        });
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ An error occurred while processing your command.',
        ephemeral: true,
      });
    }
  }
});

export async function startBot() {
  await registerCommands();
  await client.login(token);
}

export { client as discordClient };
