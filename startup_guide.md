# Ismism Machine Startup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/Ismism-Machine.git
cd Ismism-Machine
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
- Copy `.env.example` to `.env`
- Update the MongoDB connection string and other configurations

4. Initialize the database
```bash
npm run setup-db
# or
yarn setup-db
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Development Mode
The development server will start at `http://localhost:3000`

## Production Deployment
1. Build the project
```bash
npm run build
# or
yarn build
```

2. Start the production server
```bash
npm start
# or
yarn start
``` 