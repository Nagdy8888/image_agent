# image_tagging

LangGraph image tagging agent: graph entry point, builder, configuration, and all nodes.


| File / Folder      | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| `image_tagging.py` | Entry point; exports compiled graph                          |
| `graph_builder.py` | StateGraph construction (nodes, edges)                       |
| `configuration.py` | Runtime config (thresholds, model names)                     |
| `settings.py`      | Environment variable loading                                 |
| `taxonomy.py`      | Tag taxonomy (allowed values per category)                   |
| `utils.py`         | Agent utilities                                              |
| `nodes/`           | Graph nodes (preprocessor, vision, taggers, validator, etc.) |
| `prompts/`         | Vision and tagger prompt templates                           |
| `schemas/`         | State TypedDict and tag Pydantic models                      |
| `tools/`           | Tool assembly and registration                               |


