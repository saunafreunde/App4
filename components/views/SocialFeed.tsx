import React, { useState, useEffect } from 'react';
import { Profile, Post } from '../../types.ts';
import { apiClient } from '../../apiClient.ts';
import Loader from '../Loader.tsx';
import CreatePostForm from '../social/CreatePostForm.tsx';
import PostCard from '../social/PostCard.tsx';

interface SocialFeedProps {
    profile: Profile;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ profile }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const data = await apiClient.getPosts();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  }

  return (
    <div>
      <header className="header">
        <h1>Social Feed</h1>
        <p>Tausche dich mit anderen Mitgliedern aus.</p>
      </header>
      
      <CreatePostForm profile={profile} onPostCreated={handlePostCreated} />

      {loading ? <Loader /> : (
        <div className="feed-container">
          {posts.length > 0 ? posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={profile} />
          )) : (
            <div className="card text-center">
              <p>Noch keine Beiträge vorhanden. Sei der Erste!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
