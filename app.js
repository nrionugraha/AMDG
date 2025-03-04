/**
 * app.js
 * Mengatur fungsi halaman feed: membuat tweet baru, like, dan komentar.
 */

const CONTRACT_ADDRESS = "0x789FB401acBA27e8fAeC793CC392536Da43BdB52";

// ABI kontrak, tambahkan fungsi tweetLikes untuk cek status like
const CONTRACT_ABI = [
    "function users(address) view returns (string, bool)",
    "function postTweet(string _text, string _imageUrl) external",
    "function tweetCount() view returns (uint)",
    "function tweets(uint) view returns (uint id, address author, string text, string imageUrl, uint timestamp, uint likeCount, bool deleted)",
    "function commentCount() view returns (uint)",
    "function comments(uint) view returns (uint id, uint tweetId, address author, string text, uint timestamp)",
    "function likeTweet(uint _tweetId) external",
    "function commentTweet(uint _tweetId, string _commentText) external",
    "function tweetLikes(uint, address) view returns (bool)",
    "function deleteTweet(uint _tweetId) external"
];

let provider;
let signer;
let contract;

// Inisialisasi koneksi ke kontrak
async function init() {
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        loadFeed();
    } else {
        alert("MetaMask is not installed.");
    }
}

// Fungsi untuk memposting tweet baru
async function postTweet() {
    const tweetText = document.getElementById("tweetText").value;
    const imageUrl = document.getElementById("imageUrl").value;
    if (tweetText.trim() === "") {
        alert("Tweet text cannot be empty");
        return;
    }
    try {
        const tx = await contract.postTweet(tweetText, imageUrl);
        await tx.wait();
        alert("Tweet posted!");
        document.getElementById("tweetText").value = "";
        document.getElementById("imageUrl").value = "";
        loadFeed();
    } catch (error) {
        console.error("Error posting tweet:", error);
    }
}

// Fungsi untuk memuat komentar pada tweet tertentu
async function loadComments(tweetId) {
    const commentsSection = document.getElementById(`comments-${tweetId}`);
    if (!commentsSection) {
        console.warn(`No comments container found for tweet ${tweetId}`);
        return;
    }
    commentsSection.innerHTML = "";
    try {
        const commentCountBN = await contract.commentCount();
        const commentCount = commentCountBN.toNumber();
        console.log("Total comment count:", commentCount);

        for (let j = 1; j <= commentCount; j++) {
            try {
                const comment = await contract.comments(j - 1);
                if (comment.tweetId.toNumber() === tweetId) {
                    const userData = await contract.users(comment.author);
                    const commentUsername = userData[0];
                    commentsSection.innerHTML += `
                      <p>
                        <strong>${commentUsername}</strong>: ${comment.text}<br>
                        <span class="tweet-meta">${comment.author}</span>
                        <span style="font-size:0.8em;color:gray;">(${new Date(comment.timestamp.toNumber() * 1000).toLocaleString()})</span>
                      </p>
                    `;
                }
            } catch (err) {
                console.error(`Error fetching comment ${j} for tweet ${tweetId}:`, err);
            }
        }
    } catch (error) {
        console.error(`Error loading comments for tweet ${tweetId}:`, error);
    }
}

