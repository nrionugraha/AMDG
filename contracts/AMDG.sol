// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract AMDG {
    // Struct untuk menyimpan data user
    struct User {
        string username;
        bool exists;
    }

    // Struct untuk menyimpan data tweet
    struct Tweet {
        uint id;
        address author;
        string text;
        string imageUrl;
        uint timestamp;
        uint likeCount;
    }

    // Struct untuk menyimpan data komentar
    struct Comment {
        uint id;
        uint tweetId;
        address author;
        string text;
        uint timestamp;
    }

    // Mapping untuk menyimpan user berdasarkan address
    mapping(address => User) public users;
    // Array untuk menyimpan semua tweet
    Tweet[] public tweets;
    // Array untuk menyimpan semua komentar
    Comment[] public comments;
    // Mapping untuk memeriksa apakah suatu user telah melakukan like pada tweet tertentu
    mapping(uint => mapping(address => bool)) public tweetLikes;

    // Counter untuk tweet dan komentar
    uint public tweetCount;
    uint public commentCount;

    // Events untuk mencatat aktivitas di blockchain
    event UserRegistered(address indexed user, string username);
    event TweetPosted(uint tweetId, address indexed author, string text, string imageUrl, uint timestamp);
    event CommentPosted(uint commentId, uint indexed tweetId, address indexed author, string text, uint timestamp);
    event TweetLiked(uint tweetId, address indexed liker);

    /// @notice Fungsi untuk mendaftarkan user baru dengan username
    /// @param _username Username yang diinginkan
    function registerUser(string memory _username) external {
        require(!users[msg.sender].exists, "User already registered.");
        users[msg.sender] = User(_username, true);
        emit UserRegistered(msg.sender, _username);
    }

    /// @notice Fungsi untuk memposting tweet baru
    /// @param _text Isi tweet
    /// @param _imageUrl URL gambar (jika ada)
    function postTweet(string memory _text, string memory _imageUrl) external {
        require(users[msg.sender].exists, "User not registered.");
        tweetCount++;
        tweets.push(Tweet(tweetCount, msg.sender, _text, _imageUrl, block.timestamp, 0));
        emit TweetPosted(tweetCount, msg.sender, _text, _imageUrl, block.timestamp);
    }

    /// @notice Fungsi untuk memposting komentar pada tweet
    /// @param _tweetId ID tweet yang dikomentari
    /// @param _commentText Isi komentar
    function commentTweet(uint _tweetId, string memory _commentText) external {
        require(users[msg.sender].exists, "User not registered.");
        require(_tweetId > 0 && _tweetId <= tweetCount, "Tweet does not exist.");
        commentCount++;
        comments.push(Comment(commentCount, _tweetId, msg.sender, _commentText, block.timestamp));
        emit CommentPosted(commentCount, _tweetId, msg.sender, _commentText, block.timestamp);
    }

    /// @notice Fungsi untuk melakukan like pada tweet (hanya sekali per user)
    /// @param _tweetId ID tweet yang akan di-like
    function likeTweet(uint _tweetId) external {
        require(users[msg.sender].exists, "User not registered.");
        require(_tweetId > 0 && _tweetId <= tweetCount, "Tweet does not exist.");
        require(!tweetLikes[_tweetId][msg.sender], "Tweet already liked.");
        tweetLikes[_tweetId][msg.sender] = true;
        // Karena array tweets mulai dari index 0, gunakan (_tweetId - 1)
        tweets[_tweetId - 1].likeCount++;
        emit TweetLiked(_tweetId, msg.sender);
    }

    /// @notice Fungsi untuk mendapatkan jumlah tweet (berguna untuk pagination)
    function getTweetsCount() external view returns (uint) {
        return tweetCount;
    }

    /// @notice Fungsi untuk mendapatkan data tweet berdasarkan ID
    /// @param _tweetId ID tweet yang dicari
    function getTweet(uint _tweetId) external view returns (Tweet memory) {
        require(_tweetId > 0 && _tweetId <= tweetCount, "Tweet does not exist.");
        return tweets[_tweetId - 1];
    }

    /// @notice Fungsi untuk mendapatkan jumlah komentar
    function getCommentsCount() external view returns (uint) {
        return commentCount;
    }

    /// @notice Fungsi untuk mendapatkan data komentar berdasarkan ID
    /// @param _commentId ID komentar yang dicari
    function getComment(uint _commentId) external view returns (Comment memory) {
        require(_commentId > 0 && _commentId <= commentCount, "Comment does not exist.");
        return comments[_commentId - 1];
    }
}
