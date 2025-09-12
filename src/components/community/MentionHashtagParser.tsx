import React from 'react';
import { Link } from 'react-router-dom';

interface MentionHashtagParserProps {
  content: string;
  onHashtagClick?: (hashtag: string) => void;
}

export const MentionHashtagParser: React.FC<MentionHashtagParserProps> = ({
  content,
  onHashtagClick
}) => {
  const parseContent = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Combined regex for mentions and hashtags
    const regex = /(@[\w.]+|#[\w]+)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      const matchText = match[0];
      const key = `${matchText}-${match.index}`;
      
      if (matchText.startsWith('@')) {
        // Handle mentions
        const username = matchText.slice(1);
        parts.push(
          <Link
            key={key}
            to={`/u/${username}`}
            className="text-primary hover:text-primary/80 font-medium"
          >
            {matchText}
          </Link>
        );
      } else if (matchText.startsWith('#')) {
        // Handle hashtags
        const hashtag = matchText.slice(1);
        parts.push(
          <button
            key={key}
            onClick={() => onHashtagClick?.(hashtag)}
            className="text-primary hover:text-primary/80 font-medium bg-transparent border-none p-0 cursor-pointer"
          >
            {matchText}
          </button>
        );
      }
      
      lastIndex = match.index + matchText.length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="whitespace-pre-wrap">
      {parseContent(content)}
    </div>
  );
};

export const extractMentions = (content: string): string[] => {
  const mentions = content.match(/@[\w.]+/g) || [];
  return mentions.map(mention => mention.slice(1));
};

export const extractHashtags = (content: string): string[] => {
  const hashtags = content.match(/#[\w]+/g) || [];
  return hashtags.map(hashtag => hashtag.slice(1));
};