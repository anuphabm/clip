var connectionString = process.env.DATABASE_URL || 'postgres://username:password@loclahost:5432/dbname';
module.exports = connectionString;
