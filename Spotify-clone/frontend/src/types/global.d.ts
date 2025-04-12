/// <reference types="react-scripts" />
/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="vite/client" />

import 'react';
import 'styled-components';
import 'react-router-dom';

declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      textSecondary: string;
    }
  }
}

declare module 'react-router-dom' {
  export * from '@types/react-router-dom';
}

declare module '@material-ui/icons/*' {
  import { SvgIconProps } from '@material-ui/core/SvgIcon';
  const Icon: React.ComponentType<SvgIconProps>;
  export default Icon;
}

declare module '@material-ui/core/*';
declare module 'react-player';

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PUBLIC_URL: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => any;
  }

  declare interface Media {
    id: number;
    title: string;
    artist: string;
    duration: number;
    type: 'song' | 'video';
    url: string;
    cover_image?: string;
  }

  declare interface Song extends Media {
    type: 'song';
    album?: string;
    genre?: string;
  }

  declare interface Video extends Media {
    type: 'video';
    thumbnail?: string;
  }

  declare interface Playlist {
    id: number;
    name: string;
    description?: string;
    songs: Song[];
    videos: Video[];
    created_at: string;
    updated_at: string;
  }

  interface SearchResult extends Media {
    type: 'song' | 'video';
  }

  interface Favorite {
    songs: Media[];
    videos: Media[];
  }

  interface Album {
    id: number;
    title: string;
    artist: string;
    cover_image: string;
    songs: Media[];
    created_at: string;
  }

  interface User {
    id: number;
    username: string;
    email: string;
  }
}