#!/bin/bash

# SwagIQ Basketball Analytics - Quick Start Script
# This script sets up and runs the complete SwagIQ platform

set -e  # Exit on error

echo "=========================================="
echo "🏀 SwagIQ Basketball Analytics"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Python version
echo -e "${BLUE}[1/6] Checking Python version...${NC}"
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)' || {
    echo "❌ Python 3.8+ required"
    exit 1
}
echo -e "${GREEN}✓ Python OK${NC}\n"

# Step 2: Create virtual environment
echo -e "${BLUE}[2/6] Setting up virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created"
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}\n"

# Step 3: Install dependencies
echo -e "${BLUE}[3/6] Installing dependencies...${NC}"
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1 || {
    echo "❌ Failed to install dependencies"
    exit 1
}
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

# Step 4: Run setup script
echo -e "${BLUE}[4/6] Running setup...${NC}"
python3 setup.py || {
    echo "❌ Setup failed"
    exit 1
}
echo -e "${GREEN}✓ Setup completed${NC}\n"

# Step 5: Configure API key
echo -e "${BLUE}[5/6] Configuring Roboflow API...${NC}"
if [ -z "$ROBOFLOW_API_KEY" ]; then
    echo "Setting ROBOFLOW_API_KEY environment variable..."
    export ROBOFLOW_API_KEY="NaIAgSwpIwHdovicjq2E"
    echo "✓ API key configured"
else
    echo "✓ API key already set"
fi
echo -e "${GREEN}✓ API configured${NC}\n"

# Step 6: Start dashboard
echo -e "${BLUE}[6/6] Starting SwagIQ Dashboard...${NC}"
echo ""
echo -e "${GREEN}=========================================="
echo "✓ All systems ready!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}📊 Dashboard is starting...${NC}"
echo ""
echo -e "🌐 Open your browser and go to:"
echo -e "   ${BLUE}http://localhost:8000/dashboard${NC}"
echo ""
echo -e "📚 API Documentation:"
echo -e "   ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "🏥 Health Check:"
echo -e "   ${BLUE}http://localhost:8000/health${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the dashboard
python3 dashboard.py
