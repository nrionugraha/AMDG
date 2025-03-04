# AMDG - Blockchain-Based Social Media

AMDG is a decentralized social media platform built on blockchain technology, ensuring transparency, security, and user ownership of content. This project allows users to post tweets, like, comment, and manage their profiles while leveraging the power of smart contracts.

## Features
- **Decentralized Tweets**: Users can post tweets stored on the blockchain.
- **Like & Comment System**: Engage with other users' posts through likes and comments.
- **User Profiles**: Each user has a profile linked to their wallet address.
- **MetaMask Integration**: Connect wallet for seamless authentication.
- **Dark Mode UI**: Inspired by Apple's design for a clean and modern experience.

## Technologies Used
- **Solidity** (Smart Contract Development)
- **Hardhat** (Ethereum Development Environment)
- **Ether.js** (Blockchain Interaction)
- **HTML, CSS, JavaScript** (Frontend)
- **MetaMask** (Web3 Authentication)

## How to Set Up
### Prerequisites
1. Install **MetaMask** in your browser.
2. Install **Node.js** and **npm**.
3. Install **Hardhat** globally using:
   ```sh
   npm install -g hardhat
   ```

### Steps to Run the Project
#### 1. Clone the Repository
```sh
  git clone https://github.com/your-repo/AMDG
  cd AMDG
```

#### 2. Install Dependencies
```sh
  npm install
```

#### 3. Deploy Smart Contract
```sh
  npx hardhat compile
  npx hardhat run scripts/deploy.js --network sepolia
```

#### 4. Configure the Frontend
- Open `app.js`, `login.js`, and `myprofile.js`
- Update the contract address with your deployed contract's address.

#### 5. Run the Web App
Just open `index.html` in your browser or use a local server like:
```sh
  npx live-server
```

## Smart Contract Overview
The smart contract `AMDG.sol` provides the following key functionalities:
- `registerUser(string _username)`: Registers a new user.
- `postTweet(string _text, string _imageUrl)`: Allows users to create tweets.
- `likeTweet(uint _tweetId)`: Enables users to like tweets.
- `commentTweet(uint _tweetId, string _commentText)`: Allows users to comment.
- `deleteTweet(uint _tweetId)`: Enables users to delete their tweets.

## UI/UX
AMDG follows a **minimalist and modern UI** with smooth animations and dark mode support. The design is heavily inspired by Apple’s UI aesthetic.

## Future Improvements
- **NFT Profile Pictures**
- **Content Moderation using DAO**
- **Direct Messaging System**

## License
This project is licensed under the MIT License.

---
Made with ❤️ by the AMDG team.

