# Vaulton - Open-Source Self-Hosted End-to-End Encrypted Password Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/workflow/status/devcodemuni/vaulton/CI?style=flat-square)](https://github.com/devcodemuni/vaulton/actions)
[![Code Coverage](https://img.shields.io/codecov/c/gh/devcodemuni/vaulton?style=flat-square)](https://app.codecov.io/gh/devcodemuni/vaulton)
[![Code Quality](https://img.shields.io/codacy/grade/61c9c2f3f7f04dcbae2f9b4c2c3d3f5b?style=flat-square)](https://app.codacy.com/gh/devcodemuni/vaulton/dashboard)
[![GitHub Stars](https://img.shields.io/github/stars/devcodemuni/vaulton?style=social)](https://github.com/devcodemuni/vaulton)

**Vaulton** is a free, open-source, self-hosted, **end-to-end encrypted password manager** built with modern web technologies like [Bun](https://bun.sh), [Hono](https://hono.dev), [Drizzle ORM](https://orm.drizzle.team) (SQLite), and [Tailwind CSS](https://tailwindcss.com). Vaulton helps you securely store, organize, and manage your credentials with full control, no third-party servers, and no compromises.

## Features

* **End-to-End Encryption**: Your data is encrypted before it leaves your device.
* **Self-Hosted**: Deploy on your own server for complete control.
* **Powered by Bun.js**: Fast, modern runtime.
* **SQLite + Drizzle ORM**: Reliable, lightweight database layer.
* **Tailwind CSS + HTMX**: Clean UI with modern interactivity.
* **Open Source**: Transparent and community-driven.

## Getting Started

### Prerequisites

* [Bun](https://bun.sh) `>=1.2.19`
* Node.js (optional, for tooling)
* SQLite (bundled, no external setup required)

### Development Setup

1. Clone the repository: `git clone https://github.com/devcodemuni/vaulton.git`
2. Install dependencies: `bun install`
3. Run development server: `bun run dev`
4. Build for Production: `bun run build:css` and `bun run start`

### Project Structure

The project structure is as follows:

