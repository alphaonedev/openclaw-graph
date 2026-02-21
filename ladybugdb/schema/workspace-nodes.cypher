-- AlphaOne LadybugDB — Workspace Node Tables
-- Phase 1: Graph-native workspace files
-- These tables replace SOUL.md, MEMORY.md, TOOLS.md, AGENTS.md flat files.

CREATE NODE TABLE Soul(
  id STRING,
  workspace STRING DEFAULT 'sentinel',
  section STRING,
  content STRING,
  priority INT64 DEFAULT 5,
  protected BOOLEAN DEFAULT false,
  PRIMARY KEY(id)
);

CREATE NODE TABLE Memory(
  id STRING,
  workspace STRING DEFAULT 'sentinel',
  domain STRING,
  content STRING,
  timestamp STRING DEFAULT '',
  PRIMARY KEY(id)
);

CREATE NODE TABLE Tool(
  id STRING,
  name STRING,
  available BOOLEAN DEFAULT true,
  notes STRING DEFAULT '',
  PRIMARY KEY(id)
);

CREATE NODE TABLE AgentConfig(
  id STRING,
  workspace STRING DEFAULT 'sentinel',
  key STRING,
  value STRING,
  PRIMARY KEY(id)
);
