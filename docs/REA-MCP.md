# REA MCP

[REA](https://github.com/morluto/rea) exposes reverse-engineering tools through MCP. The running DSH web session cannot attach new MCP tools after startup; load the patch below when starting DSH.

## Health check

```sh
rea mcp doctor
```

Expected: `healthy: true`, 207 tools, 6 prompts.

## DSH patch

`dsh-mcp-rea.patch.yml` in the repository root:

```yaml
- id: mcp-rea
  name: '@deepseek-ai/dsh-mcp-client'
  config:
    serverName: rea
    transport: stdio
    command: /home/hhdtc/.local/share/fnm/node-versions/v24.18.1/installation/bin/rea
    args:
      - mcp
    failOnStartupError: true
    toolCallTimeoutMs: 120000
```

Start a DSH profile with the overlay:

```sh
dsh web --patch /home/hhdtc/文档/GitHub/websnake/dsh-mcp-rea.patch.yml
```

Adjust the command path if the Node installation is upgraded. After startup, tools are named `mcp__rea__<tool>` (for example `mcp__rea__capabilities`).

Alternatively merge the entry into `~/.dsh/profiles/web/cordis.patch.yml` and restart DSH.

## CLI fallback

The same server is available without MCP:

```sh
rea capabilities
rea analyze /path/to/target
rea --help
```

Use the CLI in the current session; use the MCP patch for a session that should see native `mcp__rea__*` tools.
