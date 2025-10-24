# Quick Guide: Add a Mermaid Syntax Example

## 1. Open the Examples File

```bash
backend/app/mermaid_examples.py
```

## 2. Add Your Example

Scroll to `MERMAID_SYNTAX_EXAMPLES` list and add:

```python
    (
        "Your error description",
        """❌ Bad code here""",
        """✅ Good code here""",
        "Why it matters"
    ),
```

## 3. Example Template

Copy and paste this:

```python
    (
        "Brief description of error type",
        """flowchart TD
    BadNode[Label]
    BadNode --> Other""",
        """flowchart TD
    GoodNode["Label"]
    GoodNode --> Other""",
        "Explanation of what was fixed and why"
    ),
```

## 4. Real Example

```python
    (
        "Node ID with dash causing parse error",
        """flowchart TD
    API-Gateway["API Gateway"]
    API-Gateway --> Backend""",
        """flowchart TD
    APIGateway["API Gateway"]
    APIGateway --> Backend""",
        "Dashes in node IDs can be confused with arrow syntax. Use underscores or camelCase instead."
    ),
```

## 5. Save and Restart

```bash
# Restart backend to load new examples
docker-compose restart backend
# OR if running locally:
# Stop and restart your Python server
```

## 6. Test

Generate a diagram and check if the AI avoids the error.

---

**That's it!** The AI will now reference your example when generating diagrams.

For more details, see `EXAMPLES_README.md`
