#!/usr/bin/env bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AMP Templates Setup${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}ERROR: pnpm is not installed. Please install pnpm first.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${RED}ERROR: Node.js version 22 or higher is required. Current version: $(node --version)${NC}"
    exit 1
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
pnpm install

# Build packages
echo -e "${GREEN}Building packages...${NC}"
pnpm build

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo -e "${GREEN}You can now run:${NC}"
echo -e "  ${YELLOW}pnpm dev${NC}                                          # Run CLI in development mode"
echo -e "  ${YELLOW}cd packages/create-amp && pnpm dev my-app${NC}        # Generate a new project"
echo -e "  ${YELLOW}pnpm test${NC}                                         # Run tests"
echo -e "  ${YELLOW}pnpm lint${NC}                                         # Check code quality"
echo -e "  ${YELLOW}pnpm format${NC}                                       # Format code"
echo ""
echo -e "${GREEN}Available templates:${NC}"
echo -e "  ${YELLOW}nextjs${NC} - Next.js with TypeScript and Tailwind CSS"
echo -e "  ${YELLOW}vite${NC} - Vite with React, TypeScript and Tailwind CSS"
echo ""
echo -e "${GREEN}Available data layers:${NC}"
echo -e "  ${YELLOW}arrow-flight${NC} - Apache Arrow Flight for high-performance data"
echo -e "  ${YELLOW}amp-sync${NC} - Electric SQL for real-time synchronization"
