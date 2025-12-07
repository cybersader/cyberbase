# Knowledge Base Philosophy

## Core Principle

**All projects follow a living markdown knowledge base pattern, designed for both human and LLM agent collaboration.**

The KB is not documentation created after the fact - it IS the project's brain. It evolves as understanding deepens, decisions are made, and implementation progresses. It serves as persistent memory across sessions and agents.

---

## Why This Pattern

### For Humans
- **Searchable** - grep, Obsidian, VS Code all work
- **Portable** - No vendor lock-in, works everywhere
- **Git-friendly** - Diffs, history, collaboration
- **Human-readable** - No special tools needed

### For LLM Agents (Claude, etc.)
- **Context loading** - Agent reads relevant files at session start
- **Persistent memory** - Knowledge survives session boundaries
- **Structured output** - Research/analysis goes INTO files, not just chat
- **Multi-agent** - Different agents can work on same KB
- **Auditable** - Can see what agent wrote/changed

---

## Working With LLM Agents

### Session Start Pattern
```
1. Agent reads .claude/ folder for project context
2. Agent reads relevant KB files for task at hand
3. Agent has full context without re-explaining
```

### During Work
```
- UPDATE KB files as new information is learned
- CREATE new files for new topics (don't dump in chat)
- LINK between related files
- DELETE obsolete content
```

### Research Tasks
**Output goes INTO the KB, not just displayed in chat.**
```
Bad:  "Here's what I found about DNS filtering: [wall of text in chat]"
Good: "I've created DNS_FILTERING_DEEP_DIVE.md with my findings."
```

### Implementation Tasks
```
1. Document decisions and rationale in KB BEFORE coding
2. Update architecture docs as implementation reveals new info
3. KB should explain WHY, code explains HOW
```

### Multi-Session Continuity
The KB enables picking up where you left off:
```
Session 1: Research competitors → Creates 02-competitors/*.md
Session 2: Agent reads competitor files → Has full context
Session 3: Design architecture → Creates 03-architecture/*.md
```

---

## File Naming Conventions

```
SCREAMING_SNAKE_CASE.md

Good:
  DNS_FILTERING_DEEP_DIVE.md
  BYPASS_METHODS_COMPENDIUM.md
  IOS_VS_ANDROID_COMPARISON.md

Bad:
  dns-filtering.md          (not distinctive enough)
  notes.md                  (meaningless)
  Document1.md              (useless)
  temp.md                   (will become permanent)
```

**Names should be:**
- Descriptive (what would you grep for?)
- Unique across project
- Self-documenting
- Specific enough to find again

---

## Standard Project Structure

```
project/
├── .claude/                    # Meta: how to work on this project
│   ├── PROJECT_CONTEXT.md      # What is this, who's it for, background
│   ├── KNOWLEDGE_BASE_PHILOSOPHY.md  # This file (or link to global)
│   └── [project-specific guidance]
│
├── 00-overview/                # Vision, goals, principles
├── 01-problem/                 # Problem definition, constraints, landscape
├── 02-research/                # Or 02-competitors/ - analysis of existing work
├── 03-architecture/            # Technical designs, decisions
├── 04-implementation/          # Or platform-specific folders
└── ...
```

**Numbered prefixes** ensure consistent ordering in file explorers.

---

## KB Evolution Principles

### 1. Create Files Early
Don't wait until you "know enough." Create a file when you start exploring a topic. It will grow.

### 2. Split When Large
If a file exceeds ~500 lines or covers multiple distinct topics, split it.

### 3. Update, Don't Append
When understanding changes, **update the existing content** rather than appending "UPDATE: actually..." notes. The KB reflects CURRENT understanding.

### 4. Link Between Files
Use relative links: `See [DNS Services](../02-competitors/DNS_FILTERING_SERVICES_DEEP_DIVE.md)`

### 5. Delete Obsolete Content
If something is no longer true or relevant, remove it. Git has history if you need it back.

### 6. Index Files Are Valuable
Create index/overview files that link to detailed files. `TOOLS_INDEX.md` links to individual tool analyses.

---

## The .claude/ Folder

Every project should have a `.claude/` folder containing:

### Required
- **PROJECT_CONTEXT.md** - What is this project? Who's it for? Background the agent needs.

### Optional but Recommended
- **RESEARCH_SOURCES.md** - Key references, URLs, documentation links
- **CONVENTIONS.md** - Project-specific naming, patterns, decisions
- **CURRENT_STATUS.md** - What's done, what's in progress, what's next

### Purpose
The `.claude/` folder is the **first thing an agent should read** when starting work on a project. It provides the meta-context needed to work effectively.

---

## Anti-Patterns

**DON'T:**
- Create one giant file for everything
- Use generic names like "notes.md" or "info.md"
- Leave outdated information in files
- Put temporary thoughts in permanent files
- Keep research only in chat (it disappears)
- Expect agent to remember previous sessions without KB

**DO:**
- One topic per file (roughly)
- Descriptive, searchable names
- Update as understanding evolves
- Use consistent structure
- Cross-link related files
- Write findings to files, not just chat

---

## Prompting Agents for KB Work

### For Research
```
"Research [topic] exhaustively. Document findings in [folder]/[FILENAME].md.
Include sources, code samples where helpful, honest limitations."
```

### For Analysis
```
"Analyze [thing]. Create/update [FILE].md with:
- How it works technically
- Strengths and weaknesses
- What we can learn from it"
```

### For Architecture
```
"Design [component]. Document in 03-architecture/[NAME].md with:
- Diagrams (ASCII)
- Trade-offs considered
- Decision rationale"
```

### For Continuation
```
"Read the .claude/ folder and relevant KB files, then continue
where we left off on [task]."
```

---

## This Pattern Applied

This philosophy is used across:
- Software projects (code + KB)
- Research projects (pure KB)
- Planning projects (decisions + rationale)
- Learning projects (notes that evolve)

The KB is the project. Code is just one output of the understanding captured in the KB.
