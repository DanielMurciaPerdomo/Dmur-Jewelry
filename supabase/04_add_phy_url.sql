-- Migration: Add phy_url column to products table
-- Dmur Jewelry - Proyecto Supabase
-- Esta migración agrega el campo phy_url para rutas físicas de imágenes

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS phy_url TEXT;

-- Optional: Add a comment to explain the field
COMMENT ON COLUMN public.products.phy_url IS 'Ruta física del archivo de imagen (solo para uso administrativo)';