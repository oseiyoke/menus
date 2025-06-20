-- Add discovery fields to menus table
ALTER TABLE menuapp_menus 
ADD COLUMN is_discoverable BOOLEAN DEFAULT false,
ADD COLUMN discovery_tags TEXT[],
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN star_count INTEGER DEFAULT 0;

-- Create user_menu_stars table for tracking who starred what
CREATE TABLE IF NOT EXISTS menuapp_user_menu_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menuapp_menus(id) ON DELETE CASCADE,
  user_fingerprint TEXT NOT NULL, -- Anonymous user identifier (browser fingerprint)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(menu_id, user_fingerprint)
);

-- Indexes for performance
CREATE INDEX idx_menuapp_menus_discoverable ON menuapp_menus(is_discoverable) WHERE is_discoverable = true;
CREATE INDEX idx_menuapp_menus_discovery_tags ON menuapp_menus USING GIN(discovery_tags) WHERE is_discoverable = true;
CREATE INDEX idx_menuapp_menus_star_count ON menuapp_menus(star_count DESC) WHERE is_discoverable = true;
CREATE INDEX idx_menuapp_user_menu_stars_user ON menuapp_user_menu_stars(user_fingerprint);

-- Function to update star count when stars are added/removed
CREATE OR REPLACE FUNCTION update_menu_star_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE menuapp_menus 
    SET star_count = star_count + 1 
    WHERE id = NEW.menu_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE menuapp_menus 
    SET star_count = star_count - 1 
    WHERE id = OLD.menu_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update star counts
CREATE TRIGGER trigger_update_menu_star_count
  AFTER INSERT OR DELETE ON menuapp_user_menu_stars
  FOR EACH ROW EXECUTE FUNCTION update_menu_star_count();

-- Function to increment view count (called from API)
CREATE OR REPLACE FUNCTION increment_view_count(menu_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE menuapp_menus 
  SET view_count = view_count + 1 
  WHERE id = menu_id;
END;
$$ LANGUAGE plpgsql; 