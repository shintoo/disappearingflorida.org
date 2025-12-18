.PHONY: help install dev backend frontend clean build

help:
	@echo "Disappearing Florida - Development Commands"
	@echo ""
	@echo "make install    - Install all dependencies (backend + frontend)"
	@echo "make dev        - Run development servers (requires manual setup)"
	@echo "make backend    - Run only backend server"
	@echo "make frontend   - Run only frontend server"
	@echo "make build      - Build frontend for production"
	@echo "make clean      - Clean build artifacts and caches"

install:
	@echo "Installing backend dependencies..."
	cd backend && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Done! Run 'make dev' to start development servers."

backend:
	@echo "Starting FastAPI backend..."
	cd backend && . venv/bin/activate && python -m app.main

frontend:
	@echo "Starting Vue frontend..."
	cd frontend && npm run dev

build:
	@echo "Building Vue frontend for production..."
	cd frontend && npm run build
	@echo "Build complete! Files in frontend/dist/"

clean:
	@echo "Cleaning build artifacts..."
	rm -rf frontend/dist
	rm -rf frontend/node_modules/.vite
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	@echo "Clean complete!"
