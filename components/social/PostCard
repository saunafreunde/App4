import React, { useState } from 'react';
import { Post, Profile, Comment } from '../../types.ts';
import { apiClient } from '../../apiClient.ts';

interface PostCardProps {
    post: Post;
    currentUser: Profile;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser }) => {
    const [likes, setLikes] = useState(post.likes || []);
    const [comments, setComments] = useState(post.comments || []);
    const [newComment, setNewComment] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);
    
    const isLiked = likes.includes(currentUser.id);

    const handleLike = async () => {
        // Optimistic update
        const originalLikes = likes;
        const newLikes = isLiked ? likes.filter(id => id !== currentUser.id) : [...likes, currentUser.id];
        setLikes(newLikes);

        const { error } = await apiClient.toggleLikePost(post.id, currentUser.id);
        if (error) {
            setLikes(originalLikes); // Revert on error
            console.error(error);
        }
    };
    
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        setIsCommenting(true);
        const {data, error} = await apiClient.addComment({
            post_id: post.id,
            user_id: currentUser.id,
            content: newComment,
        });
        
        if (data) {
            setComments([...comments, data]);
            setNewComment('');
        } else {
            console.error(error);
        }
        setIsCommenting(false);
    };

    const renderPostContent = () => {
        // This can be expanded for other post types like 'image', 'poll', 'embed'
        switch(post.type) {
            case 'image':
                return (
                    <div>
                        {post.image_url && <img src={post.image_url} alt="Beitrag Bild" style={{maxWidth: '100%', borderRadius: '8px'}} />}
                        <p className="post-content">{post.content}</p>
                    </div>
                );
            case 'text':
            default:
                return <p className="post-content">{post.content}</p>;
        }
    }

    return (
        <article className="card post-card" aria-labelledby={`post-author-${post.id}`}>
            <div className="post-header">
                <img src={post.profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${post.profile?.name}`} alt={post.profile?.username} className="avatar" />
                <div>
                    <span id={`post-author-${post.id}`} className="post-author-name">{post.profile?.name}</span>
                    <span className="post-author-username">@{post.profile?.username}</span>
                    <span className="post-timestamp">· {new Date(post.created_at).toLocaleString('de-DE')}</span>
                </div>
            </div>
            {renderPostContent()}
            <div className="post-actions">
                <button className="icon-btn" aria-label={`${comments.length} Kommentare`}>
                    <span className="material-icons-outlined" aria-hidden="true">chat_bubble_outline</span> {comments.length}
                </button>
                <button className={`icon-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike} aria-pressed={isLiked} aria-label={`${likes.length} Likes`}>
                    <span className="material-icons-outlined" aria-hidden="true">{isLiked ? 'favorite' : 'favorite_border'}</span> {likes.length}
                </button>
                 <button className="icon-btn" aria-label="Teilen (demnächst)">
                    <span className="material-icons-outlined" aria-hidden="true">share</span>
                </button>
            </div>
            <div className="comment-section">
                <form onSubmit={handleCommentSubmit} className="comment-form">
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Schreibe einen Kommentar..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        aria-label="Neuer Kommentar"
                    />
                    <button type="submit" className="btn" disabled={isCommenting || !newComment.trim()}>Senden</button>
                </form>
                <div className="comments-list">
                    {comments.map((comment: Comment) => (
                        <div key={comment.id} className="comment">
                            <img src={comment.profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${comment.profile?.name}`} alt={comment.profile?.username} className="avatar-small" />
                            <div>
                                <strong>{comment.profile?.name}</strong>
                                <p>{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
};

export default PostCard;
