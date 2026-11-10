require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Green Grocery Server running on port ${PORT} [Env: ${process.env.NODE_ENV || 'development'}]`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down server gracefully...');
      server.close(() => {
        console.log('Process terminated.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
