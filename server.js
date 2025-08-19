// server.js
const app = require("./src/app");
const { connectToCache } = require('./src/utils/cache');

const PORT = process.env.PORT || 3001;
    
// Initialize cache
connectToCache();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});