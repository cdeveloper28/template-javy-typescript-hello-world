# BlessRec

A simple movie recommendation website using OMDb API.

## Setup

1. Get an OMDb API key from http://www.omdbapi.com/apikey.aspx

2. Create a `.env` file in the public folder:
   ```
   OMDB_API_KEY=your_api_key_here
   ```

3. Install dependencies:
   ```
   cd public
   npm install
   ```

4. Start the server:
   ```
   node server.js
   ```

5. Open `index.html` in your browser

## Features
- Movie search by genre
- Movie suggestions
- Real movie data from OMDb 