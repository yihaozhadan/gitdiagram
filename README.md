[![Image](./docs/readme_img.png "GitDiagram Front Page")](https://gitdiagram.com/)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-F16061.svg?logo=buymeacoffee&logoColor=white)](https://buymeacoffee.com/hui.zhou)

# GitDiagram

Turn any GitHub repository into an interactive diagram for visualization in seconds.

## 🚀 Features

- 👀 **Instant Visualization**: Convert any GitHub repository structure into a system design / architecture diagram
- 🎨 **Interactivity**: Click on components to navigate directly to source files and relevant directories
- ⚡ **Fast Generation**: Powered by various AI models for quick and accurate diagrams
- 🔄 **Customization**: Modify and regenerate diagrams with custom instructions
- 🐛 **Debug Support**: View Mermaid diagram source code and syntax errors for easy debugging

## 🤖 AI Model Configuration

- **Model Selection**: Choose from multiple LLM providers:
  - OpenRouter (default): optimus-alpha, o3-mini
  - OpenAI: GPT-4, GPT-3.5-turbo
  - Groq: mixtral-8x7b-32768
  - Ollama: mistral, llama2, codellama
- **API Key Configuration**: Configure your own API keys for each provider through the UI
- **Context Size**: Different models have varying context windows, affecting their ability to analyze larger repositories
- **Output Variation**: The same model may generate slightly different diagrams for the same repository due to the nature of LLMs

## 💾 Caching System

- **Token Efficiency**: Generated diagrams are cached in the database to save API tokens
- **Up-to-date Results**: Cache typically reflects the latest repository state
- **Private Repositories**: Cache is stored server-side
  - For sensitive data, consider self-hosting the application
  - Self-hosting instructions provided below

## ⚙️ Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, ShadCN
- **Backend**: FastAPI, Python, Server Actions
- **Database**: PostgreSQL (with Drizzle ORM)
- **AI**: Your own AI model
- **Deployment**: Vercel (Frontend), EC2 (Backend)
- **CI/CD**: GitHub Actions

## 🤔 About

I created this because I wanted to contribute to open-source projects but quickly realized their codebases are too massive for me to dig through manually, so this helps me get started - but it's definitely got many more use cases!

Given any public (or private!) GitHub repository it generates diagrams in Mermaid.js with your own AI model

I extract information from the file tree and README for details and interactivity (you can click components to be taken to relevant files and directories)

Most of what you might call the "processing" of this app is done with prompt engineering - see `/backend/app/prompts.py`. This basically extracts and pipelines data and analysis for a larger action workflow, ending in the diagram code.

## 🔒 How to diagram private repositories

You can simply click on "Private Repos" in the header and follow the instructions by providing a GitHub personal access token with the `repo` scope.

You can also self-host this app locally (backend separated as well!) with the steps below.

## 🛠️ Self-hosting / Local Development

1. Clone the repository

```bash
git clone https://github.com/yihaozhadan/gitdiagram.git
cd gitdiagram
```

2. Install dependencies

```bash
pnpm i
```

3. Set up environment variables (create .env)

```bash
cp .env.example .env
```

Then edit the `.env` file with your Anthropic API key and optional GitHub personal access token.

4. Run backend

```bash
docker-compose up --build -d
```

or

```bash
cd /path/to/gitdiagram/backend && source venv/bin/activate && uvicorn app.main:app --reload
```

Logs available at `docker-compose logs -f`
The FastAPI server will be available at `localhost:8000`

5. Start local database

```bash
chmod +x start-database.sh
./start-database.sh
```

When prompted to generate a random password, input yes.
The Postgres database will start in a container at `localhost:5433`

6. Initialize the database schema

```bash
pnpm db:push --port 5433 --dialect=postgresql --schema=public
```

You can view and interact with the database using `pnpm db:studio`

7. Run Frontend

```bash
pnpm dev
```

You can now access the website at `localhost:3000` and edit the rate limits defined in `backend/app/routers/generate.py` in the generate function decorator.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

Shoutout to [Romain Courtois](https://github.com/cyclotruc)'s [Gitingest](https://gitingest.com/) for inspiration and styling

## 📈 Rate Limits

Hui Zhou is currently hosting it for free with no rate limits though this is somewhat likely to change in the future.

<!-- If you would like to bypass these, self-hosting instructions are provided. I also plan on adding an input for your own Anthropic API key.

Diagram generation:

- 1 request per minute
- 5 requests per day -->

## 🤔 Future Steps

- Implement font-awesome icons in diagram
- Implement an embedded feature like star-history.com but for diagrams. The diagram could also be updated progressively as commits are made.
- Feel free to suggest more features or improvements
