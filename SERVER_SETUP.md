# Notion API Backend Server

A minimal Sinatra server that fetches Notion page content and returns it as JSON.

## Setup

1. **Install dependencies:**
   ```bash
   bundle install
   ```

2. **Create a .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your Notion API token to .env:**
   Edit `.env` and replace `your_notion_api_token_here` with your actual token.

   Get your token from: https://www.notion.so/my-integrations

4. **Run the server:**
   ```bash
   ruby server.rb
   ```

The server will start on `http://localhost:4000`

## API Endpoints

- `GET /api/projects` - Fetches the Notion page content and returns as JSON
- `GET /health` - Health check endpoint

## Integration with Frontend

Update your Projects component to fetch from the backend:

```javascript
const response = await fetch('http://localhost:4000/api/projects')
const data = await response.json()
```

## Notes

- The server runs on port 4000
- CORS is enabled for localhost development
- The Notion page ID is set in the server.rb file
