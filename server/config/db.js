// MongoDB connection is wired in Phase 2 (models).
module.exports = {
  connectDb: async () => {
    throw new Error('Database connection is not implemented yet (Phase 2)');
  },
};
