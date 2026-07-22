// cPanel Node.js entry point
// In production, runs the compiled server from dist/
// Set NODE_ENV=production before starting
process.env.NODE_ENV = process.env.NODE_ENV || "production";
import("./dist/server/index.js");
