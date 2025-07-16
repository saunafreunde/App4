import React, { useState } from 'react';
import { apiClient } from '../../apiClient.ts';
import { Post, Profile } from '../../types.ts';

interface CreatePostFormProps {
    profile: Profile;
    onPostCreated: (newPost: Post) => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ profile, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !profile) return;

        setLoading(true);
        setError('');
        const { data, error: apiError } = await apiClient.addPost({
            user_id: profile.id,
            content: content,
            type: 'text', // Standardmäßig Text-Post
            poll_options: null,
            votes: null,
            image_url: null,
            embed_url: null,
            likes: [],
        });
        
        if (data) {
            onPostCreated(data);
            setContent('');
        } else {
            console.error(apiError);
            setError('Beitrag konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
        }
        setLoading(false);
    };

    return (
        <div className="card create-post-card">
             <form onSubmit={handleSubmit}>
                <textarea
                    className="input-field"
                    placeholder={`Was gibt's Neues, ${profile.nickname || profile.name}?`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    required
                    aria-label="Neuer Beitrag"
                />
                {error && <p className="error-message" style={{marginBottom: '1rem'}}>{error}</p>}
                <div className="create-post-actions">
                     {/* Placeholder for other post types */}
                    <div>
                        <button type="button" className="icon-btn" title="Bild hochladen (demnächst)" disabled>
                            <span className="material-icons-outlined">image</span>
                        </button>
                        <button type="button" className="icon-btn" title="Umfrage erstellen (demnächst)" disabled>
                            <span className="material-icons-outlined">poll</span>
                        </button>
                        <button type="button" className="icon-btn" title="Embed einfügen (demnächst)" disabled>
                            <span className="material-icons-outlined">link</span>
                        </button>
                    </div>
                    <button type="submit" className="btn" disabled={loading || !content.trim()}>
                        {loading ? 'Posten...' : 'Beitrag posten'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePostForm;