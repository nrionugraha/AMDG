// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract AMDG {
    struct User {
        string username;
        bool exists;
    }

    struct Tweet {
        uint id;
        address author;
        string text;
        string imageUrl;
        uint timestamp;
        uint likeCount;
        bool deleted; // Flag untuk soft delete
    }

    struct Comment {
        uint id;
        uint tweetId;
        address author;
        string text;
        uint timestamp;
    }

    mapping(address => User) public users;
    Tweet[] public tweets;
    Comment[] public comments;
    mapping(uint => mapping(address => bool)) public tweetLikes;

    uint public tweetCount;
    uint public commentCount;

    event UserRegistered(address indexed user, string username);
    event TweetPosted(uint tweetId, address indexed author, string text, string imageUrl, uint timestamp);
    event CommentPosted(uint commentId, uint indexed tweetId, address indexed author, string text, uint timestamp);
    event TweetLiked(uint tweetId, address indexed liker);
    event TweetDeleted(uint tweetId, address indexed author);

    function registerUser(string memory _username) external {
        require(!users[msg.sender].exists, "User already registered.");
        users[msg.sender] = User(_username, true);
        emit UserRegistered(msg.sender, _username);
    }

    function postTweet(string memory _text, string memory _imageUrl) external {
        require(users[msg.sender].exists, "User not registered.");
        tweetCount++;
        tweets.push(Tweet(tweetCount, msg.sender, _text, _imageUrl, block.timestamp, 0, false));
        emit TweetPosted(tweetCount, msg.sender, _text, _imageUrl, block.timestamp);
    }

    function commentTweet(uint _tweetId, string memory _commentText) external {
        require(users[msg.sender].exists, "User not registered.");
        require(_tweetId > 0 && _tweetId <= tweetCount, "Tweet does not exist.");
        commentCount++;
        comments.push(Comment(commentCount, _tweetId, msg.sender, _commentText, block.timestamp));
        emit CommentPosted(commentCount, _tweetId, msg.sender, _commentText, block.timestamp);
    }

    function likeTweet(uint _tweetId) external {
        require(users[msg.sender].exists, "User not registered.");
        require(_tweetId > 0 && _tweetId <= tweetCount, "Tweet does not exist.");
        require(!tweetLikes[_tweetId][msg.sender], "Tweet already liked.");
        tweetLikes[_tweetId][msg.sender] = true;
        tweets[_tweetId - 1].likeCount++;
        emit TweetLiked(_tweetId, msg.sender);
    }

    /// @notice Fungsi untuk menghapus tweet (soft delete)
    /// Hanya pengarang tweet yang bisa menghapus tweet-nya
    /// @param _tweetId ID tweet yang akan dihapus
    function deleteTweet(uint _tweetId) external {
        require(_tweetId > 0 && _tweetId <= tweetCount, "Tweet does not exist.");
        Tweet storage tweetToDelete = tweets[_tweetId - 1];
        require(msg.sender == tweetToDelete.author, "Only the author can delete this tweet.");
        require(!tweetToDelete.deleted, "Tweet already deleted.");
        tweetToDelete.deleted = true;
        emit TweetDeleted(_tweetId, msg.sender);
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
