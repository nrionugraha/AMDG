/**
 * login.js
 * Mengatur koneksi wallet, registrasi user baru, dan login.
 */

// Ganti dengan alamat smart contract hasil deploy
const CONTRACT_ADDRESS = "0x892b48df1a85bB146f27FB7eA1A43367e849421B";

// ABI sederhana dari kontrak AMDG (hanya fungsi yang diperlukan untuk login/registrasi)
const CONTRACT_ABI = [
  // Fungsi registrasi user
  "function registerUser(string _username) external",
  // Fungsi untuk post tweet (digunakan di feed)
  "function postTweet(string _text, string _imageUrl) external",
  // Fungsi untuk komentar tweet
  "function commentTweet(uint _tweetId, string _commentText) external",
  // Fungsi untuk like tweet
  "function likeTweet(uint _tweetId) external",
  // Getter untuk mapping users
  "function users(address) view returns (string, bool)"
];

let provider;
let signer;
let contract;

// Menghubungkan wallet dengan MetaMask
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      console.log("Wallet connected");
      checkUserRegistration();
    } catch (error) {
      console.error("User denied wallet connection", error);
    }
  } else {
    alert("MetaMask is not installed. Please install it to use AMDG.");
  }
}

// Mengecek apakah user sudah terdaftar dengan memanggil mapping users
async function checkUserRegistration() {
  try {
    const userAddress = await signer.getAddress();
    const result = await contract.users(userAddress);
    const username = result[0];
    const exists = result[1];

    if (exists) {
      // User sudah terdaftar; tampilkan tombol login
      document.getElementById("loginSection").style.display = "block";
    } else {
      // User baru; tampilkan form registrasi
      document.getElementById("registrationSection").style.display = "block";
    }
  } catch (error) {
    console.error("Error checking user registration:", error);
  }
}

// Fungsi untuk registrasi user
async function registerUser() {
  const username = document.getElementById("username").value;
  if (username.trim() === "") {
    alert("Username cannot be empty");
    return;
  }
  try {
    const tx = await contract.registerUser(username);
    await tx.wait();
    alert("Registration successful! Please login.");
    // Sembunyikan form registrasi, tampilkan login
    document.getElementById("registrationSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
  } catch (error) {
    console.error("Registration error:", error);
  }
}

// Fungsi login sederhana: redirect ke halaman feed
function loginUser() {
  window.location.href = "main.html";
}

// Event listener untuk tombol
document.getElementById("connectWalletButton").addEventListener("click", connectWallet);
document.getElementById("registerButton").addEventListener("click", registerUser);
document.getElementById("loginButton").addEventListener("click", loginUser);
