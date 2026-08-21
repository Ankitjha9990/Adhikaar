"""Deployment entrypoint for ASGI servers configured with app:app."""

from main import app

__all__ = ["app"]