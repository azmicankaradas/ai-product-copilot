-- Migration: Add brand column to products table + seed Rockfall RF160 product
-- =============================================================================

-- 1. Add brand column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;

-- 2. Create index on brand for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);

-- 3. Update the shoe category attributes_schema to include all relevant fields
UPDATE public.categories
SET attributes_schema = '{
    "type": "object",
    "properties": {
        "protection_class": {
            "type": "string",
            "enum": ["SB", "S1", "S1P", "S2", "S3", "S4", "S5", "S6", "S7"],
            "description": "Koruma sınıfı (EN ISO 20345)"
        },
        "toe_cap_material": {
            "type": "string",
            "enum": ["Steel", "Fibreglass", "Composite", "Aluminum"],
            "description": "Burun koruma malzemesi"
        },
        "slip_resistance": {
            "type": "string",
            "enum": ["SRA", "SRB", "SRC", "SR"],
            "description": "Kayma direnci sınıfı"
        },
        "upper_material": {
            "type": "string",
            "description": "Üst malzeme"
        },
        "outsole_material": {
            "type": "string",
            "description": "Taban malzemesi"
        },
        "anti_perforation": {
            "type": "boolean",
            "description": "Anti-delinme koruma tabanlığı var mı"
        },
        "anti_perforation_material": {
            "type": "string",
            "description": "Anti-delinme tabanlık malzemesi"
        },
        "antistatic": {
            "type": "boolean",
            "description": "Antistatik özellik"
        },
        "electrical_hazard": {
            "type": "boolean",
            "description": "Elektrik tehlikesi koruması (EH)"
        },
        "water_resistant": {
            "type": "boolean",
            "description": "Su direnci / suya dayanıklılık"
        },
        "closure_system": {
            "type": "string",
            "enum": ["Laces", "BOA", "Velcro", "Zipper", "Slip-on"],
            "description": "Bağlama sistemi"
        },
        "standard": {
            "type": "string",
            "description": "Uygunluk standardı"
        },
        "impact_protection_joules": {
            "type": "number",
            "description": "Çarpma koruma değeri (Joule)"
        },
        "compression_protection_newtons": {
            "type": "number",
            "description": "Basma koruma değeri (Newton)"
        },
        "shoe_type": {
            "type": "string",
            "enum": ["Boot", "Low-cut", "Sandal", "Wellington"],
            "description": "Ayakkabı tipi"
        },
        "lining_material": {
            "type": "string",
            "description": "Astar malzemesi"
        },
        "sizes_available": {
            "type": "string",
            "description": "Mevcut beden aralığı"
        }
    },
    "required": ["protection_class", "toe_cap_material"]
}'::jsonb
WHERE name = 'Güvenlik Ayakkabısı';

-- 4. Seed Rockfall RF160 product
-- NOTE: Uses the first tenant and shoe category from initial seed.
--       Adjust the tenant_id and category_id UUIDs if they differ in your DB.

INSERT INTO public.products (tenant_id, category_id, brand, sku, name, description, metadata, is_active)
SELECT
    t.id,
    c.id,
    'Rockfall',
    'RF160',
    'Rockfall Ohm RF160 Elektrikçi Güvenlik Botu',
    'Rockfall Ohm RF160, 18kV AC Elektrik Tehlikesi (EH) korumasına sahip, ASTM F2412-24 test yöntemlerine uygun güvenlik botudur. BOA® Fit System ile hassas ayar, %100 metal olmayan yapı, fibreglass burun koruma (200J darbe), Activ-Step® aramid fiber anti-delinme tabanlığı ve çift yoğunluklu EVA nitrile kauçuk taban sunar. Su itici nubuck kaplı deri üst malzeme ve geri dönüştürülmüş köpük ayak yatağı ile hem güvenlik hem de konfor sağlar.',
    '{
        "protection_class": "S1P",
        "toe_cap_material": "Fibreglass",
        "slip_resistance": "SR",
        "upper_material": "Water Repellent Nubuck Coated Leather, Polyester Mesh",
        "outsole_material": "Dual-density EVA + Nitrile Rubber",
        "anti_perforation": true,
        "anti_perforation_material": "Activ-Step Aramid Fibre",
        "antistatic": true,
        "electrical_hazard": true,
        "water_resistant": true,
        "closure_system": "BOA",
        "standard": "EN ISO 20345:2022 + A1:2024",
        "impact_protection_joules": 200,
        "compression_protection_newtons": 15000,
        "shoe_type": "Boot",
        "lining_material": "100% Polyester Mesh",
        "sizes_available": "36-48",
        "scuff_cap": "EPR",
        "footbed": "Activ-Step PU foam, Recycled Polyester",
        "eh_voltage": "18kV AC",
        "eh_standard": "ASTM F2412-24",
        "non_metallic": true
    }'::jsonb,
    true
FROM public.tenants t, public.categories c
WHERE t.name = 'GTC Industrial'
  AND c.name = 'Güvenlik Ayakkabısı'
LIMIT 1;
