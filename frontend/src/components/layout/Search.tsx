import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';

interface Media {
  id: number;
  title: string;
  artist: string;
  cover_image?: string;
  thumbnail?: string;
}

interface SearchResult extends Media {
  type: 'song' | 'video';
}

interface SearchInputEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement;
}

const SearchContainer = styled.div`
  padding: 24px;
  color: white;
`;

const SearchHeader = styled.div`
  margin-bottom: 32px;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background: #ffffff1a;
  padding: 8px 16px;
  border-radius: 4px;
  margin-bottom: 24px;

  input {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    width: 100%;
    margin-left: 8px;
    &:focus {
      outline: none;
    }
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
`;

const ResultCard = styled(Link)<ResultCardProps>`
  background: #181818;
  padding: 16px;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: background-color 0.3s;
  &:hover {
    background: #282828;
  }
`;

const CardImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 8px 0;
`;

const CardSubtitle = styled.p`
  font-size: 14px;
  color: #b3b3b3;
  margin: 0;
`;

interface ResultCardProps {
  to: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const search = async () => {
      try {
        const [songsRes, videosRes] = await Promise.all([
          fetch(`/api/songs/?search=${query}`),
          fetch(`/api/videos/?search=${query}`)
        ]);

        const [songs, videos] = await Promise.all([
          songsRes.json(),
          videosRes.json()
        ]);

        const formattedResults: SearchResult[] = [
          ...songs.map((song: Media) => ({ ...song, type: 'song' as const })),
          ...videos.map((video: Media) => ({ ...video, type: 'video' as const }))
        ];

        setResults(formattedResults);
      } catch (error) {
        console.error('Error searching:', error);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleInputChange = (e: SearchInputEvent) => {
    setQuery(e.target.value);
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <h1>Search</h1>
        <SearchInput>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search for songs or videos..."
            value={query}
            onChange={handleInputChange}
          />
        </SearchInput>
      </SearchHeader>

      <ResultsGrid>
        {results.map((result: SearchResult) => (
          <ResultCard
            key={`${result.type}-${result.id}`}
            to={`/${result.type}/${result.id}`}
          >
            <CardImage
              src={result.type === 'song' ? result.cover_image : result.thumbnail}
              alt={result.title}
            />
            <CardTitle>{result.title}</CardTitle>
            <CardSubtitle>{result.artist}</CardSubtitle>
          </ResultCard>
        ))}
      </ResultsGrid>
    </SearchContainer>
  );
};

export default Search;