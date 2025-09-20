const TelegramBot = require('node-telegram-bot-api');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const TelegramContact = require('../database/telegramContactsDB');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_API;

const bot = new TelegramBot(token, {polling: true});

bot.on('message', async (msg) => {
  const chat = msg.chat;
  // Save group or user
  try {
    await saveContact(chat);
  } catch (err) {
    console.error('Failed to save contact:', err.message);
  }
});

bot.onText(/\/start/, async (msg) => {
    await HomeMenuNew(msg);
});
bot.onText(/^\/1$/, async (msg) => {
    await HomeMenu(msg);
});
bot.onText(/^\/pay$/, async (msg) => {
    await PaymentMenu(msg);
});
bot.onText(/^\/to$/, async (msg) => {
    await WithdrawMenu(msg);
});
bot.onText(/^\/language$/, async (msg) => {
    await LanguageMenu(msg);
});
bot.onText(/^\/contact$/, async (msg) => {
    await ContactMenu(msg);
});


bot.on('callback_query', async (query) => {
  // console.log(`${query.from.id}: ${query.from.username} visiting ${query.data}`);
  console.log(query);
  const chatId = query.message.chat.id;
  const categoryId = query.data.split('_')[1];
  if (query.data && query.data.startsWith('categories')) {
  try {
    const response = await categoryController.getAllCategories();
  
      if (response?.categories && response?.categories.length > 0) {
        const cats = response.categories.map(category => [{
            text: category.name,
            callback_data: `category_${category.slug}`
          }]);
          cats.push([{
            text: "Return to Home",
            callback_data: `home`
          }]);
        const keyboard = {
          inline_keyboard: cats
        };
        await bot.sendMessage(chatId, 'Choose a category', { reply_markup: keyboard });
      } else {
        await bot.sendMessage(chatId, 'No categories available.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      await bot.sendMessage(chatId, 'Failed to fetch categories.');
    }
  }

  if (query.data && query.data.startsWith('category_')) {
    try {
      const response = await categoryController.getAllCategories({
        query: {
          "cat" : categoryId
        }
      });

      if (response?.categories && response?.categories.length > 0) {
        const cats = response?.categories.map(category => [{
          text: category.name,
          callback_data: `category_${category.slug}`
        }]);

        const keyboard = {
          inline_keyboard: cats
        };
        await bot.sendMessage(chatId, `Choose a category`, { reply_markup: keyboard });
      }else{
        if(response?.products && response?.products.length > 0){
          let message = '💰Your Balance:500 USDT\n' +
          `Category: ${response.title}\n`+
          `Warranty: 7 days\n\n`;

          response.products.map(product => {
            message += `/${product.productId} ${product.productName}\n`;
            message += `💰Price - ${product.sellPrice} USDT\n`;
          }
        );
        
          
          const keyboard = {
            inline_keyboard: [[{
              text: "Return to Home",
              callback_data: `home`
            }]]
          };
          await bot.sendMessage(chatId, message, { reply_markup: keyboard, parse_mode: 'Markdown' });
        } else{
          const keyboard = {
            inline_keyboard: [[
              {
                text: "Return to Home",
                callback_data: `home`
              }
            ]]
          };
          await bot.sendMessage(chatId, 'No products available.', { reply_markup: keyboard });
        }

      }
    } catch (error) {
      console.error('Error fetching products:', error);
      await bot.sendMessage(chatId, 'Failed to fetch products');
    }
    await bot.answerCallbackQuery(query.id); // Acknowledge the callback
  }

  if (query.data && query.data.startsWith('product_')) {
    const productId = query.data.split('_')[1];
    try {
      const singleProductData = await productController.product_details({
        query: {
          "id" : productId
        }
      });

      const buyKeyboard = {
        inline_keyboard: [
          [{
            text: "Buy Now",
            callback_data: `orderNow_${singleProductData.product._id}`
          }],
          [{
            text: "Return to Home",
            callback_data: `home`
          }]
        ]
      };

      const message = `${singleProductData.product.productName}\n` +
        `Price: $${singleProductData.product.sellPrice}\n`;


      await bot.sendMessage(chatId, message, { reply_markup: buyKeyboard, parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching single product:', error);
      await bot.sendMessage(chatId, 'Error fetching single product');
    }
    await bot.answerCallbackQuery(query.id); // Acknowledge the callback
  }
  if (query.data && query.data.startsWith('lang_')) {
    const lang = query.data.split('_')[1];
    try {
      if (lang){
        await TelegramContact.findOneAndUpdate({'chatId': chatId}, {'local': lang})
      }

      const buyKeyboard = {
        inline_keyboard: [
          [{
            text: "Return to Home",
            callback_data: `home`
          }]
        ]
      };

      const message = `Your language has been updated\n`;


      await bot.sendMessage(chatId, message, { reply_markup: buyKeyboard, parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching single product:', error);
      await bot.sendMessage(chatId, 'Error fetching single product');
    }
    await bot.answerCallbackQuery(query.id); // Acknowledge the callback
  }

  if (query.data && query.data.startsWith('home')) {
    await HomeMenuNew(query.message);
  }
});

async function HomeMenu(msg) {
  const chatId = msg.chat.id;
  const user = msg.from.first_name;
  const userId = msg.from.id; // Telegram User ID

  try {
  //   const balanceResponse = await fetch(`YOUR_SERVER_URL/api/user/balance/${userId}`);
    const balanceData = {};//await balanceResponse.json();
    const balance = balanceData.balance || '500'; // Default to 0.0 if not found

    const menu_items = [
        [{text: '🛒 Buy Key',callback_data: 'categories'}],
        [{text: '📦 My Orders',callback_data: 'orders'}],
        [{text: '💳 Refill Balance',callback_data: 'refill'}],
        [{text: '🛠️ Manage Group Notifications',callback_data: 'preferences'}],
        // [{text: '🔌 Download Plugin',callback_data: 'download'}],
        // [{text: 'ℹ️ Your Information',callback_data: 'info'}],
        // [{text: '❓ Help & Support',callback_data: 'support'}]
        [{text: "Return to Home", callback_data: `home`}],
    ]
    const keyboard = { inline_keyboard: menu_items }
    await bot.sendMessage(chatId, `💰Your Balance:${balance} USDT`, { reply_markup: keyboard });  
  
  } catch (error) {
    const reply_menu = `Hi ${user} Ahh, error!` +
    `\nContact Support - /support` +
    `\nError: ${error.message}`;
    
    await bot.sendMessage(chatId, reply_menu, { parse_mode: 'Markdown'});
  }
}

async function HomeMenuNew(msg){
  const chat = msg.chat;
  const chatId = msg.chat.id;
  try{
    let message = '';
    if(chat.type === 'group'){
      const person = msg.from;
      message = `👤Your chat ID: ${person.id}\n` +
            `Group ID: ${chatId}\n`;

    }
    if(chat.type === 'private'){
      message = `👤Your chat ID: ${chatId}\n`;

    }

    message += `💰Your Balance:0.35 USDT\n`;
    message += `/1 - View Menu\n`;
    message += `/to - Withdraw\n`;
    message += `/pay - Deposit\n`;
    message += `/language - Change Language\n`;
    message += `/contact - Contact Support\n`;


    const keyboard = { inline_keyboard:[] }
    await bot.sendMessage(chatId, message, { reply_markup: keyboard }); 
  }catch(error){
    console.log(error);
  }
}

async function PaymentMenu(msg){
  const chat = msg.chat;
  const chatId = msg.chat.id;
  try{
    let message = `Hi ${chatId}\n`
      +`💰Your Balance:0.35 USDT\n`
      +`Payment option comming soon\n`;

    const buyKeyboard = {
        inline_keyboard: [
          [{
            text: "Return to Home",
            callback_data: `home`
          }]
        ]
      };
    await bot.sendMessage(chatId, message, { reply_markup: buyKeyboard, parse_mode: 'Markdown' }); 
  }catch(error){
    console.log(error);
  }
}

async function WithdrawMenu(msg){
  const chat = msg.chat;
  const chatId = msg.chat.id;
  try{
    let message = `Hi ${chatId}\n`
      +`💰Your Balance:0.35 USDT\n`
      +`Withdraw option comming soon\n`;

    const buyKeyboard = {
        inline_keyboard: [
          [{
            text: "Return to Home",
            callback_data: `home`
          }]
        ]
      };

    await bot.sendMessage(chatId, message, { reply_markup: buyKeyboard, parse_mode: 'Markdown' }); 
  }catch(error){
    console.log(error);
  }
}
async function ContactMenu(msg){
  const chat = msg.chat;
  const chatId = msg.chat.id;
  try{
    let message = `Hi ${chatId}\n`
      +`💰Your Balance:0.35 USDT\n`
      +`Contact option comming soon\n`;

    const buyKeyboard = {
        inline_keyboard: [
          [{
            text: "Return to Home",
            callback_data: `home`
          }]
        ]
      };

    await bot.sendMessage(chatId, message, { reply_markup: buyKeyboard, parse_mode: 'Markdown' }); 
  }catch(error){
    console.log(error);
  }
}
async function LanguageMenu(msg){
  const chat = msg.chat;
  const chatId = msg.chat.id;
  try{
    const languageMenu = [
  [
    { text: '🇺🇸 English', callback_data: 'lang_en' },
    { text: '🇪🇸 Español', callback_data: 'lang_es' }
  ],
  [
    { text: '🇫🇷 Français', callback_data: 'lang_fr' },
    { text: '🇩🇪 Deutsch', callback_data: 'lang_de' }
  ],
  [
    { text: '🇧🇩 বাংলা', callback_data: 'lang_bn' },
    { text: '🇮🇳 हिंदी', callback_data: 'lang_hi' }
  ],
  [{
    text: "Return to Home",
    callback_data: `home`
  }]
];

const keyboard = { inline_keyboard: languageMenu };

await bot.sendMessage(chatId, '🌐 Please select your language:', { reply_markup: keyboard });
  }catch(error){
    console.log(error);
  }
}


async function saveContact(chat) {
  const chatId = chat.id.toString();
  const title = chat.title || chat.username || chat.first_name || 'Unknown';

  const exists = await TelegramContact.findOne({ chatId });
  if (!exists) {
    const contact = new TelegramContact({ chatId, title });
    await contact.save();
    console.log(`Saved new contact: ${chatId} (${title})`);
  }
}