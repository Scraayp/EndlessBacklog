# EndlessBacklog Wiki source

This folder holds the source for the project's [GitHub
Wiki](https://docs.github.com/en/communities/documenting-your-project-with-wikis) —
kept here, in the main repo, so it goes through code review and travels with
the code it documents, instead of living only in the wiki's own separate git
history.

## Publishing these pages to the GitHub Wiki

The GitHub Wiki is backed by its own git repository at
`https://github.com/<you>/EndlessBacklog.wiki.git`. To publish:

```bash
# One-time: create the wiki repo by adding at least one page via the GitHub
# web UI ("Create the first page"), then:
git clone https://github.com/<you>/EndlessBacklog.wiki.git
cp wiki/*.md EndlessBacklog.wiki/
cd EndlessBacklog.wiki
git add .
git commit -m "Sync wiki from main repo"
git push
```

Re-run the `cp` + commit + push whenever `wiki/*.md` changes in the main
repo. Filenames here match the wiki page names GitHub expects (`Home.md` is
the wiki's landing page).

## Pages

| Page | Audience | Covers |
|---|---|---|
| [Home](Home.md) | Everyone | Overview and links into the rest of the wiki |
| [Getting-Started](Getting-Started.md) | End users | Account creation, first login, first workspace/board |
| [Workspaces](Workspaces.md) | End users | Creating workspaces, roles, inviting members |
| [Boards](Boards.md) | End users | Creating/archiving boards, backgrounds, settings |
| [Cards-and-Checklists](Cards-and-Checklists.md) | End users | Card editing, description, due dates, checklists |
| [Labels-and-Members](Labels-and-Members.md) | End users | Label colors, assigning members, filtering |
| [Notifications](Notifications.md) | End users | In-app vs. email notifications, digests |
| [Keyboard-Shortcuts](Keyboard-Shortcuts.md) | End users | Shortcut reference |
| [Admin-Guide](Admin-Guide.md) | Workspace admins | Managing members/roles, transferring ownership |
| [Self-Hosting-Configuration](Self-Hosting-Configuration.md) | Operators | Every env var, dialect choice, SMTP, OAuth setup, backups |
| [Deploying-on-Dokploy](Deploying-on-Dokploy.md) | Operators | Running the compose stack on Dokploy specifically |
| [API-Overview](API-Overview.md) | Integrators | REST endpoint map, auth scheme |
| [FAQ](FAQ.md) | Everyone | Common questions |
| [Roadmap](Roadmap.md) | Everyone | Phase 2+ feature plan |
| [Architecture](Architecture.md) | Developers | Layering, request lifecycle, sockets, jobs |
| [Contributing](Contributing.md) | Developers | Branch/PR workflow, coding standards, tests |
| [Database-Schema](Database-Schema.md) | Developers | Tables, relationships, migration workflow |
