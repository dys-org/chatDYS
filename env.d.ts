/// <reference types="vite/client" />

declare module 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js' {
  import hljs from 'highlight.js';
  export default hljs;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTH_SECRET: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      OPENAI_API_KEY: string;
    }
  }
}
