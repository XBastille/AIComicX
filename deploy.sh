#!/bin/bash
# Lightning.ai Deployment Script

echo "Building React App..."
cd Frontend
npm install
npm run build

echo "React build complete!"

echo "Setting up Backend..."
cd ../Backend
npm install

echo "Starting Application..."


node index.js
