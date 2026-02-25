-- Seed Data: Tenant, Categories, and Rockfall RF160 Product
-- =============================================================

-- 1. Seed tenant
INSERT INTO public.tenants (id, name, domain, settings)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'GTC Industrial',
    'gtc.com.tr',
    '{"locale": "tr", "currency": "TRY"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed PPE categories
INSERT INTO public.categories (id, name, parent_id, attributes_schema) VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'Güvenlik Ayakkabısı',
    NULL,
    '{
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
            "upper_material": { "type": "string", "description": "Üst malzeme" },
            "outsole_material": { "type": "string", "description": "Taban malzemesi" },
            "anti_perforation": { "type": "boolean", "description": "Anti-delinme koruma" },
            "anti_perforation_material": { "type": "string", "description": "Anti-delinme malzemesi" },
            "antistatic": { "type": "boolean", "description": "Antistatik özellik" },
            "electrical_hazard": { "type": "boolean", "description": "Elektrik tehlikesi koruması (EH)" },
            "water_resistant": { "type": "boolean", "description": "Su direnci" },
            "closure_system": {
                "type": "string",
                "enum": ["Laces", "BOA", "Velcro", "Zipper", "Slip-on"],
                "description": "Bağlama sistemi"
            },
            "standard": { "type": "string", "description": "Uygunluk standardı" },
            "impact_protection_joules": { "type": "number", "description": "Çarpma koruma (Joule)" },
            "compression_protection_newtons": { "type": "number", "description": "Basma koruma (Newton)" },
            "shoe_type": {
                "type": "string",
                "enum": ["Boot", "Low-cut", "Sandal", "Wellington"],
                "description": "Ayakkabı tipi"
            },
            "lining_material": { "type": "string", "description": "Astar malzemesi" },
            "sizes_available": { "type": "string", "description": "Beden aralığı" }
        },
        "required": ["protection_class", "toe_cap_material"]
    }'::jsonb
),
(
    '11111111-1111-1111-1111-111111111102',
    'Koruyucu Eldiven',
    NULL,
    '{
        "type": "object",
        "properties": {
            "cut_resistance_level": { "type": "string", "enum": ["A","B","C","D","E","F"], "description": "Kesilme direnci seviyesi" },
            "coating_material": { "type": "string", "description": "Kaplama malzemesi" },
            "food_safe": { "type": "boolean", "description": "Gıdaya uygun mu" },
            "chemical_resistant": { "type": "boolean", "description": "Kimyasal direnci" },
            "thermal_protection": { "type": "boolean", "description": "Isı koruması" }
        },
        "required": ["cut_resistance_level"]
    }'::jsonb
),
(
    '11111111-1111-1111-1111-111111111103',
    'Baret',
    NULL,
    '{
        "type": "object",
        "properties": {
            "material": { "type": "string", "enum": ["ABS","HDPE","PC","Fibreglass"], "description": "Malzeme" },
            "ventilation": { "type": "boolean", "description": "Havalandırma" },
            "visor": { "type": "boolean", "description": "Siperlik" },
            "chin_strap": { "type": "boolean", "description": "Çene kayışı" }
        },
        "required": ["material"]
    }'::jsonb
),
(
    '11111111-1111-1111-1111-111111111104',
    'Koruyucu Gözlük',
    NULL,
    '{
        "type": "object",
        "properties": {
            "lens_material": { "type": "string", "description": "Lens malzemesi" },
            "anti_fog": { "type": "boolean", "description": "Buğu önleyici" },
            "uv_protection": { "type": "boolean", "description": "UV koruması" },
            "scratch_resistant": { "type": "boolean", "description": "Çizilme direnci" }
        },
        "required": ["lens_material"]
    }'::jsonb
),
(
    '11111111-1111-1111-1111-111111111105',
    'Gaz Dedektörü',
    NULL,
    '{
        "type": "object",
        "properties": {
            "gas_types": { "type": "string", "description": "Algılanan gaz türleri" },
            "detection_range": { "type": "string", "description": "Algılama aralığı" },
            "battery_life_hours": { "type": "number", "description": "Pil ömrü (saat)" },
            "portable": { "type": "boolean", "description": "Taşınabilir mi" }
        },
        "required": ["gas_types"]
    }'::jsonb
),
(
    '11111111-1111-1111-1111-111111111106',
    'Koruyucu Giysi',
    NULL,
    '{
        "type": "object",
        "properties": {
            "garment_type": { "type": "string", "enum": ["Coverall","Jacket","Trousers","Vest"], "description": "Giysi tipi" },
            "hi_vis": { "type": "boolean", "description": "Yüksek görünürlük" },
            "flame_retardant": { "type": "boolean", "description": "Alev geciktirici" },
            "waterproof": { "type": "boolean", "description": "Su geçirmez" }
        },
        "required": ["garment_type"]
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Rockfall RF160 product
INSERT INTO public.products (tenant_id, category_id, brand, sku, name, description, metadata, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '11111111-1111-1111-1111-111111111101',
    'Rockfall',
    'RF160',
    'Rockfall Ohm RF160 Elektrikçi Güvenlik Botu',
    'Rockfall Ohm RF160, 18kV AC Elektrik Tehlikesi (EH) korumasına sahip, ASTM F2412-24 test yöntemlerine uygun güvenlik botudur. BOA® Fit System ile hassas ayar, %100 metal olmayan yapı, fibreglass burun koruma (200J darbe), Activ-Step® aramid fiber anti-delinme tabanlığı ve çift yoğunluklu EVA nitrile kauçuk taban sunar.',
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
)
ON CONFLICT (tenant_id, sku) DO NOTHING;
