# osint941

## Overview

`osint941` is a Node.js application that monitors specific Telegram channels for messages containing certain keywords, translates and shortens these messages using OpenAI's GPT-4 model, and then posts the processed messages to a specified Telegram channel.

## Features

- Monitors multiple Telegram channels for specific keywords.
- Translates and shortens messages using OpenAI's GPT-4 model.
- Logs processed messages and errors using Winston.
- Deduplicates messages to avoid processing the same message multiple times.

## Prerequisites

- Node.js (v14 or higher)
- Telegram API credentials (API ID and API Hash)
- OpenAI API key

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/osint941.git
   cd osint941
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a [.env](http://_vscodecontentref_/1) file in the root directory and add your environment variables:
   ```env
   TELEGRAM_API_ID=your_telegram_api_id
   TELEGRAM_API_HASH=your_telegram_api_hash
   TELEGRAM_SESSION=your_telegram_session
   OPENAI_API_KEY=your_openai_api_key
   OUTPUT_CHANNEL_ID=your_output_channel_id
   ```

## Usage

1. Start the application:

   ```sh
   npm start
   ```

2. Follow the prompts to enter your Telegram phone number, password, and the code you receive.

## Configuration

- The list of target channels is defined in [channels.js](http://_vscodecontentref_/2).
- The list of keywords is defined in [keywords.js](http://_vscodecontentref_/3).
- The maximum message length and other configurations are defined in the [config](http://_vscodecontentref_/4) object in [app.js](http://_vscodecontentref_/5).

## Logging

- Processed messages and errors are logged to [combined.log](http://_vscodecontentref_/6) and [error.log](http://_vscodecontentref_/7) respectively.

## License

This project is licensed under the MIT License. See the LICENSE file for details.# osint941
