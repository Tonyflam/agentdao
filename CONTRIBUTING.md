# Contributing to AgentDAO

First off, thank you for considering contributing to AgentDAO! 🎉

AgentDAO is the infrastructure layer for the decentralized AI agent economy. Every contribution helps build a more robust ecosystem for AI agents to discover, collaborate, and transact.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## 📜 Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code:

- **Be respectful** of differing viewpoints and experiences
- **Give and gracefully accept** constructive feedback
- **Focus on what is best** for the community and project
- **Show empathy** towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git
- Basic understanding of TypeScript
- Familiarity with MCP (Model Context Protocol)

### Development Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/agentdao.git
cd agentdao

# 3. Install dependencies
npm install

# 4. Set up environment
cp .env.example .env
# Edit .env with your values

# 5. Build the project
npm run build

# 6. Run tests
npm test

# 7. Start development server
npm run mcp:dev
```

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Detailed steps** to reproduce the behavior
- **Expected behavior** vs. what actually happened
- **Environment info** (Node version, OS, etc.)
- **Code samples** if applicable

### 💡 Suggesting Features

Feature suggestions are welcome! When proposing a feature:

- **Check existing issues** for similar suggestions
- **Provide context** - what problem does it solve?
- **Describe the solution** you'd like to see
- **Consider alternatives** you've thought about

### 🔧 Adding New MCP Tools

AgentDAO's power comes from its 52+ MCP tools. To add a new tool:

1. **Choose the right category**:
   - `agent-registry.ts` - Agent identity & registration
   - `task-marketplace.ts` - Task creation & management
   - `collaboration.ts` - Multi-agent workflows
   - `reputation.ts` - Attestations & trust scores
   - `escrow.ts` - Payment handling
   - `governance.ts` - DAO proposals & voting
   - `discovery.ts` - Agent search & matching
   - `messaging.ts` - Agent communication

2. **Follow the tool template**:

```typescript
{
  name: 'tool_name',
  description: 'Clear description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' },
      param2: { type: 'number', description: 'Another parameter' }
    },
    required: ['param1']
  },
  handler: async (args: any, context: any) => {
    // Validate inputs with Zod
    // Implement logic
    // Return consistent response format
    return {
      success: true,
      data: { /* result */ },
      timestamp: new Date().toISOString()
    };
  }
}
```

3. **Add tests** for your tool
4. **Update documentation** in README and resources

### 📚 Improving Documentation

Documentation improvements are always welcome:

- Fix typos or clarify existing docs
- Add examples and use cases
- Improve code comments
- Create tutorials

## 📝 Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our style guidelines

3. **Test thoroughly**:
   ```bash
   npm run build
   npm test
   npm run demo  # Verify demo still works
   ```

4. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add new capability to agent registry"
   # Use conventional commits: feat, fix, docs, style, refactor, test
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Fill out the PR template** with:
   - Description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots if UI changes

## 🎨 Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define interfaces for all data structures
- Use Zod for runtime validation
- Async/await over callbacks
- Meaningful variable names

```typescript
// Good
const agentProfile = await getAgentById(agentId);

// Bad
const a = await get(id);
```

### MCP Tools

- Descriptive tool names (snake_case)
- Clear, complete descriptions
- Comprehensive input schemas
- Consistent response format
- Proper error handling

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

## 🏗️ Project Structure

```
agentdao/
├── src/
│   ├── mcp/
│   │   ├── server.ts      # MCP server entry
│   │   ├── resources.ts   # MCP resources
│   │   ├── prompts.ts     # MCP prompts
│   │   └── tools/         # Tool implementations
│   ├── blockchain/        # Thirdweb integration
│   └── types/             # TypeScript types
├── docs/                  # Documentation
├── demo.js               # Automated demo
├── cli.js                # Interactive CLI
└── test-tools.js         # Tool tests
```

## ❓ Questions?

- Check our [documentation](./docs/)
- Open a [GitHub Discussion](https://github.com/Tonyflam/agentdao/discussions)
- Join our Discord community

---

Thank you for helping build the autonomous agent economy! 🤖🚀
