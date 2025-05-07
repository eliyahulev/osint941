# OSINT941 🔍

A powerful Node.js application for automated Telegram channel monitoring, message translation, and summarization using AI.

## 🌟 Features

- **Telegram Channel Monitoring**: Automatically monitors multiple Telegram channels for specific keywords
- **AI-Powered Processing**:
  - Translates messages using OpenAI's gpt-4o-mini
  - Intelligently summarizes content while preserving key information
- **Smart Deduplication**: Prevents processing duplicate messages
- **Robust Logging**: Comprehensive logging system using Winston
- **Error Handling**: Graceful error handling and recovery
- **Modern Stack**: Built with the latest Node.js features and ES modules

## 📋 Prerequisites

- Node.js (v14 or higher)
- Telegram API credentials (API ID and API Hash)
- OpenAI API key
- A Telegram account with access to the channels you want to monitor

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/osint941.git
   cd osint941
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory with the following variables:

   ```env
   TELEGRAM_API_ID=your_telegram_api_id
   TELEGRAM_API_HASH=your_telegram_api_hash
   TELEGRAM_SESSION=your_telegram_session
   OPENAI_API_KEY=your_openai_api_key
   OUTPUT_CHANNEL_ID=your_output_channel_id
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Channel Configuration

- Target channels are defined in `config/channels.js`
- Customize keywords in `config/keywords.js`
- Adjust message processing settings in `app.js`

### Environment Variables

| Variable            | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `TELEGRAM_API_ID`   | Your Telegram API ID                                      |
| `TELEGRAM_API_HASH` | Your Telegram API Hash                                    |
| `TELEGRAM_SESSION`  | Your Telegram session string                              |
| `OPENAI_API_KEY`    | Your OpenAI API key                                       |
| `OUTPUT_CHANNEL_ID` | ID of the channel where processed messages will be posted |

## 📝 Logging

The application uses Winston for logging with two main log files:

- `logs/combined.log`: Contains all logs
- `logs/error.log`: Contains only error logs

## 🛠️ Development

### Available Scripts

- `npm start`: Start the application with nodemon for development
- `npm run lint:fix`: Run ESLint with auto-fix

### Project Structure

```
osint941/
├── config/         # Configuration files
├── src/           # Source code
├── logs/          # Log files
├── app.js         # Main application file
├── package.json   # Project dependencies
└── .env          # Environment variables
```
