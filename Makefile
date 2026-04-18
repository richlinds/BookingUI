# Makefile for BookingUI (intended for Git Bash/WSL/mingw on Windows)

NPM ?= npm

.PHONY: help install hooks-install precommit dev build preview lint format format-check typecheck check ci

help:
	@echo "Available targets:"
	@echo "  make install       Install dependencies"
	@echo "  make hooks-install Configure git to use .githooks/"
	@echo "  make precommit     Run local pre-commit checks"
	@echo "  make dev           Start Vite dev server"
	@echo "  make build         Build production assets"
	@echo "  make preview       Preview production build"
	@echo "  make lint          Run ESLint"
	@echo "  make format        Format TypeScript files with Prettier"
	@echo "  make format-check  Check formatting with Prettier"
	@echo "  make typecheck     Run TypeScript type checks"
	@echo "  make check         Run typecheck + lint + format-check"
	@echo "  make ci            Install, run checks, and build"

install:
	$(NPM) install

hooks-install:
	git config core.hooksPath .githooks

precommit:
	$(NPM) run check

dev:
	$(NPM) run dev

build:
	$(NPM) run build

preview:
	$(NPM) run preview

lint:
	$(NPM) run lint

format:
	$(NPM) run format

format-check:
	$(NPM) run format:check

typecheck:
	$(NPM) run typecheck

check:
	$(NPM) run check

ci: install check build
