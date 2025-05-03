---
title: "lobe-chat"
owner: "lobehub"
source: "https://github.com/lobehub/lobe-chat"
website: "https://chat-preview.lobehub.com"
description: "🤯 Lobe Chat - an open-source, modern-design AI chat framework. Supports Multi AI Providers( OpenAI / Claude 3 / Gemini / Ollama / DeepSeek / Qwen), Knowledge Base (file upload / knowledge management / RAG ), Multi-Modals (Plugins/Artifacts) and Thinking. One-click FREE deployment of your private ChatGPT/ Claude / DeepSeek application. - lobehub/lobe-chat"
stars: 60062
tags:
  - "clippings"
  - "clippings/github"
  - "chat"
  - "agent"
  - "ai"
  - "nextjs"
  - "gemini"
  - "openai"
  - "artifacts"
  - "gpt"
  - "knowledge_base"
  - "claude"
  - "rag"
  - "chatgpt"
  - "function_calling"
  - "ollama"
  - "deepseek"
  - "deepseek_r1"
  - "chat"
  - "ai"
  - "agent"
  - "nextjs"
  - "gemini"
  - "openai"
  - "artifacts"
  - "gpt"
  - "knowledge_base"
  - "claude"
  - "rag"
  - "chatgpt"
  - "function_calling"
  - "ollama"
  - "deepseek"
  - "deepseek_r1"
date created: Saturday, May 3rd 2025, 2:16 pm
---

## README

