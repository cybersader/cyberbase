---
title: "open-webui"
owner: "open-webui"
source: "https://github.com/open-webui/open-webui"
website: "https://openwebui.com"
description: "User-friendly AI Interface (Supports Ollama, OpenAI API, ...) - open-webui/open-webui"
stars: 92960
tags:
  - "clippings"
  - "clippings/github"
  - "ui"
  - "ai"
  - "mcp"
  - "openapi"
  - "self_hosted"
  - "openai"
  - "webui"
  - "rag"
  - "llm"
  - "llms"
  - "ollama"
  - "llm_ui"
  - "ollama_webui"
  - "llm_webui"
  - "open_webui"
  - "ui"
  - "ai"
  - "mcp"
  - "openapi"
  - "self_hosted"
  - "openai"
  - "webui"
  - "rag"
  - "llm"
  - "llms"
  - "ollama"
  - "ollama_webui"
  - "llm_webui"
  - "open_webui"
date created: Saturday, May 3rd 2025, 12:36 pm
---

## README

[![GitHub stars](https://camo.githubusercontent.com/d0dcde215fb5e3874414ae1252679d56c711a4c744260cb72d355e83d5be62d2/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f6f70656e2d77656275692f6f70656e2d77656275693f7374796c653d736f6369616c)](https://camo.githubusercontent.com/d0dcde215fb5e3874414ae1252679d56c711a4c744260cb72d355e83d5be62d2/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f6f70656e2d77656275692f6f70656e2d77656275693f7374796c653d736f6369616c) [![GitHub forks](https://camo.githubusercontent.com/ee1f3889069e3ce7136d8e29a6f82ab3662d443566ec2cfa7eaea76ab6530043/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f666f726b732f6f70656e2d77656275692f6f70656e2d77656275693f7374796c653d736f6369616c)](https://camo.githubusercontent.com/ee1f3889069e3ce7136d8e29a6f82ab3662d443566ec2cfa7eaea76ab6530043/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f666f726b732f6f70656e2d77656275692f6f70656e2d77656275693f7374796c653d736f6369616c) [![GitHub watchers](https://camo.githubusercontent.com/a1e66bba5fe220a30277dee7c84158dae45d27d9ad7a48f528f62b659e0c6eca/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f77617463686572732f6f70656e2d77656275692f6f70656e2d77656275693f7374796c653d736f6369616c)](https://camo.githubusercontent.com/a1e66bba5fe220a30277dee7c84158dae45d27d9ad7a48f528f62b659e0c6eca/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f77617463686572732f6f70656e2d77656275692f6f70656e2d77656275693f7374796c653d736f6369616c) [![GitHub repo size](https://camo.githubusercontent.com/0c14fc4b76ad372b3cdfc1a3b908a69c86dc84a2361c408c38afa48cf461a822/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f7265706f2d73697a652f6f70656e2d77656275692f6f70656e2d7765627569)](https://camo.githubusercontent.com/0c14fc4b76ad372b3cdfc1a3b908a69c86dc84a2361c408c38afa48cf461a822/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f7265706f2d73697a652f6f70656e2d77656275692f6f70656e2d7765627569) [![GitHub language count](https://camo.githubusercontent.com/21185b259c086fb92f4b0359f9f9c5c72c412d7581d5a7e1fd0ac4637ce82b3f/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c616e6775616765732f636f756e742f6f70656e2d77656275692f6f70656e2d7765627569)](https://camo.githubusercontent.com/21185b259c086fb92f4b0359f9f9c5c72c412d7581d5a7e1fd0ac4637ce82b3f/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c616e6775616765732f636f756e742f6f70656e2d77656275692f6f70656e2d7765627569) [![GitHub top language](https://camo.githubusercontent.com/4ca8e2ce89a213ad970dec85312b3834ef53668a794137e9f36e571412981a40/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c616e6775616765732f746f702f6f70656e2d77656275692f6f70656e2d7765627569)](https://camo.githubusercontent.com/4ca8e2ce89a213ad970dec85312b3834ef53668a794137e9f36e571412981a40/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c616e6775616765732f746f702f6f70656e2d77656275692f6f70656e2d7765627569) [![GitHub last commit](https://camo.githubusercontent.com/ba86f04f8e409c4b5059516f46182032a40777ffadafef422aa60a865dc0e766/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c6173742d636f6d6d69742f6f70656e2d77656275692f6f70656e2d77656275693f636f6c6f723d726564)](https://camo.githubusercontent.com/ba86f04f8e409c4b5059516f46182032a40777ffadafef422aa60a865dc0e766/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c6173742d636f6d6d69742f6f70656e2d77656275692f6f70656e2d77656275693f636f6c6f723d726564) [![Hits](https://camo.githubusercontent.com/90eb044e0faea44f6abd7c3266a46d8dc70b654e4d13fff579aef8dd7f3ce15f/68747470733a2f2f686974732e736565796f756661726d2e636f6d2f6170692f636f756e742f696e63722f62616467652e7376673f75726c3d68747470732533412532462532466769746875622e636f6d2532466f6c6c616d612d77656275692532466f6c6c616d612d7762756926636f756e745f62673d253233373943383344267469746c655f62673d2532333535353535352669636f6e3d2669636f6e5f636f6c6f723d253233453745374537267469746c653d6869747326656467655f666c61743d66616c7365)](https://camo.githubusercontent.com/90eb044e0faea44f6abd7c3266a46d8dc70b654e4d13fff579aef8dd7f3ce15f/68747470733a2f2f686974732e736565796f756661726d2e636f6d2f6170692f636f756e742f696e63722f62616467652e7376673f75726c3d68747470732533412532462532466769746875622e636f6d2532466f6c6c616d612d77656275692532466f6c6c616d612d7762756926636f756e745f62673d253233373943383344267469746c655f62673d2532333535353535352669636f6e3d2669636f6e5f636f6c6f723d253233453745374537267469746c653d6869747326656467655f666c61743d66616c7365) [![Discord](https://camo.githubusercontent.com/820b8293648e758a731d95023cd93dfb61a5f32a9f9989845b1a8179a49ab165/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446973636f72642d4f70656e5f57656255492d626c75653f6c6f676f3d646973636f7264266c6f676f436f6c6f723d7768697465)](https://discord.gg/5rJgQTnV4s) [![](https://camo.githubusercontent.com/6d24ad1fc18fa9d263cacee4c5d9aa8e15128bd5f3f3184f6f54d20e6a4ab63b/68747470733a2f2f696d672e736869656c64732e696f2f7374617469632f76313f6c6162656c3d53706f6e736f72266d6573736167653d254532253944254134266c6f676f3d47697448756226636f6c6f723d253233666538653836)](https://github.com/sponsors/tjbck)

**Open WebUI is an [extensible](https://docs.openwebui.com/features/plugin/), feature-rich, and user-friendly self-hosted AI platform designed to operate entirely offline.** It supports various LLM runners like **Ollama** and **OpenAI-compatible APIs**, with **built-in inference engine** for RAG, making it a **powerful AI deployment solution**.

 [![Open WebUI Demo](https://github.com/open-webui/open-webui/raw/main/demo.gif)](https://github.com/open-webui/open-webui/blob/main/demo.gif) [![Open WebUI Demo](https://github.com/open-webui/open-webui/raw/main/demo.gif)

](https://github.com/open-webui/open-webui/blob/main/demo.gif)> [!TIP]
> Looking for an Enterprise Plan? – Speak with Our Sales Team Today!

For more information, be sure to check out our [Open WebUI Documentation](https://docs.openwebui.com/).

## Key Features of Open WebUI ⭐- 🚀 **Effortless Setup**: Install seamlessly using Docker or Kubernetes (kubectl, kustomize or helm) for a hassle-free experience with support for both `:ollama` and `:cuda` tagged images.
- 🤝 **Ollama/OpenAI API Integration**: Effortlessly integrate OpenAI-compatible APIs for versatile conversations alongside Ollama models. Customize the OpenAI API URL to link with **LMStudio, GroqCloud, Mistral, OpenRouter, and more**.
- 🛡️ **Granular Permissions and User Groups**: By allowing administrators to create detailed user roles and permissions, we ensure a secure user environment. This granularity not only enhances security but also allows for customized user experiences, fostering a sense of ownership and responsibility amongst users.
- 📱 **Responsive Design**: Enjoy a seamless experience across Desktop PC, Laptop, and Mobile devices.
- 📱 **Progressive Web App (PWA) for Mobile**: Enjoy a native app-like experience on your mobile device with our PWA, providing offline access on localhost and a seamless user interface.
- ✒️🔢 **Full Markdown and LaTeX Support**: Elevate your LLM experience with comprehensive Markdown and LaTeX capabilities for enriched interaction.
- 🎤📹 **Hands-Free Voice/Video Call**: Experience seamless communication with integrated hands-free voice and video call features, allowing for a more dynamic and interactive chat environment.
- 🛠️ **Model Builder**: Easily create Ollama models via the Web UI. Create and add custom characters/agents, customize chat elements, and import models effortlessly through [Open WebUI Community](https://openwebui.com/) integration.
- 🐍 **Native Python Function Calling Tool**: Enhance your LLMs with built-in code editor support in the tools workspace. Bring Your Own Function (BYOF) by simply adding your pure Python functions, enabling seamless integration with LLMs.
- 📚 **Local RAG Integration**: Dive into the future of chat interactions with groundbreaking Retrieval Augmented Generation (RAG) support. This feature seamlessly integrates document interactions into your chat experience. You can load documents directly into the chat or add files to your document library, effortlessly accessing them using the `#` command before a query.
- 🔍 **Web Search for RAG**: Perform web searches using providers like `SearXNG`, `Google PSE`, `Brave Search`, `serpstack`, `serper`, `Serply`, `DuckDuckGo`, `TavilySearch`, `SearchApi` and `Bing` and inject the results directly into your chat experience.
- 🌐 **Web Browsing Capability**: Seamlessly integrate websites into your chat experience using the `#` command followed by a URL. This feature allows you to incorporate web content directly into your conversations, enhancing the richness and depth of your interactions.
- 🎨 **Image Generation Integration**: Seamlessly incorporate image generation capabilities using options such as AUTOMATIC1111 API or ComfyUI (local), and OpenAI's DALL-E (external), enriching your chat experience with dynamic visual content.
- ⚙️ **Many Models Conversations**: Effortlessly engage with various models simultaneously, harnessing their unique strengths for optimal responses. Enhance your experience by leveraging a diverse set of models in parallel.
- 🔐 **Role-Based Access Control (RBAC)**: Ensure secure access with restricted permissions; only authorized individuals can access your Ollama, and exclusive model creation/pulling rights are reserved for administrators.
- 🌐🌍 **Multilingual Support**: Experience Open WebUI in your preferred language with our internationalization (i18n) support. Join us in expanding our supported languages! We're actively seeking contributors!
- 🧩 **Pipelines, Open WebUI Plugin Support**: Seamlessly integrate custom logic and Python libraries into Open WebUI using [Pipelines Plugin Framework](https://github.com/open-webui/pipelines). Launch your Pipelines instance, set the OpenAI URL to the Pipelines URL, and explore endless possibilities. [Examples](https://github.com/open-webui/pipelines/tree/main/examples) include **Function Calling**, User **Rate Limiting** to control access, **Usage Monitoring** with tools like Langfuse, **Live Translation with LibreTranslate** for multilingual support, **Toxic Message Filtering** and much more.
- 🌟 **Continuous Updates**: We are committed to improving Open WebUI with regular updates, fixes, and new features.

Want to learn more about Open WebUI's features? Check out our [Open WebUI documentation](https://docs.openwebui.com/features) for a comprehensive overview!

## 🔗 Also Check Out Open WebUI Community!Don't forget to explore our sibling project, [Open WebUI Community](https://openwebui.com/), where you can discover, download, and explore customized Modelfiles. Open WebUI Community offers a wide range of exciting possibilities for enhancing your chat interactions with Open WebUI! 🚀

## How to Install 🚀### Installation via Python pip 🐍Open WebUI can be installed using pip, the Python package installer. Before proceeding, ensure you're using **Python 3.11** to avoid compatibility issues.

1. **Install Open WebUI**: Open your terminal and run the following command to install Open WebUI:
	pip install open-webui
2. **Running Open WebUI**: After installation, you can start Open WebUI by executing:
	open-webui serve

This will start the Open WebUI server, which you can access at [http://localhost:8080](http://localhost:8080/)

### Quick Start with Docker 🐳> [!NOTE]
> Please note that for certain Docker environments, additional configurations might be needed. If you encounter any connection issues, our detailed guide on Open WebUI Documentation is ready to assist you.
> [!WARNING]
> When using Docker to install Open WebUI, make sure to include the -v open-webui:/app/backend/data in your Docker command. This step is crucial as it ensures your database is properly mounted and prevents any loss of data.
> [!TIP]
> If you wish to utilize Open WebUI with Ollama included or CUDA acceleration, we recommend utilizing our official images tagged with either :cuda or :ollama. To enable CUDA, you must install the Nvidia CUDA container toolkit on your Linux/WSL system.

### Installation with Default Configuration- **If Ollama is on your computer**, use this command:
	docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
- **If Ollama is on a Different Server**, use this command:
	To connect to Ollama on another server, change the `OLLAMA_BASE_URL` to the server's URL:
	docker run -d -p 3000:8080 -e OLLAMA\_BASE\_URL=https://example.com -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
- **To run Open WebUI with Nvidia GPU support**, use this command:
	docker run -d -p 3000:8080 --gpus all --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:cuda

### Installation for OpenAI API Usage Only- **If you're only using OpenAI API**, use this command:
	docker run -d -p 3000:8080 -e OPENAI\_API\_KEY=your\_secret\_key -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main

### Installing Open WebUI with Bundled Ollama SupportThis installation method uses a single container image that bundles Open WebUI with Ollama, allowing for a streamlined setup via a single command. Choose the appropriate command based on your hardware setup:

- **With GPU Support**: Utilize GPU resources by running the following command:
	docker run -d -p 3000:8080 --gpus=all -v ollama:/root/.ollama -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:ollama
- **For CPU Only**: If you're not using a GPU, use this command instead:
	docker run -d -p 3000:8080 -v ollama:/root/.ollama -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:ollama

Both commands facilitate a built-in, hassle-free installation of both Open WebUI and Ollama, ensuring that you can get everything up and running swiftly.

After installation, you can access Open WebUI at [http://localhost:3000](http://localhost:3000/). Enjoy! 😄

### Other Installation MethodsWe offer various installation alternatives, including non-Docker native installation methods, Docker Compose, Kustomize, and Helm. Visit our [Open WebUI Documentation](https://docs.openwebui.com/getting-started/) or join our [Discord community](https://discord.gg/5rJgQTnV4s) for comprehensive guidance.

### TroubleshootingEncountering connection issues? Our [Open WebUI Documentation](https://docs.openwebui.com/troubleshooting/) has got you covered. For further assistance and to join our vibrant community, visit the [Open WebUI Discord](https://discord.gg/5rJgQTnV4s).

#### Open WebUI: Server Connection ErrorIf you're experiencing connection issues, it’s often due to the WebUI docker container not being able to reach the Ollama server at 127.0.0.1:11434 (host.docker.internal:11434) inside the container . Use the `--network=host` flag in your docker command to resolve this. Note that the port changes from 3000 to 8080, resulting in the link: `http://localhost:8080`.

**Example Docker Command**:

docker run -d --network=host -v open-webui:/app/backend/data -e OLLAMA\_BASE\_URL=http://127.0.0.1:11434 --name open-webui --restart always ghcr.io/open-webui/open-webui:main

### Keeping Your Docker Installation Up-to-DateIn case you want to update your local Docker installation to the latest version, you can do it with [Watchtower](https://containrrr.dev/watchtower/):

docker run --rm --volume /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower --run-once open-webui

In the last part of the command, replace `open-webui` with your container name if it is different.

Check our Updating Guide available in our [Open WebUI Documentation](https://docs.openwebui.com/getting-started/updating).

### Using the Dev Branch 🌙> [!WARNING]
> The :dev branch contains the latest unstable features and changes. Use it at your own risk as it may have bugs or incomplete features.

If you want to try out the latest bleeding-edge features and are okay with occasional instability, you can use the `:dev` tag like this:

docker run -d -p 3000:8080 -v open-webui:/app/backend/data --name open-webui --add-host=host.docker.internal:host-gateway --restart always ghcr.io/open-webui/open-webui:dev

### Offline ModeIf you are running Open WebUI in an offline environment, you can set the `HF_HUB_OFFLINE` environment variable to `1` to prevent attempts to download models from the internet.

export HF\_HUB\_OFFLINE=1

## What's Next? 🌟Discover upcoming features on our roadmap in the [Open WebUI Documentation](https://docs.openwebui.com/roadmap/).

## License 📜This project is licensed under the [BSD-3-Clause License](https://github.com/open-webui/open-webui/blob/main/LICENSE) - see the [LICENSE](https://github.com/open-webui/open-webui/blob/main/LICENSE) file for details. 📄

## Support 💬If you have any questions, suggestions, or need assistance, please open an issue or join our [Open WebUI Discord community](https://discord.gg/5rJgQTnV4s) to connect with us! 🤝

## Star History  [![Star History Chart](https://camo.githubusercontent.com/7ee8a1fb1d842d860663111c40c9684b697266ae2b9d25629dd9078981db4fa3/68747470733a2f2f6170692e737461722d686973746f72792e636f6d2f7376673f7265706f733d6f70656e2d77656275692f6f70656e2d776562756926747970653d44617465)](https://star-history.com/#open-webui/open-webui&Date)

---

Created by [Timothy Jaeryang Baek](https://github.com/tjbck) - Let's make Open WebUI even more amazing together! 💪

