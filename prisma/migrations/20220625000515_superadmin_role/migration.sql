-- This is an empty migration.

INSERT INTO roles (name, permissions) VALUES ('super_admin', ARRAY ['SUPER']::"Permission"[])
