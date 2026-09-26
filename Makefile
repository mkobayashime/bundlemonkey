oxfmt = bunx oxfmt
oxlint = bunx oxlint
tsup = bunx tsup
typecheck = bunx tsc --noEmit
vitest = bunx vitest

deps: PHONY
ifeq ($(CI), true)
	bun install --frozen-lockfile
else
	bun install
endif

lint: deps PHONY
	$(oxlint) --type-aware
	$(oxfmt) --check

lint.fix: deps PHONY
	$(oxlint) --fix --type-aware
	$(oxfmt)

typecheck: deps PHONY
	$(typecheck)

typecheck.watch: deps PHONY
	$(typecheck) --watch

test: deps PHONY
	$(vitest) run

test.watch: deps PHONY
	$(vitest) watch

clear: PHONY
	rm -rf dist

build: deps clear PHONY
	$(tsup)
	chmod a+x dist/bin/index.js

bump.version: PHONY
	bun run bin/bumpVersion.ts

PHONY:
