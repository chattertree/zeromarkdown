# ZeroMarkDown

A local-first Markdown note-taking desktop application built with Tauri and React. Notes are stored as `.md` files on your filesystem — no cloud, no accounts, no tracking.

---

## Features

- Rich-text WYSIWYG editing with MDXEditor (switch between rich-text and source mode)
- Local file vault (`~/Documents/ZMD/`) with auto-save
- Wiki-links (`[[Note Name]]`) with hover preview and click-to-navigate
- Mermaid diagram support (live preview in editor)
- Image paste/drop — saved locally, no server upload
- Code blocks with syntax highlighting (JavaScript, TypeScript, CSS, Bash, and more)
- Admonitions, tables, thematic breaks, and standard Markdown formatting
- Note pinning, search, and sidebar navigation
- YouTube embed support via directives
- Dark theme

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Runtime | [Tauri v1](https://v1.tauri.app/) (Rust backend + system webview) |
| Frontend | React 18 + TypeScript + Vite |
| Editor | [MDXEditor](https://mdxeditor.dev/) with Lexical |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Storage | Local filesystem via Tauri `fs` API |

---

## Prerequisites

Before building the project, ensure you have the following installed on your system.

### Node.js (v18 or later)

```bash
# macOS (Homebrew)
brew install node

# Or use nvm for version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 18
nvm use 18
```

Verify: `node --version` and `npm --version`

### Rust and Cargo

Tauri requires a Rust toolchain. Install via [rustup](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, restart your terminal and verify:

```bash
rustc --version
cargo --version
```

### Platform-Specific System Dependencies

Tauri requires system-level libraries to compile and render the webview.

#### macOS

Xcode Command Line Tools (provides clang, WebKit, and build essentials):

```bash
xcode-select --install
```

#### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Linux (Fedora)

```bash
sudo dnf install -y \
  webkit2gtk4.0-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
sudo dnf group install "C Development Tools and Libraries"
```

#### Windows

- [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (select "Desktop development with C++")
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (pre-installed on Windows 10/11)

### Tauri CLI

Installed automatically via `devDependencies`, but you can also install globally:

```bash
cargo install tauri-cli
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/chattertree/zeromarkdown.git
cd zeromarkdown
```

### Install frontend dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run tauri dev
```

This starts the Vite dev server with hot-reload and opens the Tauri window.

### Build for production

```bash
npm run prod
```

This runs `npm install`, compiles the frontend, and builds the native Tauri binary. The output is located in `src-tauri/target/release/bundle/`.

---

## Project Structure

```
zeromarkdown/
├── src/                    # React frontend source
│   ├── components/         # UI components (shadcn, Mermaid, FallbackCodeBlock)
│   ├── plugins/            # MDXEditor plugins (wiki-links)
│   ├── provider/           # React context providers (Editor, Notes)
│   ├── utils/              # File I/O, vault storage helpers
│   ├── Editor.tsx          # Main editor component
│   ├── NotesMenu.tsx       # Sidebar with notes list
│   ├── App.tsx             # Application root
│   ├── App.css             # Global styles and theme
│   └── editor.css          # Editor-specific styles
├── src-tauri/              # Tauri/Rust backend
│   ├── src/main.rs         # Rust entry point
│   ├── tauri.conf.json     # Tauri configuration
│   └── Cargo.toml          # Rust dependencies
├── fonts/                  # Local font files
├── mcp-server/             # MCP server for AI assistant integration
│   └── src/index.ts        # CRUD tools for notes via Model Context Protocol
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Data Storage

All notes are stored locally at:

```
~/Documents/ZMD/
├── config.json          # Pinned notes metadata
├── assets/              # Pasted images
├── My Note.md
├── Another Note.md
└── ...
```

No data leaves your machine. Backup by copying the `ZMD` folder.

---

## MCP Server (AI Integration)

ZeroMarkDown includes an MCP (Model Context Protocol) server that allows AI assistants to read, create, update, and search your notes.

### Build the MCP server

```bash
cd mcp-server
npm install
npm run build
```

### Register with Cursor

The server is configured in `.cursor/mcp.json` and runs automatically when Cursor starts.

### Available tools

`list_notes`, `read_note`, `create_note`, `update_note`, `delete_note`, `pin_note`, `unpin_note`, `search_notes`

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `error: could not compile` (Rust) | Ensure Rust is up to date: `rustup update` |
| WebKit/GTK errors on Linux | Install platform dependencies listed above |
| `Cannot find native binding` (Tailwind Oxide) | Run `npm install @tailwindcss/oxide-darwin-arm64` (macOS ARM) |
| Images show broken icon | Restart the app after adding `protocol.asset` to `tauri.conf.json` |
| `npm run tauri dev` hangs | Ensure port 1420 is free; kill any stale Vite processes |

---

## License

See [LICENSE](./LICENSE) for details.
