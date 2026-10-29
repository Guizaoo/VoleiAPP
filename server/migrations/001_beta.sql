CREATE TABLE users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), google_sub text UNIQUE NOT NULL,
 email text UNIQUE NOT NULL, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE uploads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 object_key text UNIQUE NOT NULL, width integer NOT NULL, height integer NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 caption text NOT NULL CHECK (length(caption) <= 300), upload_id uuid REFERENCES uploads,
 court_id text, created_at timestamptz NOT NULL DEFAULT now(), CHECK (length(trim(caption)) > 0 OR upload_id IS NOT NULL)
);
CREATE INDEX posts_created ON posts(created_at DESC);
CREATE TABLE comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES posts ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE, text text NOT NULL CHECK (length(trim(text)) BETWEEN 1 AND 200),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comments_post ON comments(post_id, created_at);
CREATE TABLE likes (
 post_id uuid NOT NULL REFERENCES posts ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 PRIMARY KEY(post_id, user_id)
);
CREATE TABLE saved_posts (
 post_id uuid NOT NULL REFERENCES posts ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 PRIMARY KEY(post_id, user_id)
);
