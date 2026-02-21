---
name: coding-python
cluster: coding
description: "Python 3.12+: stdlib, async/await, dataclasses, type hints, venv/uv. FastAPI pandas numpy pydantic"
tags: ["python","coding"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "python code fastapi pandas numpy async type hints pydantic"
---

## Purpose
This skill equips the AI to generate, debug, and optimize Python 3.12+ code using core features and libraries, focusing on practical implementations for data handling, async operations, and web services.

## When to Use
Use this skill for tasks involving data analysis (e.g., with pandas/numpy), building RESTful APIs (e.g., FastAPI), asynchronous processing (e.g., async/await), data validation (e.g., pydantic), or environment management (e.g., venv/uv). Apply it when code requires type hints for maintainability or dataclasses for simple structs, especially in projects needing fast iteration.

## Key Capabilities
- **Python 3.12 Features**: Use async/await for non-blocking I/O; define dataclasses with `@dataclass` decorator; enforce type hints via `from typing import List` (e.g., `def func(x: int) -> str:`).
- **Standard Library**: Leverage `asyncio` for event loops (e.g., `asyncio.run(main())`); use `venv` for isolated environments (e.g., `python -m venv myenv`).
- **uv Tool**: Alternative to venv; install with `pip install uv`, then create env via `uv venv myenv` and activate with `source myenv/bin/activate`.
- **Libraries**: FastAPI for async web apps (e.g., define routes with `@app.get("/")`); pandas for data frames (e.g., `df = pd.DataFrame(data)`); numpy for arrays (e.g., `np.array([1, 2, 3])`); pydantic for models (e.g., `from pydantic import BaseModel; class Item(BaseModel): name: str`).

## Usage Patterns
To accomplish tasks, structure code as follows: Import necessary modules first (e.g., `import asyncio, fastapi`); use async functions for I/O-bound operations (e.g., `async def fetch_data(): await asyncio.sleep(1)`); wrap scripts in virtual environments for dependency isolation. For projects, initialize with `python -m venv .venv` then install dependencies via `pip install fastapi pandas numpy pydantic`. When generating code, ensure type hints are included (e.g., `def add(a: float, b: float) -> float: return a + b`). For async patterns, run the event loop explicitly: `asyncio.run(main())`. Always check for compatibility with Python 3.12+ by specifying in shebang or requirements.txt.

## Common Commands/API
- **CLI Commands**: Create venv with `python -m venv env_name --prompt env_name` (use `--copies` flag for Windows); activate via `source env_name/bin/activate` on Unix or `env_name\Scripts\activate` on Windows; run scripts with `uv run script.py --watch` for auto-reload. Install packages: `pip install fastapi[all]` or `uv add fastapi`.
- **API Endpoints/Methods**: In FastAPI, define an endpoint like: `from fastapi import FastAPI; app = FastAPI(); @app.get("/items/{item_id}") async def read_item(item_id: int): return {"item_id": item_id}`. For pandas, use `df.groupby('column').mean()`; for numpy, `np.dot(array1, array2)`; for pydantic, validate data with `item = Item(name="example")`.
- **Config Formats**: Use JSON for FastAPI configs (e.g., `{"debug": true}` in settings.py); environment variables for keys (e.g., `os.environ.get('API_KEY')`); requirements.txt for dependencies (e.g., `fastapi>=0.95.0\npandas==2.0.0`).

## Integration Notes
Integrate this skill by setting up a Python project: First, create a venv and install libraries with `pip install -r requirements.txt`. For external services, use env vars for authentication (e.g., set `export API_KEY=your_key` and access via `os.getenv('API_KEY')` in code). When combining with other tools, import as needed (e.g., for async database queries, use `async with database.connect() as conn:`). Ensure compatibility: Python 3.12+ is required, so specify in pyproject.toml with `[tool.poetry.dependencies] python = "^3.12"`. For testing, use pytest with `pytest --asyncio-mode=auto` to handle async tests.

## Error Handling
Always wrap potentially failing code in try-except blocks: `try: result = await fetch_data() except asyncio.TimeoutError as e: print(f"Timeout: {e}")`. Handle specific library errors, like pandas' `KeyError` for missing columns (e.g., `try: df['nonexistent'] except KeyError: df['nonexistent'] = 0`). For pydantic, catch `ValidationError` (e.g., `from pydantic import ValidationError; try: item = Item(name=123) except ValidationError as e: log_error(e)`). Use FastAPI's exception handlers: `@app.exception_handler(RequestValidationError) async def validation_exception_handler(request, exc): return JSONResponse(status_code=400, content={"detail": exc.errors()})`. Log errors with `import logging; logging.error("Message")` and ensure graceful shutdown in async code via `try-finally`.

## Usage Examples
1. **Build a FastAPI Endpoint**: To create a simple async API for data retrieval, use: `from fastapi import FastAPI; import asyncio; app = FastAPI(); async def get_data(): await asyncio.sleep(1); return {"data": "fetched"}; @app.get("/") async def root(): return await get_data()`. Run with `uvicorn main:app --reload --port 8000`.
2. **Data Analysis with Pandas and Numpy**: For processing a dataset, import libraries and compute: `import pandas as pd; import numpy as np; df = pd.DataFrame({'A': [1, 2]}); result = np.mean(df['A']); print(result)  # Outputs mean value`. Use in a script: Save as analyze.py and run via `python analyze.py`.

## Graph Relationships
- Related to: coding cluster (e.g., shares tags with "coding-general" for broader scripting; connects to "web-dev" via FastAPI for API building; links to "data-science" through pandas/numpy for analysis workflows).
