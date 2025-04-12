/// <reference types="react-scripts" />
/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference path="./types/index.d.ts" />

declare module '@material-ui/icons/*';
declare module '@material-ui/core/*';

interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: () => any;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}