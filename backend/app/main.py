from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

from app.api.routes import locations, species, density

# Get the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

app = FastAPI(
    title="Disappearing Florida API",
    description="API for Florida habitat loss visualization and sustainable development tools",
    version="0.1.0",
)

# CORS middleware - adjust origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(locations.router, prefix="/api/locations", tags=["locations"])
app.include_router(species.router, prefix="/api/species", tags=["species"])
app.include_router(density.router, prefix="/api/density", tags=["density"])

# Serve static files
static_dir = BASE_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Serve Vue frontend build (for production)
frontend_dist = BASE_DIR / "frontend" / "dist"
if frontend_dist.exists():
    # Mount the assets directory for static files (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")


@app.get("/")
async def root():
    """Root endpoint - serve Vue app or fallback"""
    frontend_index = frontend_dist / "index.html"
    if frontend_index.exists():
        return FileResponse(str(frontend_index))

    # Fallback if Vue build doesn't exist
    static_index = static_dir / "index.html"
    if static_index.exists():
        return FileResponse(str(static_index))

    return {
        "message": "Disappearing Florida API",
        "docs": "/docs",
        "version": "0.1.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Catch-all route to serve Vue SPA for client-side routing"""
    # Don't interfere with API routes, docs, or static files
    if full_path.startswith(("api/", "docs", "redoc", "openapi.json", "static/", "assets/")):
        return {"detail": "Not found"}

    # Serve Vue app index.html for all other routes
    frontend_index = frontend_dist / "index.html"
    if frontend_index.exists():
        return FileResponse(str(frontend_index))

    return {"detail": "Frontend not built"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
