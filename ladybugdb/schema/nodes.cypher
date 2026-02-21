CREATE NODE TABLE Skill(
  id STRING,
  name STRING,
  cluster STRING,
  description STRING,
  tags STRING[],
  authorization_required BOOLEAN DEFAULT false,
  scope STRING DEFAULT 'general',
  model_hint STRING DEFAULT 'claude-sonnet',
  embedding_hint STRING DEFAULT '',
  skill_path STRING DEFAULT '',
  clawhub_install STRING DEFAULT '',
  PRIMARY KEY(id)
);
