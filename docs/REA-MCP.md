# REA MCP

[REA](https://github.com/morluto/rea) exposes reverse-engineering tools through MCP. DSH only attaches MCP servers at startup, so REA must be declared in a Cordis patch before the profile launches.

## Health check

```sh
/home/hhdtc/.local/share/fnm/aliases/default/bin/rea mcp doctor
```

Expected: `healthy: true`, 207 tools, 6 prompts, `rea-agents` 6.7.0.

## Cordis patch format

DSH patches are *entry overlays*: a top-level list item such as `- id: rea-mcp` tries to find an existing plugin with that id and fails with:

```
patch: entry "mcp-rea" not found
```

New plugins must be added through `insert`:

```yaml
- insert:
    - id: rea-mcp
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: rea
        transport: stdio
        command: /home/hhdtc/.local/share/fnm/aliases/default/bin/rea
        args:
          - mcp
        failOnStartupError: false
        toolCallTimeoutMs: 120000
```

`dsh-mcp-rea.patch.yml` in the repository root contains exactly this block.

Two deliberate choices:

- **`aliases/default/bin/rea`, not `node-versions/v24.18.1/...`.** The pinned path dies the moment that Node build is deleted. The alias follows `fnm default`, so a Node upgrade keeps working as long as rea is installed in the new default. Do not use bare `rea` either — in a shell that is an fnm multishell shim (`/run/user/<uid>/fnm_multishells/<pid>_<ts>/bin/rea`) that only exists for that terminal.
- **`failOnStartupError: false`.** With `true`, the plugin throws during activation and `dsh web` refuses to boot when rea is missing. With `false` (also the client default) registration failure is contained: DSH starts normally, `mcp__rea__*` is simply absent, and the reconnect policy retries — so fixing the path can restore the tools without a restart.

## Install

Global (recommended — every profile gets REA):

```sh
cp /home/hhdtc/文档/GitHub/websnake/dsh-mcp-rea.patch.yml ~/.dsh/cordis.patch.yml
```

Single profile instead:

```sh
dsh web --patch /home/hhdtc/文档/GitHub/websnake/dsh-mcp-rea.patch.yml
```

Verify the entry composed without starting the GUI:

```sh
dsh --profile web --dump-config | grep -A6 rea-mcp
```

Restart the DSH process afterwards; an already-running session will not pick up new tools.

Use one of the two — copying the file to `~/.dsh/cordis.patch.yml` *and* passing `--patch` inserts `rea-mcp` twice.

## Usage

Tools are namespaced `mcp__rea__<tool>`. A quick liveness probe that needs no target:

```text
mcp__rea__binary_session
```

It returns the bound provider list plus catalog digests (`207` tools, `6` prompts) and the negotiated protocol version. Most analysis tools answer `target_required` until `mcp__rea__open_binary` selects a local artifact.

Provider-dependent tools report `capability_unavailable` with an explicit remediation when their external binary is missing (for example `adb`, `apktool`, `GHIDRA_INSTALL_DIR`, `REA_TSHARK_COMMAND`). That is the server working as designed, not a broken MCP link.

Check the configured command still resolves:

```sh
/home/hhdtc/.local/share/fnm/aliases/default/bin/rea mcp doctor
```

If rea stops showing up, run that first; then `dsh web --dump-config | grep -A9 rea-mcp` to confirm the entry still composes.

## CLI fallback

The same server is reachable without MCP:

```sh
rea capabilities
rea analyze /path/to/target
rea --help
```