// Fungsi untuk memuat feed tweet
async function loadFeed() {
    const feedDiv = document.getElementById("feed");
    feedDiv.innerHTML = "";
    try {
        const tweetCountBN = await contract.tweetCount();
        const tweetCount = tweetCountBN.toNumber();

        if (tweetCount === 0) {
            feedDiv.innerHTML = "<p>No tweets yet.</p>";
            return;
        }

        const userAddress = await signer.getAddress();

        for (let i = tweetCount; i > 0; i--) {
            try {
                const tweet = await contract.tweets(i - 1);
                
                // Jika tweet sudah dihapus, lewati
                if (tweet.deleted) {
                    continue;
                }
                const userData = await contract.users(tweet.author);
                const username = userData[0];

                const hasLiked = await contract.tweetLikes(tweet.id.toNumber(), userAddress);
                const likeBtnClass = hasLiked ? "icon-btn liked" : "icon-btn";

                const tweetCard = document.createElement("div");
                tweetCard.className = "card";
                const deleteButtonHTML =
                    tweet.author.toLowerCase() === userAddress.toLowerCase()
                    ? `<button class="delete-btn" onclick="deleteTweet(${tweet.id})" title="Delete">
                        <svg class="icon-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <!-- Contoh path ikon trash -->
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9
                                    a2 2 0 0 1-2-2L5 6m3 0V4
                                    a2 2 0 0 1 2-2h4
                                    a2 2 0 0 1 2 2v2">
                            </path>
                            </svg>
                        </button>`
                    : "";   
                tweetCard.innerHTML = `
                ${deleteButtonHTML}
                  <p>
                    <strong>${username}</strong><br>
                    <span class="tweet-meta">${tweet.author} - ${new Date(tweet.timestamp * 1000).toLocaleString()}</span>
                  </p>
                  <p>${tweet.text}</p>
                  ${tweet.imageUrl ? `<img src="${tweet.imageUrl}" alt="Tweet Image" style="max-width:100%; border-radius:8px;">` : ""}
                  <p>Likes: ${tweet.likeCount}</p>
                  <div class="comment-section">
                    <button class="${likeBtnClass}" onclick="likeTweet(${tweet.id})" title="Like">
                      <svg class="icon-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78
                                0L12 5.67l-1.06-1.06a5.5 5.5 0
                                0 0-7.78 7.78l1.06 1.06L12
                                21.23l7.78-7.78 1.06-1.06
                                a5.5 5.5 0 0 0 0-7.78z">
                        </path>
                    </svg>
                    </button>
                    <input class="input comment-input" type="text" id="commentInput-${tweet.id}" placeholder="Add a comment">
                    <button class="icon-btn" onclick="commentTweet(${tweet.id})" title="Comment">
                        <svg class="icon-comment" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7
                                    l-4 4V5a2 2 0 0 1 2-2h14
                                    a2 2 0 0 1 2 2z">
                            </path>
                        </svg>
                    </button>
                    <!-- Tombol Delete (hanya tampil jika user adalah author) -->
                  </div>
                  <div id="comments-${tweet.id}" class="comments-container"></div>
                `;
                feedDiv.appendChild(tweetCard);
                await loadComments(tweet.id.toNumber());
            } catch (err) {
                console.error(`Error loading tweet at index ${i - 1}:`, err);
            }
        }
    } catch (error) {
        console.error("Error loading feed:", error);
    }
}


// Fungsi untuk like tweet
async function likeTweet(tweetId) {
    try {
        const tx = await contract.likeTweet(tweetId);
        await tx.wait();
        alert("Tweet liked!");
        loadFeed();
    } catch (error) {
        console.error("Error liking tweet:", error);
    }
}

// Fungsi untuk mengirim komentar pada tweet
async function commentTweet(tweetId) {
    const commentText = document.getElementById(`commentInput-${tweetId}`).value;
    if (commentText.trim() === "") {
        alert("Comment cannot be empty");
        return;
    }
    try {
        const tx = await contract.commentTweet(tweetId, commentText);
        await tx.wait();
        alert("Comment added!");
        document.getElementById(`commentInput-${tweetId}`).value = "";
        loadFeed();
    } catch (error) {
        console.error("Error commenting on tweet:", error);
    }
}
async function deleteTweet(tweetId) {
    try {
        const tx = await contract.deleteTweet(tweetId);
        await tx.wait();
        alert("Tweet deleted!");
        loadFeed();
    } catch (error) {
        console.error("Error deleting tweet:", error);
    }
}

document.getElementById("postTweetButton").addEventListener("click", postTweet);
init();
