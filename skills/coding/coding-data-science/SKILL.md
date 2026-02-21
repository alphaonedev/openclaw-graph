---
name: coding-data-science
cluster: coding
description: "Data science meta: Python + R + Julia for ML, wrangling, visualization, statistical modeling, notebooks"
tags: ["data-science","ml","statistics","coding"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "data science machine learning statistics notebook analysis python r julia"
---

# coding-data-science

## Purpose
This skill allows OpenClaw to handle data science tasks using Python, R, and Julia, focusing on machine learning, data wrangling, visualization, statistical modeling, and notebook execution. It integrates these languages to enable seamless code execution and analysis.

## When to Use
Use this skill when users need to process datasets, build ML models, or perform statistical analysis. Apply it for tasks like exploratory data analysis in Jupyter notebooks, training models with scikit-learn in Python, or visualizing data with ggplot2 in R. Avoid it for non-data tasks like web development.

## Key Capabilities
- Execute Python code for data manipulation (e.g., via pandas) and ML (e.g., scikit-learn).
- Run R scripts for statistical modeling (e.g., using glm) and visualization (e.g., ggplot2).
- Support Julia for high-performance computing in ML (e.g., Flux.jl).
- Handle notebook formats like Jupyter for interactive sessions.
- Integrate with libraries: Python's numpy for arrays, R's dplyr for data wrangling, Julia's DataFrames.jl.
- Process large datasets with memory-efficient methods, such as Python's dask for parallel computing.

## Usage Patterns
To use this skill, invoke OpenClaw via CLI or API, specifying the language and code. Always set the environment variable `$OPENCLAW_API_KEY` for authentication. For example, prefix commands with the skill ID: `openclaw execute --skill coding-data-science`. Use JSON config files for multi-step workflows, e.g., {"lang": "python", "code": "import pandas as pd"}. Chain tasks by piping outputs, like running a Python script that generates data for an R visualization.

## Common Commands/API
Use the OpenClaw CLI for direct execution:
- Command: `openclaw execute --skill coding-data-science --lang python --code "import pandas as pd; print(pd.read_csv('data.csv').head())" --output json`
  - Flags: --lang specifies language (python, r, julia); --code provides inline code; --output formats results (e.g., json for parsing).
- API Endpoint: POST to /api/v1/execute with payload: {"skill": "coding-data-science", "lang": "r", "code": "library(dplyr); summary(iris)"}
  - Headers: Include Authorization: Bearer $OPENCLAW_API_KEY.
- Config Format: Use YAML for scripts, e.g.,
    ```
    lang: julia
    code: using Statistics; mean([1,2,3])
    ```
- Code Snippet: For Python ML:
    ```
    from sklearn.linear_model import LinearRegression
    model = LinearRegression().fit(X, y)
    predictions = model.predict(X_test)
    ```
- Code Snippet: For R visualization:
    ```
    library(ggplot2)
    ggplot(iris, aes(Sepal.Length, Sepal.Width)) + geom_point()
    ```

## Integration Notes
Integrate this skill with environments by setting up virtual environments: use `pip install pandas` for Python or `install.packages("dplyr")` for R via OpenClaw's pre-execution hooks. For Jupyter notebooks, pass notebook files directly: `openclaw execute --skill coding-data-science --lang notebook --file my_notebook.ipynb`. Handle dependencies in a config file, e.g., JSON: {"dependencies": {"python": ["pandas"], "r": ["ggplot2"]}}. Use env vars for secrets, like `$DATA_API_KEY` in code snippets. Ensure compatibility by specifying versions, e.g., Python 3.8+ for certain ML libraries.

## Error Handling
Check for language-specific errors: in Python, catch ImportErrors for missing packages; in R, handle non-numeric arguments in functions. Use OpenClaw's error codes: 400 for syntax issues, 500 for runtime failures. Always wrap code in try-except blocks, e.g.,
```
try:
    import missing_library  # This will raise ImportError
except ImportError as e:
    print(f"Error: {e}")
```
For R: Use tryCatch(), e.g.,
```
tryCatch({
    summary(iris)
}, error = function(e) print(paste("Error:", e)))
```
Log outputs with `--verbose` flag in CLI commands. If authentication fails (e.g., missing $OPENCLAW_API_KEY), retry with proper env setup.

## Concrete Usage Examples
1. **Data Wrangling in Python**: To clean and analyze a CSV file, run: `openclaw execute --skill coding-data-science --lang python --code "import pandas as pd; df = pd.read_csv('data.csv'); df.dropna(inplace=True); print(df.head())"`. This loads, cleans, and previews data in one command.
2. **ML Model in R**: For training a simple linear model: Use API: POST /api/v1/execute with {"skill": "coding-data-science", "lang": "r", "code": "model <- lm(Sepal.Length ~ Sepal.Width, data=iris); summary(model)"}. This fits the model and outputs summary statistics.

## Graph Relationships
- Related to: coding-general (shares base coding capabilities)
- Depends on: ml-frameworks (for advanced ML integrations)
- Connected to: data-visualization (via visualization tools in Python/R/Julia)
- Overlaps with: statistics-analysis (for statistical modeling subsets)
