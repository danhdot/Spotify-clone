/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="styled-components" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '@material-ui/icons/*' {
  import { SvgIconProps } from '@material-ui/core/SvgIcon';
  const Icon: React.ComponentType<SvgIconProps>;
  export default Icon;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
  }
}

interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: () => any;
}

export interface Media {
  id: number;
  title: string;
  artist?: string;
  url: string;
  type: 'audio' | 'video';
  thumbnail: string;
  cover_image?: string;
  duration?: number;
  audio_file: string;
  video_file: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  items: Media[];
  createdAt: string;
  updatedAt: string;
  songs?: Media[];
  videos?: Media[];
}

declare interface Album {
  id: number;
  title: string;
  artist: string;
  cover_image: string;
  songs: Media[];
  created_at: string;
}

declare interface User {
  id: number;
  username: string;
  email: string;
}

declare interface Favorite {
  id: number;
  user: User;
  songs: Media[];
  videos: Media[];
  albums: Album[];
}

declare interface SearchResult extends Media {
  type: 'song' | 'video';
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
