# Chatbot JS with Sequelize

This project is a simple chatbot application built using JavaScript, Express, and Sequelize for database management. It allows users to send and receive messages, with a backend powered by a RESTful API.

## Project Structure

```
chatbot-js-sequelize
├── src
│   ├── index.js              # Entry point of the application
│   ├── app.js                # Express application setup
│   ├── controllers           # Contains controllers for handling requests
│   │   └── chatController.js  # Chat-related request handlers
│   ├── routes                # Defines application routes
│   │   └── chatRoutes.js      # Routes for chat operations
│   ├── models                # Database models
│   │   ├── index.js          # Sequelize initialization
│   │   └── message.js        # Message model definition
│   ├── services              # Business logic layer
│   │   └── chatService.js    # Interacts with the database
│   ├── config                # Configuration files
│   │   └── database.js       # Database configuration
│   └── utils                 # Utility functions
│       └── logger.js         # Logger utility
├── netlify                   # Netlify functions for serverless deployment
│   └── functions
│       └── api-chat.js       # Serverless function for chat requests
├── migrations                 # Database migrations
│   └── YYYYMMDDHHMMSS-create-message.js
├── seeders                   # Seed data for the database
│   └── YYYYMMDDHHMMSS-demo-messages.js
├── .sequelizerc              # Sequelize CLI configuration
├── .env.example              # Example environment variables
├── netlify.toml             # Netlify deployment configuration
├── package.json              # NPM configuration and dependencies
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Sequelize CLI
- A PostgreSQL or MySQL database

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd chatbot-js-sequelize
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your database configuration in the `src/config/database.js` file.

4. Create a `.env` file based on the `.env.example` file and fill in your environment variables.

5. Run migrations to set up the database:
   ```
   npx sequelize-cli db:migrate
   ```

6. Seed the database with initial data:
   ```
   npx sequelize-cli db:seed:all
   ```

### Running the Application

To start the application, run:
```
npm start
```

The server will be running on `http://localhost:3000`.

### Deploying to Netlify

1. Create a new site on Netlify and link it to your Git repository.
2. In the Netlify dashboard, set the build command to:
   ```
   npm run build
   ```
3. Set the publish directory to:
   ```
   dist
   ```
4. Add environment variables in the Netlify settings that match those in your `.env` file.
5. Deploy the site.

### Usage

You can interact with the chatbot API using tools like Postman or cURL. The available endpoints are defined in `src/routes/chatRoutes.js`.

## License

This project is licensed under the MIT License.