[![](https://private-user-images.githubusercontent.com/34400653/411257447-6f293c7f-47b4-47eb-9202-fe68a942d35b.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTc0NDctNmYyOTNjN2YtNDdiNC00N2ViLTkyMDItZmU2OGE5NDJkMzViLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTRmODE5ZmFlY2Q2ZDgzZmQ4MTNkMmVlZGM0MjAxNzk2ZDQzNWE1ODQyNWI3M2FmYTAzYTQ4ZjA0NzczNWU5ODAmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.o56M8zFM_-WmJkdbwN6Sz5faFEC4kG829JEKkyTBZcc)](https://chat-preview.lobehub.com/)

# Lobe ChatAn open-source, modern-design ChatGPT/LLMs UI/Framework.  
Supports speech-synthesis, multi-modal, and extensible ([function call](https://lobehub.com/blog/openai-function-call)) plugin system.  
One-click **FREE** deployment of your private OpenAI ChatGPT/Claude/Gemini/Groq/Ollama chat application.

**English** · [简体中文](https://github.com/lobehub/lobe-chat/blob/main/README.zh-CN.md) · [Official Site](https://lobehub.com/) · [Changelog](https://lobehub.com/changelog) · [Documents](https://lobehub.com/docs/usage/start) · [Blog](https://lobehub.com/blog) · [Feedback](https://github.com/lobehub/lobe-chat/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen)

[![](https://camo.githubusercontent.com/812b72114fcc58f4b9fd47b72f518210aea8e7c0f8ff927ac7dbfab3cde22d8c/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f762f72656c656173652f6c6f62656875622f6c6f62652d636861743f636f6c6f723d333639656666266c6162656c436f6c6f723d626c61636b266c6f676f3d676974687562267374796c653d666c61742d737175617265)](https://github.com/lobehub/lobe-chat/releases) [![](https://camo.githubusercontent.com/01bc098d592aba12bbc7cb3a1535d55f958398b344486b97a6e0a947ee1ec46a/68747470733a2f2f696d672e736869656c64732e696f2f646f636b65722f762f6c6f62656875622f6c6f62652d636861742d64617461626173653f636f6c6f723d333639656666266c6162656c3d646f636b6572266c6162656c436f6c6f723d626c61636b266c6f676f3d646f636b6572266c6f676f436f6c6f723d7768697465267374796c653d666c61742d73717561726526736f72743d73656d766572)](https://hub.docker.com/r/lobehub/lobe-chat-database) [![](https://camo.githubusercontent.com/e964dd95e59064dfe7515e29ae7cf81ff996501017d1e7f8249c393a98d8deee/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f76657263656c2d6f6e6c696e652d3535623436373f6c6162656c436f6c6f723d626c61636b266c6f676f3d76657263656c267374796c653d666c61742d737175617265)](https://chat-preview.lobehub.com/) [![](https://camo.githubusercontent.com/7dbe329f8f95bab6121acf8bd8e5c73ba1c0d7da516b7116a8ca4600456f2881/68747470733a2f2f696d672e736869656c64732e696f2f646973636f72642f313132373137313137333938323135343839333f636f6c6f723d353836354632266c6162656c3d646973636f7264266c6162656c436f6c6f723d626c61636b266c6f676f3d646973636f7264266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://discord.gg/AYFPHvv2jT)  
[![](https://camo.githubusercontent.com/3df8c4d438b81206bc3b38390331b4f53281418e8328acf88fff0d085f58b802/68747470733a2f2f696d672e736869656c64732e696f2f636f6465636f762f632f6769746875622f6c6f62656875622f6c6f62652d636861743f6c6162656c436f6c6f723d626c61636b267374796c653d666c61742d737175617265266c6f676f3d636f6465636f76266c6f676f436f6c6f723d7768697465)](https://codecov.io/gh/lobehub/lobe-chat) [![](https://camo.githubusercontent.com/6447b77966237e5098956962015ca53f747f21f72178fc2d92b620f6ae82dff2/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f616374696f6e732f776f726b666c6f772f7374617475732f6c6f62656875622f6c6f62652d636861742f746573742e796d6c3f6c6162656c3d74657374266c6162656c436f6c6f723d626c61636b266c6f676f3d676974687562616374696f6e73266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://github.com/actions/workflows/lobehub/lobe-chat/test.yml) [![](https://camo.githubusercontent.com/ac0184147c8f0c32e1de7ea2142293e3a11baca46293e43e48bbe7e89d8506f3/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f616374696f6e732f776f726b666c6f772f7374617475732f6c6f62656875622f6c6f62652d636861742f72656c656173652e796d6c3f6c6162656c3d72656c65617365266c6162656c436f6c6f723d626c61636b266c6f676f3d676974687562616374696f6e73266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://github.com/actions/workflows/lobehub/lobe-chat/release.yml) [![](https://camo.githubusercontent.com/c05036537527e3ff99dda9798cc5acd8f71daa6eddb042835b560a37a279ce52/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f72656c656173652d646174652f6c6f62656875622f6c6f62652d636861743f6c6162656c436f6c6f723d626c61636b267374796c653d666c61742d737175617265)](https://github.com/lobehub/lobe-chat/releases)  
[![](https://camo.githubusercontent.com/b09346b3d44a8c3d579bd42e72e28dae86ff8683197aef6620d403a7b5079a6b/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f636f6e7472696275746f72732f6c6f62656875622f6c6f62652d636861743f636f6c6f723d633466303432266c6162656c436f6c6f723d626c61636b267374796c653d666c61742d737175617265)](https://github.com/lobehub/lobe-chat/graphs/contributors) [![](https://camo.githubusercontent.com/b9c19198c97f3dcebf5232a9af3b59b8547db6740ca0951ddd233ede4419830c/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f666f726b732f6c6f62656875622f6c6f62652d636861743f636f6c6f723d386165386666266c6162656c436f6c6f723d626c61636b267374796c653d666c61742d737175617265)](https://github.com/lobehub/lobe-chat/network/members) [![](https://camo.githubusercontent.com/767d3db9b301c82b0af8887af1c56a7cbb18e7c2b0a41e08056442759cb9fb17/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f6c6f62656875622f6c6f62652d636861743f636f6c6f723d666663623437266c6162656c436f6c6f723d626c61636b267374796c653d666c61742d737175617265)](https://github.com/lobehub/lobe-chat/network/stargazers) [![](https://camo.githubusercontent.com/8c85a079652917e2966895ec983e66fe2546836292c88d03f2b499a82d3e96d0/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732f6c6f62656875622f6c6f62652d636861743f636f6c6f723d666638306562266c6162656c436f6c6f723d626c61636b267374796c653d666c61742d737175617265)](https://github.com/lobehub/lobe-chat/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) [![](https://camo.githubusercontent.com/913c49799c247228e72d7bf626f4b8fd571dab763b861d415e6441a2494414db/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6c6963656e73652d617061636865253230322e302d77686974653f6c6162656c436f6c6f723d626c61636b267374796c653d666c61742d737175617265)](https://github.com/lobehub/lobe-chat/blob/main/LICENSE)  
[![](https://camo.githubusercontent.com/3ccad2aef413a66d2571c087aab3c8024c2baf5da678857655a3296f2b05caf7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d53706f6e736f722532304c6f62654875622d6630346638383f6c6f676f3d6f70656e636f6c6c656374697665266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://opencollective.com/lobehub "Become ❤️ LobeHub Sponsor")

**Share LobeChat Repository**

[![](https://camo.githubusercontent.com/3b08cfdaf54e0b210c92d8484b375b62c16e674c0eaa9fd465b0118c1351690f/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d73686172652532306f6e253230782d626c61636b3f6c6162656c436f6c6f723d626c61636b266c6f676f3d78266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://x.com/intent/tweet?hashtags=chatbot%2CchatGPT%2CopenAI&text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat) [![](https://camo.githubusercontent.com/78943b52d8c4cd2ca9026b32ac6714ec74776a1568210adafce1a67cf98f740f/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d73686172652532306f6e25323074656c656772616d2d626c61636b3f6c6162656c436f6c6f723d626c61636b266c6f676f3d74656c656772616d266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://t.me/share/url%22?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat) [![](https://camo.githubusercontent.com/4baf1db6d9f2e88da4d9e43b3c0f71ea57aed7d950ca0298245dc32b2d2c0e68/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d73686172652532306f6e25323077686174736170702d626c61636b3f6c6162656c436f6c6f723d626c61636b266c6f676f3d7768617473617070266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://api.whatsapp.com/send?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat%20%23chatbot%20%23chatGPT%20%23openAI) [![](https://camo.githubusercontent.com/bb0e2f1226c53f293dca4096513b46925d90339c50b5a8554ba83bbcaf7cb000/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d73686172652532306f6e2532307265646469742d626c61636b3f6c6162656c436f6c6f723d626c61636b266c6f676f3d726564646974266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://www.reddit.com/submit?title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat) [![](https://camo.githubusercontent.com/d984fbbf6d208be86d03027f2ea65aa00ff8c389b73b0e2fd53e1a3922288b84/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d73686172652532306f6e253230776569626f2d626c61636b3f6c6162656c436f6c6f723d626c61636b266c6f676f3d73696e61776569626f266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](http://service.weibo.com/share/share.php?sharesource=weibo&title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat) [![](https://camo.githubusercontent.com/0c8e2381c93e51d5f2c537e63a05e2cc6e6b8ece39ca43a0151b332b89feeaa9/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d73686172652532306f6e2532306d6173746f646f6e2d626c61636b3f6c6162656c436f6c6f723d626c61636b266c6f676f3d6d6173746f646f6e266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://mastodon.social/share?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source,%20extensible%20%28Function%20Calling%29,%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20https://github.com/lobehub/lobe-chat%20#chatbot%20#chatGPT%20#openAI) [![](https://camo.githubusercontent.com/8bcf72ab944a467413a89dfdf53c4776e5de3bb24842c1168df9d34bc0c4d497/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d73686172652532306f6e2532306c696e6b6564696e2d626c61636b3f6c6162656c436f6c6f723d626c61636b266c6f676f3d6c696e6b6564696e266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://linkedin.com/feed)

<sup>Pioneering the new age of thinking and creating. Built for you, the Super Individual.</sup>

[![](https://camo.githubusercontent.com/8e263f9ae556f2aea5b7e8de1c6d52e3a7707f183036eb073dd8edaf469d12a0/68747470733a2f2f7472656e6473686966742e696f2f6170692f62616467652f7265706f7369746f726965732f32323536)](https://trendshift.io/repositories/2256)

[![](https://private-user-images.githubusercontent.com/17870709/413799397-dbfaa84a-2c82-4dd9-815c-5be616f264a4.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8xNzg3MDcwOS80MTM3OTkzOTctZGJmYWE4NGEtMmM4Mi00ZGQ5LTgxNWMtNWJlNjE2ZjI2NGE0LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTc5ODg5NDU2YzAyNjhlZTI1N2I4YmJjYjI4YzEzZTliMmQ2NTY3ZGVkNmQzZmNmY2NiODI0ODc3MTFlNGNiZmQmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.MOUHnpyHLZE6llC_MPG-EglCRMO5rLIyuaarCLnrfy8)](https://private-user-images.githubusercontent.com/17870709/413799397-dbfaa84a-2c82-4dd9-815c-5be616f264a4.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8xNzg3MDcwOS80MTM3OTkzOTctZGJmYWE4NGEtMmM4Mi00ZGQ5LTgxNWMtNWJlNjE2ZjI2NGE0LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTc5ODg5NDU2YzAyNjhlZTI1N2I4YmJjYjI4YzEzZTliMmQ2NTY3ZGVkNmQzZmNmY2NiODI0ODc3MTFlNGNiZmQmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.MOUHnpyHLZE6llC_MPG-EglCRMO5rLIyuaarCLnrfy8)

Table of contents

#### TOC- [👋🏻 Getting Started & Join Our Community](https://github.com/lobehub/#-getting-started--join-our-community)
- [✨ Features](https://github.com/lobehub/#-features)
	- [`1` Chain of Thought](https://github.com/lobehub/#1-chain-of-thought)
	- [`2` Branching Conversations](https://github.com/lobehub/#2-branching-conversations)
	- [`3` Artifacts Support](https://github.com/lobehub/#3-artifacts-support)
	- [`4` File Upload /Knowledge Base](https://github.com/lobehub/#4-file-upload-knowledge-base)
	- [`5` Multi-Model Service Provider Support](https://github.com/lobehub/#5-multi-model-service-provider-support)
	- [`6` Local Large Language Model (LLM) Support](https://github.com/lobehub/#6-local-large-language-model-llm-support)
	- [`7` Model Visual Recognition](https://github.com/lobehub/#7-model-visual-recognition)
	- [`8` TTS & STT Voice Conversation](https://github.com/lobehub/#8-tts--stt-voice-conversation)
	- [`9` Text to Image Generation](https://github.com/lobehub/#9-text-to-image-generation)
	- [`10` Plugin System (Function Calling)](https://github.com/lobehub/#10-plugin-system-function-calling)
	- [`11` Agent Market (GPTs)](https://github.com/lobehub/#11-agent-market-gpts)
	- [`12` Support Local / Remote Database](https://github.com/lobehub/#12-support-local--remote-database)
	- [`13` Support Multi-User Management](https://github.com/lobehub/#13-support-multi-user-management)
	- [`14` Progressive Web App (PWA)](https://github.com/lobehub/#14-progressive-web-app-pwa)
	- [`15` Mobile Device Adaptation](https://github.com/lobehub/#15-mobile-device-adaptation)
	- [`16` Custom Themes](https://github.com/lobehub/#16-custom-themes)
	- [`*` What's more](https://github.com/lobehub/#-whats-more)
- [⚡️ Performance](https://github.com/lobehub/#%EF%B8%8F-performance)
- [🛳 Self Hosting](https://github.com/lobehub/#-self-hosting)
	- [`A` Deploying with Vercel, Zeabur , Sealos or Alibaba Cloud](https://github.com/lobehub/#a-deploying-with-vercel-zeabur--sealos-or-alibaba-cloud)
	- [`B` Deploying with Docker](https://github.com/lobehub/#b-deploying-with-docker)
	- [Environment Variable](https://github.com/lobehub/#environment-variable)
- [📦 Ecosystem](https://github.com/lobehub/#-ecosystem)
- [🧩 Plugins](https://github.com/lobehub/#-plugins)
- [⌨️ Local Development](https://github.com/lobehub/#%EF%B8%8F-local-development)
- [🤝 Contributing](https://github.com/lobehub/#-contributing)
- [❤️ Sponsor](https://github.com/lobehub/#%EF%B8%8F-sponsor)
- [🔗 More Products](https://github.com/lobehub/#-more-products)

  

## 👋🏻 Getting Started & Join Our CommunityWe are a group of e/acc design-engineers, hoping to provide modern design components and tools for AIGC. By adopting the Bootstrapping approach, we aim to provide developers and users with a more open, transparent, and user-friendly product ecosystem.

Whether for users or professional developers, LobeHub will be your AI Agent playground. Please be aware that LobeChat is currently under active development, and feedback is welcome for any [issues](https://img.shields.io/github/issues/lobehub/lobe-chat.svg?style=flat) encountered.

| [![](https://camo.githubusercontent.com/3f3fdc7e6958dc6bb198cd7712255d3a33c41e344f814843012a97ebe2da5a96/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5452592532304c4f4245434841542d4f4e4c494e452d3535623436373f6c6162656c436f6c6f723d626c61636b266c6f676f3d76657263656c267374796c653d666f722d7468652d6261646765)](https://chat-preview.lobehub.com/) | No installation or registration necessary! Visit our website to experience it firsthand. |
| --- | --- |
| [![](https://camo.githubusercontent.com/3307f84060c38c987358a9d91ace5d1cb808d5198373388a278ea896a5173c61/68747470733a2f2f696d672e736869656c64732e696f2f646973636f72642f313132373137313137333938323135343839333f636f6c6f723d353836354632266c6162656c3d646973636f7264266c6162656c436f6c6f723d626c61636b266c6f676f3d646973636f7264266c6f676f436f6c6f723d7768697465267374796c653d666f722d7468652d6261646765)](https://discord.gg/AYFPHvv2jT) | Join our Discord community! This is where you can connect with developers and other enthusiastic users of LobeHub. |

> [!IMPORTANT]
> Star Us, You will receive all release notifications from GitHub without any delay ~ ⭐️

[![](https://private-user-images.githubusercontent.com/34400653/411259454-c3b482e7-cef5-4e94-bef9-226900ecfaab.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTk0NTQtYzNiNDgyZTctY2VmNS00ZTk0LWJlZjktMjI2OTAwZWNmYWFiLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWE4NTMxMTk3ZDAyZDdiMGEzNWQ2MjMwZjA4ODYyZTg5ODQ0YzVjMmU4Y2RhZTQyYTQ4YzQ3MjkxZmZmYWZiMTkmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.k7GLABGFTRKcaOq5QjtuIBddpi7aC-q93J7wMMffmV0)](https://github.com/lobehub/lobe-chat/network/stargazers)

Star History  ![](https://camo.githubusercontent.com/208d297761668397f29ae4d69c1d31a7e4e4eda26a28c622f1bcb70c8d765936/68747470733a2f2f6170692e737461722d686973746f72792e636f6d2f7376673f7265706f733d6c6f62656875622532466c6f62652d6368617426747970653d44617465)  

## ✨ Features[![](https://private-user-images.githubusercontent.com/17870709/413550607-f74f1139-d115-4e9c-8c43-040a53797a5e.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8xNzg3MDcwOS80MTM1NTA2MDctZjc0ZjExMzktZDExNS00ZTljLThjNDMtMDQwYTUzNzk3YTVlLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTlkY2FjZmM2YTk5OTI4ZjFlOTdjNTA2ZTgzMGMxZWRmY2FhOGNmMWU2NGEyOTVlMGRkNzk5NjNhYmE3MjBmMDkmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.qBXhywasDxxtiNrxWbfRIjrMr933yhEfVgqPBpOXwjw)](https://lobehub.com/docs/usage/features/cot)

### `1` [Chain of Thought](https://lobehub.com/docs/usage/features/cot)Experience AI reasoning like never before. Watch as complex problems unfold step by step through our innovative Chain of Thought (CoT) visualization. This breakthrough feature provides unprecedented transparency into AI's decision-making process, allowing you to observe how conclusions are reached in real-time.

By breaking down complex reasoning into clear, logical steps, you can better understand and validate the AI's problem-solving approach. Whether you're debugging, learning, or simply curious about AI reasoning, CoT visualization transforms abstract thinking into an engaging, interactive experience.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/17870709/413551442-92f72082-02bd-4835-9c54-b089aad7fd41.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8xNzg3MDcwOS80MTM1NTE0NDItOTJmNzIwODItMDJiZC00ODM1LTljNTQtYjA4OWFhZDdmZDQxLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTdhNDQ2NTdkZjFmNTY0OGE3MmIzNzFkMTRlZjM0OGEyODc4YmRkZTE3M2M3YzJhMDAzZjBhOTcwMWQwODU2NGMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.dk2BsIL5SLmNjzvhE7twxppMy3-bK2cFJ8TzVLojVnM)](https://lobehub.com/docs/usage/features/branching-conversations)

### `2` [Branching Conversations](https://lobehub.com/docs/usage/features/branching-conversations)Introducing a more natural and flexible way to chat with AI. With Branch Conversations, your discussions can flow in multiple directions, just like human conversations do. Create new conversation branches from any message, giving you the freedom to explore different paths while preserving the original context.

Choose between two powerful modes:

- **Continuation Mode:** Seamlessly extend your current discussion while maintaining valuable context
- **Standalone Mode:** Start fresh with a new topic based on any previous message

This groundbreaking feature transforms linear conversations into dynamic, tree-like structures, enabling deeper exploration of ideas and more productive interactions.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/17870709/413551580-7f95fad6-b210-4e6e-84a0-7f39e96f3a00.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8xNzg3MDcwOS80MTM1NTE1ODAtN2Y5NWZhZDYtYjIxMC00ZTZlLTg0YTAtN2YzOWU5NmYzYTAwLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPThhMDUwNmYyZGRjMWVlNGJlMmIyMTZkMDdkNGYzOWExOWJkMGEzMWIzZmE5NmQzZmU3MjBhMTA5YzhkODUyNTMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.91q0Zeda_eq6dI79DXI1MMIheKHcmK4Rxzxy7xZMfcw)](https://lobehub.com/docs/usage/features/artifacts)

### `3` [Artifacts Support](https://lobehub.com/docs/usage/features/artifacts)Experience the power of Claude Artifacts, now integrated into LobeChat. This revolutionary feature expands the boundaries of AI-human interaction, enabling real-time creation and visualization of diverse content formats.

Create and visualize with unprecedented flexibility:

- Generate and display dynamic SVG graphics
- Build and render interactive HTML pages in real-time
- Produce professional documents in multiple formats

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411257914-7da7a3b2-92fd-4630-9f4e-8560c74955ae.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTc5MTQtN2RhN2EzYjItOTJmZC00NjMwLTlmNGUtODU2MGM3NDk1NWFlLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWYzNzc2NDBjNzBkMTg5NDc4ODE1OGQ2NmNhZWU3ODZiZjJkNjJkNWJhN2E4ZWVjMGUxNmU2YWFlMzIxOTJhNmImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.Ym6CJKVwByxcRYYgruD-l478GuoXKxSh5RzPnm8hMOk)](https://lobehub.com/blog/knowledge-base)

### `4` [File Upload /Knowledge Base](https://lobehub.com/blog/knowledge-base)LobeChat supports file upload and knowledge base functionality. You can upload various types of files including documents, images, audio, and video, as well as create knowledge bases, making it convenient for users to manage and search for files. Additionally, you can utilize files and knowledge base features during conversations, enabling a richer dialogue experience.

chat.pdf.mp4<video src="https://private-user-images.githubusercontent.com/28616219/363406445-faa8cf67-e743-4590-8bf6-ebf6ccc34175.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8yODYxNjIxOS8zNjM0MDY0NDUtZmFhOGNmNjctZTc0My00NTkwLThiZjYtZWJmNmNjYzM0MTc1Lm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTM5NzQ0MGFmMzA3NGIyOWNiMWU2NmVlYmRjM2ViZDFmMzNlNGQ5ZjE0MTcyZjhlZTE0N2EwNGExM2M4ZDY2MTImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.qg4nIvw2-WaibKSSErFXyD1cIFDB2uCjgbHzQ7Hiv0M" data-canonical-src="https://private-user-images.githubusercontent.com/28616219/363406445-faa8cf67-e743-4590-8bf6-ebf6ccc34175.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8yODYxNjIxOS8zNjM0MDY0NDUtZmFhOGNmNjctZTc0My00NTkwLThiZjYtZWJmNmNjYzM0MTc1Lm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTM5NzQ0MGFmMzA3NGIyOWNiMWU2NmVlYmRjM2ViZDFmMzNlNGQ5ZjE0MTcyZjhlZTE0N2EwNGExM2M4ZDY2MTImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.qg4nIvw2-WaibKSSErFXyD1cIFDB2uCjgbHzQ7Hiv0M" controls="controls" muted="muted" class="d-block rounded-bottom-2 border-top width-fit" style="max-height:640px; min-height: 200px"></video>
> [!TIP]
> Learn more on 📘 LobeChat Knowledge Base Launch — From Now On, Every Step Counts

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411259144-e553e407-42de-4919-977d-7dbfcf44a821.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTkxNDQtZTU1M2U0MDctNDJkZS00OTE5LTk3N2QtN2RiZmNmNDRhODIxLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTBhNDUwODE5ZmFmMzU1Yjg5ZjQxZGNkY2VhMTBiZDM1ZTllNzFhM2VjNTVkODU0Njk2NjFiNDYxNjg4Nzg2NzUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.qiT-kExDAcq5UAj5g0-p1OMMzM_pHQdu3HJJCMaN4Z4)](https://lobehub.com/docs/usage/features/multi-ai-providers)

### `5` [Multi-Model Service Provider Support](https://lobehub.com/docs/usage/features/multi-ai-providers)In the continuous development of LobeChat, we deeply understand the importance of diversity in model service providers for meeting the needs of the community when providing AI conversation services. Therefore, we have expanded our support to multiple model service providers, rather than being limited to a single one, in order to offer users a more diverse and rich selection of conversations.

In this way, LobeChat can more flexibly adapt to the needs of different users, while also providing developers with a wider range of choices.

#### Supported Model Service ProvidersWe have implemented support for the following model service providers:

- **[OpenAI](https://lobechat.com/discover/provider/openai)**: OpenAI is a global leader in artificial intelligence research, with models like the GPT series pushing the frontiers of natural language processing. OpenAI is committed to transforming multiple industries through innovative and efficient AI solutions. Their products demonstrate significant performance and cost-effectiveness, widely used in research, business, and innovative applications.
- **[Ollama](https://lobechat.com/discover/provider/ollama)**: Ollama provides models that cover a wide range of fields, including code generation, mathematical operations, multilingual processing, and conversational interaction, catering to diverse enterprise-level and localized deployment needs.
- **[Anthropic](https://lobechat.com/discover/provider/anthropic)**: Anthropic is a company focused on AI research and development, offering a range of advanced language models such as Claude 3.5 Sonnet, Claude 3 Sonnet, Claude 3 Opus, and Claude 3 Haiku. These models achieve an ideal balance between intelligence, speed, and cost, suitable for various applications from enterprise workloads to rapid-response scenarios. Claude 3.5 Sonnet, as their latest model, has excelled in multiple evaluations while maintaining a high cost-performance ratio.
- **[Bedrock](https://lobechat.com/discover/provider/bedrock)**: Bedrock is a service provided by Amazon AWS, focusing on delivering advanced AI language and visual models for enterprises. Its model family includes Anthropic's Claude series, Meta's Llama 3.1 series, and more, offering a range of options from lightweight to high-performance, supporting tasks such as text generation, conversation, and image processing for businesses of varying scales and needs.
- **[Google](https://lobechat.com/discover/provider/google)**: Google's Gemini series represents its most advanced, versatile AI models, developed by Google DeepMind, designed for multimodal capabilities, supporting seamless understanding and processing of text, code, images, audio, and video. Suitable for various environments from data centers to mobile devices, it significantly enhances the efficiency and applicability of AI models.
- **[DeepSeek](https://lobechat.com/discover/provider/deepseek)**: DeepSeek is a company focused on AI technology research and application, with its latest model DeepSeek-V2.5 integrating general dialogue and code processing capabilities, achieving significant improvements in human preference alignment, writing tasks, and instruction following.
- **[PPIO](https://lobechat.com/discover/provider/ppio)**: PPIO supports stable and cost-efficient open-source LLM APIs, such as DeepSeek, Llama, Qwen etc.
- **[HuggingFace](https://lobechat.com/discover/provider/huggingface)**: The HuggingFace Inference API provides a fast and free way for you to explore thousands of models for various tasks. Whether you are prototyping for a new application or experimenting with the capabilities of machine learning, this API gives you instant access to high-performance models across multiple domains.
- **[OpenRouter](https://lobechat.com/discover/provider/openrouter)**: OpenRouter is a service platform providing access to various cutting-edge large model interfaces, supporting OpenAI, Anthropic, LLaMA, and more, suitable for diverse development and application needs. Users can flexibly choose the optimal model and pricing based on their requirements, enhancing the AI experience.
- **[Cloudflare Workers AI](https://lobechat.com/discover/provider/cloudflare)**: Run serverless GPU-powered machine learning models on Cloudflare's global network.
See more providers (+30)
- **[GitHub](https://lobechat.com/discover/provider/github)**: With GitHub Models, developers can become AI engineers and leverage the industry's leading AI models.
- **[Novita](https://lobechat.com/discover/provider/novita)**: Novita AI is a platform providing a variety of large language models and AI image generation API services, flexible, reliable, and cost-effective. It supports the latest open-source models like Llama3 and Mistral, offering a comprehensive, user-friendly, and auto-scaling API solution for generative AI application development, suitable for the rapid growth of AI startups.
- **[PPIO](https://lobechat.com/discover/provider/ppio)**: PPIO supports stable and cost-efficient open-source LLM APIs, such as DeepSeek, Llama, Qwen etc.
- **[Together AI](https://lobechat.com/discover/provider/togetherai)**: Together AI is dedicated to achieving leading performance through innovative AI models, offering extensive customization capabilities, including rapid scaling support and intuitive deployment processes to meet various enterprise needs.
- **[Fireworks AI](https://lobechat.com/discover/provider/fireworksai)**: Fireworks AI is a leading provider of advanced language model services, focusing on functional calling and multimodal processing. Its latest model, Firefunction V2, is based on Llama-3, optimized for function calling, conversation, and instruction following. The visual language model FireLLaVA-13B supports mixed input of images and text. Other notable models include the Llama series and Mixtral series, providing efficient multilingual instruction following and generation support.
- **[Groq](https://lobechat.com/discover/provider/groq)**: Groq's LPU inference engine has excelled in the latest independent large language model (LLM) benchmarks, redefining the standards for AI solutions with its remarkable speed and efficiency. Groq represents instant inference speed, demonstrating strong performance in cloud-based deployments.
- **[Perplexity](https://lobechat.com/discover/provider/perplexity)**: Perplexity is a leading provider of conversational generation models, offering various advanced Llama 3.1 models that support both online and offline applications, particularly suited for complex natural language processing tasks.
- **[Mistral](https://lobechat.com/discover/provider/mistral)**: Mistral provides advanced general, specialized, and research models widely used in complex reasoning, multilingual tasks, and code generation. Through functional calling interfaces, users can integrate custom functionalities for specific applications.
- **[Ai21Labs](https://lobechat.com/discover/provider/ai21)**: AI21 Labs builds foundational models and AI systems for enterprises, accelerating the application of generative AI in production.
- **[Upstage](https://lobechat.com/discover/provider/upstage)**: Upstage focuses on developing AI models for various business needs, including Solar LLM and document AI, aiming to achieve artificial general intelligence (AGI) for work. It allows for the creation of simple conversational agents through Chat API and supports functional calling, translation, embedding, and domain-specific applications.
- **[xAI](https://lobechat.com/discover/provider/xai)**: xAI is a company dedicated to building artificial intelligence to accelerate human scientific discovery. Our mission is to advance our collective understanding of the universe.
- **[Qwen](https://lobechat.com/discover/provider/qwen)**: Tongyi Qianwen is a large-scale language model independently developed by Alibaba Cloud, featuring strong natural language understanding and generation capabilities. It can answer various questions, create written content, express opinions, and write code, playing a role in multiple fields.
- **[Wenxin](https://lobechat.com/discover/provider/wenxin)**: An enterprise-level one-stop platform for large model and AI-native application development and services, providing the most comprehensive and user-friendly toolchain for the entire process of generative artificial intelligence model development and application development.
- **[Hunyuan](https://lobechat.com/discover/provider/hunyuan)**: A large language model developed by Tencent, equipped with powerful Chinese creative capabilities, logical reasoning abilities in complex contexts, and reliable task execution skills.
- **[ZhiPu](https://lobechat.com/discover/provider/zhipu)**: Zhipu AI offers an open platform for multimodal and language models, supporting a wide range of AI application scenarios, including text processing, image understanding, and programming assistance.
- **[SiliconCloud](https://lobechat.com/discover/provider/siliconcloud)**: SiliconFlow is dedicated to accelerating AGI for the benefit of humanity, enhancing large-scale AI efficiency through an easy-to-use and cost-effective GenAI stack.
- **[01.AI](https://lobechat.com/discover/provider/zeroone)**: 01.AI focuses on AI 2.0 era technologies, vigorously promoting the innovation and application of 'human + artificial intelligence', using powerful models and advanced AI technologies to enhance human productivity and achieve technological empowerment.
- **[Spark](https://lobechat.com/discover/provider/spark)**: iFlytek's Spark model provides powerful AI capabilities across multiple domains and languages, utilizing advanced natural language processing technology to build innovative applications suitable for smart hardware, smart healthcare, smart finance, and other vertical scenarios.
- **[SenseNova](https://lobechat.com/discover/provider/sensenova)**: SenseNova, backed by SenseTime's robust infrastructure, offers efficient and user-friendly full-stack large model services.
- **[Stepfun](https://lobechat.com/discover/provider/stepfun)**: StepFun's large model possesses industry-leading multimodal and complex reasoning capabilities, supporting ultra-long text understanding and powerful autonomous scheduling search engine functions.
- **[Moonshot](https://lobechat.com/discover/provider/moonshot)**: Moonshot is an open-source platform launched by Beijing Dark Side Technology Co., Ltd., providing various natural language processing models with a wide range of applications, including but not limited to content creation, academic research, intelligent recommendations, and medical diagnosis, supporting long text processing and complex generation tasks.
- **[Baichuan](https://lobechat.com/discover/provider/baichuan)**: Baichuan Intelligence is a company focused on the research and development of large AI models, with its models excelling in domestic knowledge encyclopedias, long text processing, and generative creation tasks in Chinese, surpassing mainstream foreign models. Baichuan Intelligence also possesses industry-leading multimodal capabilities, performing excellently in multiple authoritative evaluations. Its models include Baichuan 4, Baichuan 3 Turbo, and Baichuan 3 Turbo 128k, each optimized for different application scenarios, providing cost-effective solutions.
- **[Minimax](https://lobechat.com/discover/provider/minimax)**: MiniMax is a general artificial intelligence technology company established in 2021, dedicated to co-creating intelligence with users. MiniMax has independently developed general large models of different modalities, including trillion-parameter MoE text models, voice models, and image models, and has launched applications such as Conch AI.
- **[InternLM](https://lobechat.com/discover/provider/internlm)**: An open-source organization dedicated to the research and development of large model toolchains. It provides an efficient and user-friendly open-source platform for all AI developers, making cutting-edge large models and algorithm technologies easily accessible.
- **[Higress](https://lobechat.com/discover/provider/higress)**: Higress is a cloud-native API gateway that was developed internally at Alibaba to address the issues of Tengine reload affecting long-lived connections and the insufficient load balancing capabilities for gRPC/Dubbo.
- **[Gitee AI](https://lobechat.com/discover/provider/giteeai)**: Gitee AI's Serverless API provides AI developers with an out of the box large model inference API service.
- **[Taichu](https://lobechat.com/discover/provider/taichu)**: The Institute of Automation, Chinese Academy of Sciences, and Wuhan Artificial Intelligence Research Institute have launched a new generation of multimodal large models, supporting comprehensive question-answering tasks such as multi-turn Q&A, text creation, image generation, 3D understanding, and signal analysis, with stronger cognitive, understanding, and creative abilities, providing a new interactive experience.
- **[360 AI](https://lobechat.com/discover/provider/ai360)**: 360 AI is an AI model and service platform launched by 360 Company, offering various advanced natural language processing models, including 360GPT2 Pro, 360GPT Pro, 360GPT Turbo, and 360GPT Turbo Responsibility 8K. These models combine large-scale parameters and multimodal capabilities, widely applied in text generation, semantic understanding, dialogue systems, and code generation. With flexible pricing strategies, 360 AI meets diverse user needs, supports developer integration, and promotes the innovation and development of intelligent applications.
- **[Search1API](https://lobechat.com/discover/provider/search1api)**: Search1API provides access to the DeepSeek series of models that can connect to the internet as needed, including standard and fast versions, supporting a variety of model sizes.
- **[InfiniAI](https://lobechat.com/discover/provider/infiniai)**: Provides high-performance, easy-to-use, and secure large model services for application developers, covering the entire process from large model development to service deployment.

> 📊 Total providers: [**40**](https://lobechat.com/discover/providers)

At the same time, we are also planning to support more model service providers. If you would like LobeChat to support your favorite service provider, feel free to join our [💬 community discussion](https://github.com/lobehub/lobe-chat/discussions/1284).

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411257887-1239da50-d832-4632-a7ef-bd754c0f3850.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTc4ODctMTIzOWRhNTAtZDgzMi00NjMyLWE3ZWYtYmQ3NTRjMGYzODUwLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWU3ZjM1MmU2NGE1ZjFjM2MzOTdjMzU4NGY1YzY5MzhhOWVlN2FmODJiMDE3MjVkNWIwZTVjOTYzNDBhZmE0MzkmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.ymWE54U99RC-ynwbZLr11JLaIb4FX6fYnmWHCKB6_j0)](https://lobehub.com/docs/usage/features/local-llm)

### `6` [Local Large Language Model (LLM) Support](https://lobehub.com/docs/usage/features/local-llm)To meet the specific needs of users, LobeChat also supports the use of local models based on [Ollama](https://ollama.ai/), allowing users to flexibly use their own or third-party models.

> [!TIP]
> Learn more about 📘 Using Ollama in LobeChat by checking it out.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/17870709/413550908-18574a1f-46c2-4cbc-af2c-35a86e128a07.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8xNzg3MDcwOS80MTM1NTA5MDgtMTg1NzRhMWYtNDZjMi00Y2JjLWFmMmMtMzVhODZlMTI4YTA3LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTExNWE2MjgxNzJlYjJlMGZhOWY5YjU3NWQwNGRkZTE1NWM5N2I3NWRmMWRmZjBkM2I3NzY1ZGI2ZDMzNjE4NzcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.RFp__D6-wkbplf-YHUaHA3-1EZWI5WQe73RGwp5pvWU)](https://lobehub.com/docs/usage/features/vision)

### `7` [Model Visual Recognition](https://lobehub.com/docs/usage/features/vision)LobeChat now supports OpenAI's latest [`gpt-4-vision`](https://platform.openai.com/docs/guides/vision) model with visual recognition capabilities, a multimodal intelligence that can perceive visuals. Users can easily upload or drag and drop images into the dialogue box, and the agent will be able to recognize the content of the images and engage in intelligent conversation based on this, creating smarter and more diversified chat scenarios.

This feature opens up new interactive methods, allowing communication to transcend text and include a wealth of visual elements. Whether it's sharing images in daily use or interpreting images within specific industries, the agent provides an outstanding conversational experience.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411259401-50189597-2cc3-4002-b4c8-756a52ad5c0a.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTk0MDEtNTAxODk1OTctMmNjMy00MDAyLWI0YzgtNzU2YTUyYWQ1YzBhLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWI2NmQ5YzgyYjcxYzk1Nzg2NzMzN2JjY2FhZGQyMTExZDYwNzk4YWRkMjg4OTA1MmY1NTlkNzI3YTQ3YjlmYTgmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.NFVFdxJKlKwz46txrpQP8kaRdnD53vl7OcEoUIvRFu0)](https://lobehub.com/docs/usage/features/tts)

### `8` [TTS & STT Voice Conversation](https://lobehub.com/docs/usage/features/tts)LobeChat supports Text-to-Speech (TTS) and Speech-to-Text (STT) technologies, enabling our application to convert text messages into clear voice outputs, allowing users to interact with our conversational agent as if they were talking to a real person. Users can choose from a variety of voices to pair with the agent.

Moreover, TTS offers an excellent solution for those who prefer auditory learning or desire to receive information while busy. In LobeChat, we have meticulously selected a range of high-quality voice options (OpenAI Audio, Microsoft Edge Speech) to meet the needs of users from different regions and cultural backgrounds. Users can choose the voice that suits their personal preferences or specific scenarios, resulting in a personalized communication experience.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411259372-708274a7-2458-494b-a6ec-b73dfa1fa7c2.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTkzNzItNzA4Mjc0YTctMjQ1OC00OTRiLWE2ZWMtYjczZGZhMWZhN2MyLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWUwYWQ1MTIwYzRhNjFkMDJkZmMwNGE0YTg5MDhmMDcyYTlkYTJjZDY0MzEyZGRhZWY3ZjNkNzk2Mjc2YTY1Y2MmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.vRHp1mXI8w9dS3j84holvQ2veF0Ps-J2ebpAp-qzTiw)](https://lobehub.com/docs/usage/features/text-to-image)

### `9` [Text to Image Generation](https://lobehub.com/docs/usage/features/text-to-image)With support for the latest text-to-image generation technology, LobeChat now allows users to invoke image creation tools directly within conversations with the agent. By leveraging the capabilities of AI tools such as [`DALL-E 3`](https://openai.com/dall-e-3), [`MidJourney`](https://www.midjourney.com/), and [`Pollinations`](https://pollinations.ai/), the agents are now equipped to transform your ideas into images.

This enables a more private and immersive creative process, allowing for the seamless integration of visual storytelling into your personal dialogue with the agent.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411257826-66a891ac-01b6-4e3f-b978-2eb07b489b1b.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTc4MjYtNjZhODkxYWMtMDFiNi00ZTNmLWI5NzgtMmViMDdiNDg5YjFiLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWVlZjE0YjY3ODg4ZTQ4MmI4Y2EzNmMwMWU1MjIzZmZhNDAxNmNkOGViZDVhMTY1ZDRiZDIyNWVhZDU0MGI2ZDYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.ujq-ADif4XKslJAQOudYMvaXRZ_I1HQ5-u7o9Kz2rhQ)](https://lobehub.com/docs/usage/features/plugin-system)

### `10` [Plugin System (Function Calling)](https://lobehub.com/docs/usage/features/plugin-system)The plugin ecosystem of LobeChat is an important extension of its core functionality, greatly enhancing the practicality and flexibility of the LobeChat assistant.

Plugin-Demo.mp4<video src="https://github.com/lobehub/lobe-chat/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2" data-canonical-src="https://github.com/lobehub/lobe-chat/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2" controls="controls" muted="muted" class="d-block rounded-bottom-2 border-top width-fit" style="max-height:640px; min-height: 200px"></video>

By utilizing plugins, LobeChat assistants can obtain and process real-time information, such as searching for web information and providing users with instant and relevant news.

In addition, these plugins are not limited to news aggregation, but can also extend to other practical functions, such as quickly searching documents, generating images, obtaining data from various platforms like Bilibili, Steam, and interacting with various third-party services.

> [!TIP]
> Learn more about 📘 Plugin Usage by checking it out.

| Recent Submits | Description |
| --- | --- |
| [PortfolioMeta](https://lobechat.com/discover/plugin/StockData)   <sup>By <strong>portfoliometa</strong> on <strong>2025-03-23</strong></sup> | Analyze stocks and get comprehensive real-time investment data and analytics.   `stock` |
| [Web](https://lobechat.com/discover/plugin/web)   <sup>By <strong>Proghit</strong> on <strong>2025-01-24</strong></sup> | Smart web search that reads and analyzes pages to deliver comprehensive answers from Google results.   `web` `search` |
| [MintbaseSearch](https://lobechat.com/discover/plugin/mintbasesearch)   <sup>By <strong>mintbase</strong> on <strong>2024-12-31</strong></sup> | Find any NFT data on the NEAR Protocol.   `crypto` `nft` |
| [Bing\_websearch](https://lobechat.com/discover/plugin/Bingsearch-identifier)   <sup>By <strong>FineHow</strong> on <strong>2024-12-22</strong></sup> | Search for information from the internet base BingApi   `bingsearch` |

> 📊 Total plugins: [**45**](https://lobechat.com/discover/plugins)

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/17870709/413551032-b3ab6e35-4fbc-468d-af10-e3e0c687350f.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8xNzg3MDcwOS80MTM1NTEwMzItYjNhYjZlMzUtNGZiYy00NjhkLWFmMTAtZTNlMGM2ODczNTBmLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTljMGNlMmI1YTM0MGNiNDk3Zjk3NGJlZmZkNDI0ZjdiMDE3M2YyOTQwYjEwNDMxMTI0NTU3NjlkYzQxNTcwZTImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.buiubWAPLR5f6XZhUOB4Dv4r2463KD1nlQQtJRaPc5o)](https://lobehub.com/docs/usage/features/agent-market)

### `11` [Agent Market (GPTs)](https://lobehub.com/docs/usage/features/agent-market)In LobeChat Agent Marketplace, creators can discover a vibrant and innovative community that brings together a multitude of well-designed agents, which not only play an important role in work scenarios but also offer great convenience in learning processes. Our marketplace is not just a showcase platform but also a collaborative space. Here, everyone can contribute their wisdom and share the agents they have developed.

> [!TIP]
> By 🤖/🏪 Submit Agents, you can easily submit your agent creations to our platform. Importantly, LobeChat has established a sophisticated automated internationalization (i18n) workflow, capable of seamlessly translating your agent into multiple language versions. This means that no matter what language your users speak, they can experience your agent without barriers.
> [!IMPORTANT]
> We welcome all users to join this growing ecosystem and participate in the iteration and optimization of agents. Together, we can create more interesting, practical, and innovative agents, further enriching the diversity and practicality of the agent offerings.

| Recent Submits | Description |
| --- | --- |
| [学术论文综述专家](https://lobechat.com/discover/assistant/academic-paper-overview)   <sup>By <strong><a href="https://github.com/arvinxx">arvinxx</a></strong> on <strong>2025-03-11</strong></sup> | 擅长高质量文献检索与分析的学术研究助手   `学术研究` `文献检索` `数据分析` `信息提取` `咨询` |
| [Cron Expression Assistant](https://lobechat.com/discover/assistant/crontab-generate)   <sup>By <strong><a href="https://github.com/edgesider">edgesider</a></strong> on <strong>2025-02-17</strong></sup> | Crontab Expression Generator   `crontab` `time-expression` `trigger-time` `generator` `technical-assistance` |
| [Xiao Zhi French Translation Assistant](https://lobechat.com/discover/assistant/xiao-zhi-french-translation-asst-v-1)   <sup>By <strong><a href="https://github.com/WeR-Best">WeR-Best</a></strong> on <strong>2025-02-10</strong></sup> | A friendly, professional, and empathetic AI assistant for French translation   `ai-assistant` `french-translation` `cross-cultural-communication` `creativity` |
| [Investment Assistant](https://lobechat.com/discover/assistant/graham-investmentassi)   <sup>By <strong><a href="https://github.com/farsightlin">farsightlin</a></strong> on <strong>2025-02-06</strong></sup> | Helps users calculate the data needed for valuation   `investment` `valuation` `financial-analysis` `calculator` |

> 📊 Total agents: [**488**](https://lobechat.com/discover/assistants)

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411259251-f1697c8b-d1fb-4dac-ba05-153c6295d91d.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTkyNTEtZjE2OTdjOGItZDFmYi00ZGFjLWJhMDUtMTUzYzYyOTVkOTFkLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWI1NDBmMWM2NjhiMjQ1MjRkNDg3NGI0YTYyZDE4MDg2YWUzMDZiOTJlNmQ1NTlmMDdhNWFmN2VhNDE3MDI4OWUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.ppEOqG7__YkmnG2BBY7YHSs9C-bKCrJeNtwAi7lVrY8)](https://lobehub.com/docs/usage/features/database)

### `12` [Support Local / Remote Database](https://lobehub.com/docs/usage/features/database)LobeChat supports the use of both server-side and local databases. Depending on your needs, you can choose the appropriate deployment solution:

- **Local database**: suitable for users who want more control over their data and privacy protection. LobeChat uses CRDT (Conflict-Free Replicated Data Type) technology to achieve multi-device synchronization. This is an experimental feature aimed at providing a seamless data synchronization experience.
- **Server-side database**: suitable for users who want a more convenient user experience. LobeChat supports PostgreSQL as a server-side database. For detailed documentation on how to configure the server-side database, please visit [Configure Server-side Database](https://lobehub.com/docs/self-hosting/advanced/server-database).

Regardless of which database you choose, LobeChat can provide you with an excellent user experience.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411257957-80bb232e-19d1-4f97-98d6-e291f3585e6d.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTc5NTctODBiYjIzMmUtMTlkMS00Zjk3LTk4ZDYtZTI5MWYzNTg1ZTZkLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTlmNTE5ZGNjYzE0Mjg5ZThhN2M2MjJiMjJlMGM3MTMyNWE5NzhmMjcxNTFhYTZjMmE5YTUwMjljMzM1YTIyN2YmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.goWMm2-GKPKKbkW7f_vfnWxtDG-Eqfe4Hi87baXcqt8)](https://lobehub.com/docs/usage/features/auth)

### `13` [Support Multi-User Management](https://lobehub.com/docs/usage/features/auth)LobeChat supports multi-user management and provides two main user authentication and management solutions to meet different needs:

- **next-auth**: LobeChat integrates `next-auth`, a flexible and powerful identity verification library that supports multiple authentication methods, including OAuth, email login, credential login, etc. With `next-auth`, you can easily implement user registration, login, session management, social login, and other functions to ensure the security and privacy of user data.
- [**Clerk**](https://go.clerk.com/exgqLG0): For users who need more advanced user management features, LobeChat also supports `Clerk`, a modern user management platform. `Clerk` provides richer functions, such as multi-factor authentication (MFA), user profile management, login activity monitoring, etc. With `Clerk`, you can get higher security and flexibility, and easily cope with complex user management needs.

Regardless of which user management solution you choose, LobeChat can provide you with an excellent user experience and powerful functional support.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411259329-9647f70f-b71b-43b6-9564-7cdd12d1c24d.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTkzMjktOTY0N2Y3MGYtYjcxYi00M2I2LTk1NjQtN2NkZDEyZDFjMjRkLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTJmOWM0MGRjNTMzNDU0OTI1NzVmYzk2ZTQzMjc5OWNhODM4MDlmZTA4OWMwNTc2MzIyNzQxZTNhNjE5ZTI1OTQmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.H66f7MWP31meBvRLa57cNzdfUm2D0ZZdfm51cvoaEGM)](https://lobehub.com/docs/usage/features/pwa)

### `14` [Progressive Web App (PWA)](https://lobehub.com/docs/usage/features/pwa)We deeply understand the importance of providing a seamless experience for users in today's multi-device environment. Therefore, we have adopted Progressive Web Application ([PWA](https://support.google.com/chrome/answer/9658361)) technology, a modern web technology that elevates web applications to an experience close to that of native apps.

Through PWA, LobeChat can offer a highly optimized user experience on both desktop and mobile devices while maintaining its lightweight and high-performance characteristics. Visually and in terms of feel, we have also meticulously designed the interface to ensure it is indistinguishable from native apps, providing smooth animations, responsive layouts, and adapting to different device screen resolutions.

> [!NOTE]
> If you are unfamiliar with the installation process of PWA, you can add LobeChat as your desktop application (also applicable to mobile devices) by following these steps:

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411257845-32cf43c4-96bd-4a4c-bfb6-59acde6fe380.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTc4NDUtMzJjZjQzYzQtOTZiZC00YTRjLWJmYjYtNTlhY2RlNmZlMzgwLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWM3MWM2ZjcxMWU0ZTQ4NWI5NzM5ZWM2Yzk0NzJlODg2MDk0Yjk4YzZhNmFmNjk3ZTU5YmE4ZDcyYWUwOGMwYTYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.2w_hVRwC7_4KbNLb6D_GgKRyKSvm-RKuevWcB5moJBQ)](https://lobehub.com/docs/usage/features/mobile)

### `15` [Mobile Device Adaptation](https://lobehub.com/docs/usage/features/mobile)We have carried out a series of optimization designs for mobile devices to enhance the user's mobile experience. Currently, we are iterating on the mobile user experience to achieve smoother and more intuitive interactions. If you have any suggestions or ideas, we welcome you to provide feedback through GitHub Issues or Pull Requests.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

[![](https://private-user-images.githubusercontent.com/34400653/411259389-b47c39f1-806f-492b-8fcb-b0fa973937c1.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYyMzUwNzAsIm5iZiI6MTc0NjIzNDc3MCwicGF0aCI6Ii8zNDQwMDY1My80MTEyNTkzODktYjQ3YzM5ZjEtODA2Zi00OTJiLThmY2ItYjBmYTk3MzkzN2MxLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAzVDAxMTI1MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTA1OWYwMDVmMTk0MTIwNjNiNjRmMWU5ODMwOTA2YzI4ZTEzNGViYWMzNjNlNWJkNWQ4Mzk1OGFlNDIzNjhmYmMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.IeLbGG5eRHYBwzlBYQD9nUX_uCDe5n8MaXcNLzAK2fM)](https://lobehub.com/docs/usage/features/theme)

### `16` [Custom Themes](https://lobehub.com/docs/usage/features/theme)As a design-engineering-oriented application, LobeChat places great emphasis on users' personalized experiences, hence introducing flexible and diverse theme modes, including a light mode for daytime and a dark mode for nighttime. Beyond switching theme modes, a range of color customization options allow users to adjust the application's theme colors according to their preferences. Whether it's a desire for a sober dark blue, a lively peach pink, or a professional gray-white, users can find their style of color choices in LobeChat.

> [!TIP]
> The default configuration can intelligently recognize the user's system color mode and automatically switch themes to ensure a consistent visual experience with the operating system. For users who like to manually control details, LobeChat also offers intuitive setting options and a choice between chat bubble mode and document mode for conversation scenarios.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

### `*` What's moreBeside these features, LobeChat also have much better basic technique underground:

- [x] 💨 **Quick Deployment**: Using the Vercel platform or docker image, you can deploy with just one click and complete the process within 1 minute without any complex configuration.
- [x] 🌐 **Custom Domain**: If users have their own domain, they can bind it to the platform for quick access to the dialogue agent from anywhere.
- [x] 🔒 **Privacy Protection**: All data is stored locally in the user's browser, ensuring user privacy.
- [x] 💎 **Exquisite UI Design**: With a carefully designed interface, it offers an elegant appearance and smooth interaction. It supports light and dark themes and is mobile-friendly. PWA support provides a more native-like experience.
- [x] 🗣️ **Smooth Conversation Experience**: Fluid responses ensure a smooth conversation experience. It fully supports Markdown rendering, including code highlighting, LaTex formulas, Mermaid flowcharts, and more.

> ✨ more features will be added when LobeChat evolve.

---

> [!NOTE]
> You can find our upcoming Roadmap plans in the Projects section.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

## ⚡️ Performance> [!NOTE]
> The complete list of reports can be found in the 📘 Lighthouse Reports

| Desktop | Mobile |
| --- | --- |
| [![](https://raw.githubusercontent.com/lobehub/lobe-chat/lighthouse/lighthouse/chat/desktop/pagespeed.svg)](https://raw.githubusercontent.com/lobehub/lobe-chat/lighthouse/lighthouse/chat/desktop/pagespeed.svg) | [![](https://raw.githubusercontent.com/lobehub/lobe-chat/lighthouse/lighthouse/chat/mobile/pagespeed.svg)](https://raw.githubusercontent.com/lobehub/lobe-chat/lighthouse/lighthouse/chat/mobile/pagespeed.svg) |
| [📑 Lighthouse Report](https://lobehub.github.io/lobe-chat/lighthouse/chat/desktop/chat_preview_lobehub_com_chat.html) | [📑 Lighthouse Report](https://lobehub.github.io/lobe-chat/lighthouse/chat/mobile/chat_preview_lobehub_com_chat.html) |

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

## 🛳 Self HostingLobeChat provides Self-Hosted Version with Vercel, Alibaba Cloud, and [Docker Image](https://hub.docker.com/r/lobehub/lobe-chat-database). This allows you to deploy your own chatbot within a few minutes without any prior knowledge.

> [!TIP]
> Learn more about 📘 Build your own LobeChat by checking it out.

### `A` Deploying with Vercel, Zeabur , Sealos or Alibaba Cloud"If you want to deploy this service yourself on Vercel, Zeabur or Alibaba Cloud, you can follow these steps:

- Prepare your [OpenAI API Key](https://platform.openai.com/account/api-keys).
- Click the button below to start deployment: Log in directly with your GitHub account, and remember to fill in the `OPENAI_API_KEY`(required) and `ACCESS_CODE` (recommended) on the environment variable section.
- After deployment, you can start using it.
- Bind a custom domain (optional): The DNS of the domain assigned by Vercel is polluted in some areas; binding a custom domain can connect directly.

| Deploy with Vercel | Deploy with Zeabur | Deploy with Sealos | Deploy with RepoCloud | Deploy with Alibaba Cloud |
| --- | --- | --- | --- | --- |
| [![](https://camo.githubusercontent.com/20bea215d35a4e28f2c92ea5b657d006b087687486858a40de2922a4636301ab/68747470733a2f2f76657263656c2e636f6d2f627574746f6e)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat&env=OPENAI_API_KEY,ACCESS_CODE&envDescription=Find%20your%20OpenAI%20API%20Key%20by%20click%20the%20right%20Learn%20More%20button.%20%7C%20Access%20Code%20can%20protect%20your%20website&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys&project-name=lobe-chat&repository-name=lobe-chat) | [![](https://camo.githubusercontent.com/34df6b95f619465d16570ca8dd4d5a2aae99f4211d5de6d77bda8cfe5eba10f5/68747470733a2f2f7a65616275722e636f6d2f627574746f6e2e737667)](https://zeabur.com/templates/VZGGTI) | [![](https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg)](https://template.usw.sealos.io/deploy?templateName=lobe-chat-db) | [![](https://camo.githubusercontent.com/ac294f4b769f6436dadb17205434b234b32e4d88831f182c522fd36b4534a7a3/68747470733a2f2f64313674307063343834367835322e636c6f756466726f6e742e6e65742f6465706c6f796c6f62652e737667)](https://repocloud.io/details/?app_id=248) | [![](https://camo.githubusercontent.com/f077dbcfb27b0b9489cdca792fdaea43a24e97fe24e28a14dda3cf8ee798efa1/68747470733a2f2f736572766963652d696e666f2d7075626c69632e6f73732d636e2d68616e677a686f752e616c6979756e63732e636f6d2f636f6d707574656e6573742d656e2e737667)](https://computenest.console.aliyun.com/service/instance/create/default?type=user&ServiceName=LobeChat%E7%A4%BE%E5%8C%BA%E7%89%88) |

#### After ForkAfter fork, only retain the upstream sync action and disable other actions in your repository on GitHub.

#### Keep UpdatedIf you have deployed your own project following the one-click deployment steps in the README, you might encounter constant prompts indicating "updates available." This is because Vercel defaults to creating a new project instead of forking this one, resulting in an inability to detect updates accurately.

> [!TIP]
> We suggest you redeploy using the following steps, 📘 Auto Sync With Latest
  

### `B` Deploying with Docker[![](https://camo.githubusercontent.com/01bc098d592aba12bbc7cb3a1535d55f958398b344486b97a6e0a947ee1ec46a/68747470733a2f2f696d672e736869656c64732e696f2f646f636b65722f762f6c6f62656875622f6c6f62652d636861742d64617461626173653f636f6c6f723d333639656666266c6162656c3d646f636b6572266c6162656c436f6c6f723d626c61636b266c6f676f3d646f636b6572266c6f676f436f6c6f723d7768697465267374796c653d666c61742d73717561726526736f72743d73656d766572)](https://hub.docker.com/r/lobehub/lobe-chat-database) [![](https://camo.githubusercontent.com/23f9282b87d05e6f8b031dd245c271dfeb8af60fc0ace46150bd19f39f67f4bd/68747470733a2f2f696d672e736869656c64732e696f2f646f636b65722f696d6167652d73697a652f6c6f62656875622f6c6f62652d636861742d64617461626173653f636f6c6f723d333639656666266c6162656c436f6c6f723d626c61636b267374796c653d666c61742d73717561726526736f72743d73656d766572)](https://hub.docker.com/r/lobehub/lobe-chat-database) [![](https://camo.githubusercontent.com/1e19818722a05cd96e8039a6ad818076cfff4f1b0fb2eb2f128a0af0e342d230/68747470733a2f2f696d672e736869656c64732e696f2f646f636b65722f70756c6c732f6c6f62656875622f6c6f62652d636861743f636f6c6f723d343563633131266c6162656c436f6c6f723d626c61636b267374796c653d666c61742d73717561726526736f72743d73656d766572)](https://hub.docker.com/r/lobehub/lobe-chat-database)

We provide a Docker image for deploying the LobeChat service on your own private device. Use the following command to start the LobeChat service:

1. create a folder to for storage files

$ mkdir lobe-chat-db && cd lobe-chat-db

2. init the LobeChat infrastructure

bash <(curl \-fsSL https://lobe.li/setup.sh)

3. Start the LobeChat service

docker compose up \-d

> [!NOTE]
> For detailed instructions on deploying with Docker, please refer to the 📘 Docker Deployment Guide
  

### Environment VariableThis project provides some additional configuration items set with environment variables:

| Environment Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Yes | This is the API key you apply on the OpenAI account page | `sk-xxxxxx...xxxxxx` |
| `OPENAI_PROXY_URL` | No | If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL | `https://api.chatanywhere.cn` or `https://aihubmix.com/v1`   The default value is   `https://api.openai.com/v1` |
| `ACCESS_CODE` | No | Add a password to access this service; you can set a long password to avoid leaking. If this value contains a comma, it is a password array. | `awCTe)re_r74` or `rtrt_ewee3@09!` or `code1,code2,code3` |
| `OPENAI_MODEL_LIST` | No | Used to control the model list. Use `+` to add a model, `-` to hide a model, and `model_name=display_name` to customize the display name of a model, separated by commas. | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo` |

> [!NOTE]
> The complete list of environment variables can be found in the 📘 Environment Variables

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

## 📦 Ecosystem| NPM | Repository | Description | Version |
| --- | --- | --- | --- |
| [@lobehub/ui](https://www.npmjs.com/package/@lobehub/ui) | [lobehub/lobe-ui](https://github.com/lobehub/lobe-ui) | Open-source UI component library dedicated to building AIGC web applications. | [![](https://camo.githubusercontent.com/d3752fc6b3f083aee7c9cfd57b040fdedf28b58f28482d6d1fc349ac4079ea78/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f406c6f62656875622f75693f636f6c6f723d333639656666266c6162656c436f6c6f723d626c61636b266c6f676f3d6e706d266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://www.npmjs.com/package/@lobehub/ui) |
| [@lobehub/icons](https://www.npmjs.com/package/@lobehub/icons) | [lobehub/lobe-icons](https://github.com/lobehub/lobe-icons) | Popular AI / LLM Model Brand SVG Logo and Icon Collection. | [![](https://camo.githubusercontent.com/95a0bb11337cd2d79a2129c1ba1e0ec5dbbd9571dbddf686e016f8e2d7b11290/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f406c6f62656875622f69636f6e733f636f6c6f723d333639656666266c6162656c436f6c6f723d626c61636b266c6f676f3d6e706d266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://www.npmjs.com/package/@lobehub/icons) |
| [@lobehub/tts](https://www.npmjs.com/package/@lobehub/tts) | [lobehub/lobe-tts](https://github.com/lobehub/lobe-tts) | High-quality & reliable TTS/STT React Hooks library | [![](https://camo.githubusercontent.com/bb3abad180e0fbe0e0846486fb81cc0b1adc9f611584bd4737f47685f51dcafb/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f406c6f62656875622f7474733f636f6c6f723d333639656666266c6162656c436f6c6f723d626c61636b266c6f676f3d6e706d266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://www.npmjs.com/package/@lobehub/tts) |
| [@lobehub/lint](https://www.npmjs.com/package/@lobehub/lint) | [lobehub/lobe-lint](https://github.com/lobehub/lobe-lint) | Configurations for ESlint, Stylelint, Commitlint, Prettier, Remark, and Semantic Release for LobeHub. | [![](https://camo.githubusercontent.com/9053e556143ae82ecce2cbb6e6d5e8e3f7e2df435af88c1d6b90f891f610c62b/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f406c6f62656875622f6c696e743f636f6c6f723d333639656666266c6162656c436f6c6f723d626c61636b266c6f676f3d6e706d266c6f676f436f6c6f723d7768697465267374796c653d666c61742d737175617265)](https://www.npmjs.com/package/@lobehub/lint) |

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

## 🧩 PluginsPlugins provide a means to extend the [Function Calling](https://lobehub.com/blog/openai-function-call) capabilities of LobeChat. They can be used to introduce new function calls and even new ways to render message results. If you are interested in plugin development, please refer to our [📘 Plugin Development Guide](https://lobehub.com/docs/usage/plugins/development) in the Wiki.

- [lobe-chat-plugins](https://github.com/lobehub/lobe-chat-plugins): This is the plugin index for LobeChat. It accesses index.json from this repository to display a list of available plugins for LobeChat to the user.
- [chat-plugin-template](https://github.com/lobehub/chat-plugin-template): This is the plugin template for LobeChat plugin development.
- [@lobehub/chat-plugin-sdk](https://github.com/lobehub/chat-plugin-sdk): The LobeChat Plugin SDK assists you in creating exceptional chat plugins for Lobe Chat.
- [@lobehub/chat-plugins-gateway](https://github.com/lobehub/chat-plugins-gateway): The LobeChat Plugins Gateway is a backend service that provides a gateway for LobeChat plugins. We deploy this service using Vercel. The primary API POST /api/v1/runner is deployed as an Edge Function.
> [!NOTE]
> The plugin system is currently undergoing major development. You can learn more in the following issues:

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

## ⌨️ Local DevelopmentYou can use GitHub Codespaces for online development:

[![](https://github.com/codespaces/badge.svg)](https://codespaces.new/lobehub/lobe-chat)

Or clone it for local development:

$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ pnpm install
$ pnpm dev

If you would like to learn more details, please feel free to look at our [📘 Development Guide](https://github.com/lobehub/lobe-chat/wiki/index).

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

## 🤝 ContributingContributions of all types are more than welcome; if you are interested in contributing code, feel free to check out our GitHub [Issues](https://github.com/lobehub/lobe-chat/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) and [Projects](https://github.com/lobehub/lobe-chat/projects) to get stuck in to show us what you're made of.

> [!TIP]
> We are creating a technology-driven forum, fostering knowledge interaction and the exchange of ideas that may culminate in mutual inspiration and collaborative innovation.

[![](https://camo.githubusercontent.com/a8fbea824f21ba339368a7d06f2e6879f972968bf3c3fb31c09a55717e059497/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2546302539462541342541465f70725f77656c636f6d652d2545322538362539322d6666636234373f6c6162656c436f6c6f723d626c61636b267374796c653d666f722d7468652d6261646765)](https://github.com/lobehub/lobe-chat/pulls?q=sort%3Aupdated-desc+is%3Apr+is%3Aopen) [![](https://camo.githubusercontent.com/a4ceca43534981d4dc7294d166b236d4814dc25eeb85b01b8048f7ec1153d01b/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2546302539462541342539362f2546302539462538462541415f7375626d69745f6167656e742d2545322538362539322d6334663034323f6c6162656c436f6c6f723d626c61636b267374796c653d666f722d7468652d6261646765)](https://github.com/lobehub/lobe-chat-agents) [![](https://camo.githubusercontent.com/005e73654a115e940ce509bac5582eac5224cd4d9aa51f39d4c7b440466c1853/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2546302539462541372541392f2546302539462538462541415f7375626d69745f706c7567696e2d2545322538362539322d3935663364393f6c6162656c436f6c6f723d626c61636b267374796c653d666f722d7468652d6261646765)](https://github.com/lobehub/lobe-chat-plugins)

   [<table><tbody><tr><th colspan="2"><br><a href="https://camo.githubusercontent.com/fad96804762f76d02cb982d218513853449f853cca776acb210e61cf9f9ba718/68747470733a2f2f636f6e747269622e726f636b732f696d6167653f7265706f3d6c6f62656875622f6c6f62652d63686174"><img src="https://camo.githubusercontent.com/fad96804762f76d02cb982d218513853449f853cca776acb210e61cf9f9ba718/68747470733a2f2f636f6e747269622e726f636b732f696d6167653f7265706f3d6c6f62656875622f6c6f62652d63686174" style="max-width: 100%;"></a><br><br></th></tr><tr><td><themed-picture><picture><source> <img src="https://camo.githubusercontent.com/5befdd81b2354d1ec7de736842f28747179990d7ada9e3eaaca7de5f0972be27/68747470733a2f2f6e6578742e6f7373696e73696768742e696f2f776964676574732f6f6666696369616c2f636f6d706f73652d6f72672d6163746976652d636f6e7472696275746f72732f7468756d626e61696c2e706e673f61637469766974793d61637469766526706572696f643d706173745f32385f64617973266f776e65725f69643d313331343730383332267265706f5f6964733d36343334343532333526696d6167655f73697a653d32783326636f6c6f725f736368656d653d6c69676874" style="visibility:visible;max-width:100%;"></picture></themed-picture></td><td rowspan="2"><themed-picture><picture><source> <img src="https://camo.githubusercontent.com/c6a8ae62698a389fb9d234db8d0614084afa2572d645aaaa215b21f3c9978140/68747470733a2f2f6e6578742e6f7373696e73696768742e696f2f776964676574732f6f6666696369616c2f636f6d706f73652d6f72672d7061727469636970616e74732d67726f7774682f7468756d626e61696c2e706e673f61637469766974793d61637469766526706572696f643d706173745f32385f64617973266f776e65725f69643d313331343730383332267265706f5f6964733d36343334343532333526696d6167655f73697a653d34783726636f6c6f725f736368656d653d6c69676874" style="visibility:visible;max-width:100%;"></picture></themed-picture></td></tr><tr><td><themed-picture><picture><source> <img src="https://camo.githubusercontent.com/9f503eda1bfc8e681f2131ac0e09a70fdaaf674937cf20ed642a2172ea466443/68747470733a2f2f6e6578742e6f7373696e73696768742e696f2f776964676574732f6f6666696369616c2f636f6d706f73652d6f72672d6163746976652d636f6e7472696275746f72732f7468756d626e61696c2e706e673f61637469766974793d6e657726706572696f643d706173745f32385f64617973266f776e65725f69643d313331343730383332267265706f5f6964733d36343334343532333526696d6167655f73697a653d32783326636f6c6f725f736368656d653d6c69676874" style="visibility:visible;max-width:100%;"></picture></themed-picture></td></tr></tbody></table>](https://github.com/lobehub/lobe-chat/graphs/contributors)

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

## ❤️ SponsorEvery bit counts and your one-time donation sparkles in our galaxy of support! You're a shooting star, making a swift and bright impact on our journey. Thank you for believing in us – your generosity guides us toward our mission, one brilliant flash at a time.

 [![](https://github.com/lobehub/.github/raw/main/static/sponsor-light.png?raw=true)](https://opencollective.com/lobehub)

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

## 🔗 More Products- **[🅰️ Lobe SD Theme](https://github.com/lobehub/sd-webui-lobe-theme):** Modern theme for Stable Diffusion WebUI, exquisite interface design, highly customizable UI, and efficiency-boosting features.
- **[⛵️ Lobe Midjourney WebUI](https://github.com/lobehub/lobe-midjourney-webui):** WebUI for Midjourney, leverages AI to quickly generate a wide array of rich and diverse images from text prompts, sparking creativity and enhancing conversations.
- **[🌏 Lobe i18n](https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-i18n) :** Lobe i18n is an automation tool for the i18n (internationalization) translation process, powered by ChatGPT. It supports features such as automatic splitting of large files, incremental updates, and customization options for the OpenAI model, API proxy, and temperature.
- **[💌 Lobe Commit](https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-commit):** Lobe Commit is a CLI tool that leverages Langchain/ChatGPT to generate Gitmoji-based commit messages.

[![](https://camo.githubusercontent.com/a57efe5c363b9847d2f2f71ae05a5a6549f49bb4713139ed1a9170123f6f01f0/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d4241434b5f544f5f544f502d3135313531353f7374796c653d666c61742d737175617265)](https://github.com/lobehub/#readme-top)

---

#### 📝 License[![](https://camo.githubusercontent.com/5ab69cd7fb0c90ce499ed1724b18f562c35c09bcff7f2825eff6aa2ddb8dc764/68747470733a2f2f6170702e666f7373612e636f6d2f6170692f70726f6a656374732f6769742532426769746875622e636f6d2532466c6f62656875622532466c6f62652d636861742e7376673f747970653d6c61726765)](https://app.fossa.com/projects/git%2Bgithub.com%2Flobehub%2Flobe-chat)

Copyright © 2025 [LobeHub](https://github.com/lobehub).  
This project is [Apache 2.0](https://github.com/lobehub/lobe-chat/blob/main/LICENSE) licensed.

