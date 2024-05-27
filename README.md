<p align="center">
  <a href="https://chatdys.soards.dev" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./packages/client/src/assets/img/chat-dys.svg">
      <source media="(prefers-color-scheme: light)" srcset="./packages/client/src/assets/img/chat-dys-light.svg">
      <img alt="chatDYS logo" width="350" style="max-width: 100%;">
    </picture>
  </a>
</p>

<p align="center">
  An AI chat app built with VueJS, Hono, Drizzle, SQLite, and Tanstack Query.
</p>

# chatDYS

## Project Setup

```sh
pnpm install
```

### Start Hono and Vite

```sh
cd packages/server
pnpm run dev
```

in a separate terminal

```sh
cd packages/client
pnpm run dev
```

This app is my own personal version of Chat GPT. It's somewhat of a hybrid of Chat GPT and the Open AI Playground. It has options to pick different models (currently only `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`, `gpt-4`, and `gpt-4-1106-preview` but I will be adding more), control Temperature, control Max Token Length, and enter a custom System Message.

Currently it only supports text chat, but I plan to add support for images and audio. Everything uses Open AI atm, but I would like to add other OS models also.

The Frontend is a Vue 3 SPA using Vite, and I used my personal component library - [deez-components](https://github.com/dys-org/deez-components).

Auth uses Github OAuth thru Lucia. Chat history is saved to a SQLite database.

After logging in you will be prompted to save your OpenAI API key locally in your browser because I don't feel like setting up billing for this side project and I don't want to pay for other people's potential usage. The API Key is **NOT** saved to my database.

Check it out here: https://chatdys.soards.dev
