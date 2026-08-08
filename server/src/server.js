const dns = require('dns');// Set DNS servers to Google's and Cloudflare's public DNS servers for reliable domain name resolution
// FORCE Node.js to use IPv4 globally to bypass Render's IPv6 block
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);// Import the DNS module and set DNS servers to Google's and Cloudflare's public DNS servers for reliable domain name resolution
//above code is used to set the DNS servers for the application to Google's public DNS server 

require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT;

// Initialize Database Connection before Booting up the Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
