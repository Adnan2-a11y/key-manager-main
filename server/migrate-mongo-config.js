// In this file you can configure migrate-mongo

// It's recommended to use environment variables for configuration
// for better security and flexibility.
require('dotenv').config();

const config = {
  mongodb: {
    // It's best practice to use environment variables for connection strings.
    // Avoid hardcoding credentials in your source code.
    url: process.env.MONGO_URL || "mongodb://127.0.0.1:27017",

    // Use an environment variable for the database name as well.
    databaseName: process.env.MONGO_DB_NAME || "key-hub",

    options: {}
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The mongodb collection where the lock will be created.
  lockCollectionName: "changelog_lock",

  // The value in seconds for the TTL index that will be used for the lock. Value of 0 will disable the feature.
  lockTtl: 0,

  // The file extension to create migrations and search for in migration dir 
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'commonjs',
};

module.exports = config;
