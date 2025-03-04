/**
 * myprofile.js
 * Mengatur tampilan profil: mengambil data user, tweet yang diposting, serta komentar yang dibuat oleh user.
 */

const CONTRACT_ADDRESS = "0x789FB401acBA27e8fAeC793CC392536Da43BdB52";

// ABI untuk mendapatkan data user, tweet, dan komentar
const CONTRACT_ABI = [
  "function users(address) view returns (string, bool)",
  "function tweetCount() view returns (uint)",
  "function tweets(uint) view returns (uint id, address author, string text, string imageUrl, uint timestamp, uint likeCount, bool deleted)",
  "function commentCount() view returns (uint)",
  "function comments(uint) view returns (uint id, uint tweetId, address author, string text, uint timestamp)"
];

let provider;
let signer;
let contract;

// Fungsi logout sederhana
function logout() {
  window.location.href = "index.html";
}
document.getElementById("logoutButton").addEventListener("click", logout);

// Inisialisasi profil
async function initProfile() {
  if (typeof window.ethereum !== 'undefined') {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const userAddress = await signer.getAddress();
    document.getElementById("walletAddress").innerText = "Wallet: " + userAddress;

    // Ambil data registrasi user (username)
    const userInfo = await contract.users(userAddress);
    const username = userInfo[0];
    document.getElementById("username").innerText = "Username: " + username;

    // Muat tweet yang diposting oleh user
    loadMyTweets(userAddress);
    // Muat komentar yang dibuat user
    loadMyComments(userAddress);
  } else {
    alert("MetaMask tidak ditemukan.");
  }
}

/**
 * Memuat semua tweet yang diposting oleh user
 */
async function loadMyTweets(userAddress) {
  const myTweetsDiv = document.getElementById("myTweets");
  myTweetsDiv.innerHTML = "<h3>My Tweets</h3>";

  const myDeletedTweetsDiv = document.getElementById("myDeletedTweets");
  myDeletedTweetsDiv.innerHTML = "<h3>Deleted Tweets</h3>";

  try {
    const tweetCountBN = await contract.tweetCount();
    const tweetCount = tweetCountBN.toNumber();

    for (let i = tweetCount; i > 0; i--) {
      const tweet = await contract.tweets(i - 1);
      // Pastikan tweet.author adalah user ini
      if (tweet.author.toLowerCase() === userAddress.toLowerCase()) {
        // Konversi tweet.id ke Number
        const tweetId = tweet.id.toNumber();

        // Ambil jumlah komentar, dsb.
        const commentCountBN = await contract.commentCount();
        const totalComments = commentCountBN.toNumber();
        let tweetCommentCount = 0;
        let tweetCommentsHtml = "";

        for (let j = 1; j <= totalComments; j++) {
          try {
            const comment = await contract.comments(j - 1);
            if (comment.tweetId.toNumber() === tweetId) {
              tweetCommentCount++;
              const userData = await contract.users(comment.author);
              const commentUsername = userData[0];
              tweetCommentsHtml += `
                <p style="font-size:0.9em; margin-left:10px;">
                  <strong>${commentUsername}</strong><br>
                  <span style="font-weight: normal; font-size:0.8em;">${comment.author}</span>: ${comment.text}
                  <span style="font-size:0.8em;color:gray;">(${new Date(comment.timestamp.toNumber() * 1000).toLocaleString()})</span>
                </p>
              `;
            }
          } catch (err) {
            console.error(`Error fetching comment ${j} for tweet ${tweetId}:`, err);
          }
        }

        // Buat tampilan tweet card
        const tweetCard = document.createElement("div");
        tweetCard.className = "card";
        tweetCard.innerHTML = `
          <p>
            <strong>${tweet.author}</strong> - ${new Date(tweet.timestamp.toNumber() * 1000).toLocaleString()}
          </p>
          <p>${tweet.text}</p>
          ${
            tweet.imageUrl
              ? `<img src="${tweet.imageUrl}" alt="Tweet Image" style="max-width:100%; border-radius:8px;">`
              : ""
          }
          <p>Likes: ${tweet.likeCount}</p>
          <p>Comments: ${tweetCommentCount}</p>
          <div>${tweetCommentsHtml}</div>
        `;

        // CEK apakah tweet ini deleted
        if (tweet.deleted) {
          // Masukkan ke "Deleted Tweets"
          myDeletedTweetsDiv.appendChild(tweetCard);
        } else {
          // Masukkan ke "My Tweets"
          myTweetsDiv.appendChild(tweetCard);
        }
      }
    }
  } catch (error) {
    console.error("Error loading tweets:", error);
  }
}


/**
 * Memuat komentar yang dibuat user pada tweet orang lain
 */
async function loadMyComments(userAddress) {
  const commentsDiv = document.getElementById("myComments");
  commentsDiv.innerHTML = "<h3>My Comments</h3>";
  try {
    const commentCountBN = await contract.commentCount();
    const totalComments = commentCountBN.toNumber();
    let userCommentsCount = 0;

    for (let i = 1; i <= totalComments; i++) {
      try {
        const comment = await contract.comments(i - 1);
        // Jika komentar ini milik user
        if (comment.author.toLowerCase() === userAddress.toLowerCase()) {
          userCommentsCount++;
          // Ambil data tweet berdasarkan comment.tweetId
          const tweetIdNum = comment.tweetId.toNumber();
          // Dapatkan data tweet
          const tweetData = await contract.tweets(tweetIdNum - 1);
          // Dapatkan author tweet
          const tweetAuthorData = await contract.users(tweetData.author);
          const tweetAuthorUsername = tweetAuthorData[0];

          const commentCard = document.createElement("div");
          commentCard.className = "card";
          commentCard.innerHTML = `
            <p><strong>Comment on ${tweetAuthorUsername}'s tweet</strong></p>
            <p>${comment.text}</p>
            <p style="font-size:0.8em; color:gray;">
              ${new Date(comment.timestamp.toNumber() * 1000).toLocaleString()}
            </p>
          `;
          commentsDiv.appendChild(commentCard);
        }
      } catch (err) {
        console.error(`Error fetching comment ${i} for user:`, err);
      }
    }
    document.getElementById("myCommentCount").innerText = "Comments Count: " + userCommentsCount;
  } catch (error) {
    console.error("Error loading user comments:", error);
  }
}

initProfile();
