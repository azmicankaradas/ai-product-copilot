-- Rockfall Complete Product Seed Data
-- ====================================
-- 5 products: RF108 Fly, RF115 Bantam, RF140 Volta, RF160 Ohm, RF170 Granite
-- Run AFTER seed.sql (tenant + categories must exist)
-- Uses ON CONFLICT to be idempotent

-- Delete existing RF160 if seeded earlier (to avoid duplicate)
DELETE FROM public.products WHERE sku = 'RF160' AND brand = 'Rockfall';

-- ============================================================
-- 1. RF108 Fly — Lightweight Safety Trainer
-- ============================================================
INSERT INTO public.products (tenant_id, category_id, brand, sku, name, description, metadata, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '11111111-1111-1111-1111-111111111101',
    'Rockfall',
    'RF108',
    'Rockfall Fly RF108 Güvenlik Ayakkabısı',
    'Rockfall Fly RF108, hafif ve atletik tasarımlı S3S güvenlik ayakkabısıdır. %100 geri dönüştürülmüş polyester mesh üst malzeme, fibreglass burun koruma, Activ-Step® delinmeye dayanıklı tabanlık ve %61 bio-bazlı EVA orta taban içerir. Activ-Step® Adherence kayma önleyici kauçuk taban ile yağ, su ve glikol dahil çeşitli yüzeylerde üstün kavrama sağlar. Vegan Society onaylı, FSC sertifikalı ambalaj. Otomotiv, tesis yönetimi ve depolama sektörlerine uygundur.',
    '{
        "protection_class": "S3",
        "toe_cap_material": "Fibreglass",
        "slip_resistance": "SR",
        "upper_material": "100% Post Consumer Recycled Polyester Mesh + Heat Laminated TPU Cage",
        "outsole_material": "Activ-Step Adherence, 61% Bio-EVA (USDA Certified) + Rubber Outsole",
        "anti_perforation": true,
        "anti_perforation_material": "Activ-Step Penetration Resistant",
        "antistatic": true,
        "electrical_hazard": false,
        "water_resistant": true,
        "closure_system": "Laces",
        "standard": "EN ISO 20345:2022 S3S FO SR",
        "impact_protection_joules": 200,
        "compression_protection_newtons": 15000,
        "shoe_type": "Low-cut",
        "lining_material": "100% Post Consumer Recycled Polyester Mesh",
        "sizes_available": "UK 3-13",
        "weight_grams": 488,
        "height_inches": 3,
        "non_metallic": true,
        "vegan_friendly": true,
        "fuel_oil_resistant": true,
        "bio_based_materials": true,
        "recycled_materials": true,
        "technologies": ["Activ-Step Adherence", "FSC", "USDA BioPreferred", "Vegan Society"],
        "industries": ["Automotive and Aerospace", "Facility Management", "Warehousing and Logistics"],
        "certification_ce": "ITASLNB24012236",
        "certification_ce_expiry": "2029-07-16"
    }'::jsonb,
    true
);

-- ============================================================
-- 2. RF115 Bantam — Midcut Safety Trainer
-- ============================================================
INSERT INTO public.products (tenant_id, category_id, brand, sku, name, description, metadata, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '11111111-1111-1111-1111-111111111101',
    'Rockfall',
    'RF115',
    'Rockfall Bantam RF115 Midcut Güvenlik Ayakkabısı',
    'Rockfall Bantam RF115, bilek desteği sunan midcut tasarımlı S3S güvenlik ayakkabısıdır. Su itici %100 geri dönüştürülmüş polyester mesh üst, fibreglass burun koruma, Activ-Step® delinmeye dayanıklı tabanlık, %61 bio-bazlı EVA orta taban ve Activ-Step® Adherence kayma önleyici kauçuk taban içerir. Tamamen vegan, FSC sertifikalı ambalaj. Otomotiv, tesis yönetimi ve depolama sektörlerine uygundur.',
    '{
        "protection_class": "S3",
        "toe_cap_material": "Fibreglass",
        "slip_resistance": "SR",
        "upper_material": "100% Post Consumer Recycled Polyester Mesh, Heat Laminated TPU Cage",
        "outsole_material": "Activ-Step Adherence, 61% Bio-EVA (USDA Certified) + Rubber Outsole",
        "anti_perforation": true,
        "anti_perforation_material": "Activ-Step Penetration Resistant",
        "antistatic": true,
        "electrical_hazard": false,
        "water_resistant": true,
        "closure_system": "Laces",
        "standard": "EN ISO 20345:2022 S3S FO SR",
        "impact_protection_joules": 200,
        "compression_protection_newtons": 15000,
        "shoe_type": "Boot",
        "lining_material": "100% Post Consumer Recycled Polyester Mesh",
        "sizes_available": "UK 3-13",
        "weight_grams": 528,
        "height_inches": 5,
        "non_metallic": true,
        "vegan_friendly": true,
        "fuel_oil_resistant": true,
        "bio_based_materials": true,
        "recycled_materials": true,
        "technologies": ["Activ-Step Adherence", "FSC", "USDA BioPreferred", "Vegan Society"],
        "industries": ["Automotive and Aerospace", "Facility Management", "Warehousing and Logistics"],
        "certification_ce": "ITASLNB4012236",
        "certification_ce_expiry": "2029-07-16"
    }'::jsonb,
    true
);

-- ============================================================
-- 3. RF140 Volta — EH Safety Trainer with BOA
-- ============================================================
INSERT INTO public.products (tenant_id, category_id, brand, sku, name, description, metadata, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '11111111-1111-1111-1111-111111111101',
    'Rockfall',
    'RF140',
    'Rockfall Volta RF140 Elektrikçi Güvenlik Ayakkabısı',
    'Rockfall Volta RF140, yüksek voltajlı ortamlar için tasarlanmış EH (Elektrik Tehlikesi) güvenlik ayakkabısıdır. ASTM F2412-24 test yöntemlerine göre 18kV AC elektrik tehlikesi koruması sunar. BOA® Fit System ile hassas ayar, %100 metal olmayan yapı, fibreglass burun koruma (200J), Activ-Step® delinmeye dayanıklı tabanlık ve çift yoğunluklu EVA + nitrile kauçuk taban içerir. Otomotiv, havacılık, mühendislik, elektrikli araç, offshore ve demiryolu sektörlerine uygundur.',
    '{
        "protection_class": "S1P",
        "toe_cap_material": "Fibreglass",
        "slip_resistance": "SR",
        "upper_material": "100% Polyester Mesh, Durable TPU Cage",
        "outsole_material": "EPR Midsole + Nitrile Rubber",
        "anti_perforation": true,
        "anti_perforation_material": "Activ-Step Penetration Resistant",
        "antistatic": false,
        "electrical_hazard": true,
        "water_resistant": true,
        "closure_system": "BOA",
        "standard": "EN ISO 20345:2022 SB E PS WPA FO SR + ASTM F2412-24 I/C EH PR",
        "impact_protection_joules": 200,
        "compression_protection_newtons": 15000,
        "shoe_type": "Low-cut",
        "lining_material": "100% Polyester Mesh",
        "sizes_available": "UK 3-13",
        "weight_grams": 533,
        "height_inches": 3,
        "non_metallic": true,
        "vegan_friendly": true,
        "fuel_oil_resistant": true,
        "recycled_materials": true,
        "eh_voltage": "18kV AC",
        "eh_standard": "ASTM F2412-24",
        "technologies": ["Traction Lite", "BOA", "FSC"],
        "industries": ["Automotive and Aerospace", "Engineering", "Electric Vehicle", "Facility Management", "Offshore", "Rail"],
        "certification_ce": "2777/15450-04/E00-00",
        "certification_ce_expiry": "2030-10-23",
        "certification_astm": "2503035"
    }'::jsonb,
    true
);

-- ============================================================
-- 4. RF160 Ohm — EH Safety Boot with BOA
-- ============================================================
INSERT INTO public.products (tenant_id, category_id, brand, sku, name, description, metadata, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '11111111-1111-1111-1111-111111111101',
    'Rockfall',
    'RF160',
    'Rockfall Ohm RF160 Elektrikçi Güvenlik Botu',
    'Rockfall Ohm RF160, 18kV AC Elektrik Tehlikesi (EH) korumasına sahip ASTM F2412-24 uyumlu güvenlik botudur. BOA® Fit System ile hassas ayar, %100 metal olmayan yapı, fibreglass burun koruma (200J darbe), Activ-Step® aramid fiber anti-delinme tabanlığı ve çift yoğunluklu EVA + nitrile kauçuk taban sunar. Su itici nubuck kaplı deri üst malzeme ile hem güvenlik hem de konfor sağlar.',
    '{
        "protection_class": "S1P",
        "toe_cap_material": "Fibreglass",
        "slip_resistance": "SR",
        "upper_material": "Water Repellent Nubuck Coated Leather, 100% Polyester Mesh",
        "outsole_material": "EPR Midsole + Nitrile Rubber",
        "anti_perforation": true,
        "anti_perforation_material": "Activ-Step Aramid Fibre",
        "antistatic": true,
        "electrical_hazard": true,
        "water_resistant": true,
        "closure_system": "BOA",
        "standard": "EN ISO 20345:2022 SB E PS WPA FO SR + ASTM F2413-24 I/C EH PR",
        "impact_protection_joules": 200,
        "compression_protection_newtons": 15000,
        "shoe_type": "Boot",
        "lining_material": "100% Polyester Mesh",
        "sizes_available": "UK 3-13",
        "weight_grams": 728,
        "height_inches": 6,
        "non_metallic": true,
        "fuel_oil_resistant": true,
        "recycled_materials": true,
        "scuff_cap": "EPR",
        "footbed": "Activ-Step PU foam, Recycled Polyester",
        "eh_voltage": "18kV AC",
        "eh_standard": "ASTM F2412-24",
        "technologies": ["Activ-Step", "BOA", "FSC"],
        "industries": ["Automotive and Aerospace", "Electric Vehicle", "Engineering", "Facility Management", "Highways", "Offshore", "Rail"],
        "certification_ce": "2777/15447-03E00-00",
        "certification_ce_expiry": "2030-09-09",
        "certification_astm": "2503046"
    }'::jsonb,
    true
);

-- ============================================================
-- 5. RF170 Granite — Heavy-Duty Safety Boot (Steel Toecap)
-- ============================================================
INSERT INTO public.products (tenant_id, category_id, brand, sku, name, description, metadata, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '11111111-1111-1111-1111-111111111101',
    'Rockfall',
    'RF170',
    'Rockfall Granite RF170 Ağır Hizmet Güvenlik Botu',
    'Rockfall Granite RF170, en zorlu şantiyeler için tasarlanmış ağır hizmet güvenlik botudur. LWG Gold sertifikalı tam tahıl deri üst malzeme, çelik burun koruma (200J), Activ-Step® delinmeye dayanıklı tabanlık, FORCE10® nitrile kauçuk taban ve IMPACT SHIELD™ kazma plakası içerir. Soğuk yalıtım (CI), ısı yalıtımı (HI), 300°C ısıya dayanıklı taban (HRO), sürtünme koruma (SC) ve yakıt yağına dirençli (FO) özelliklere sahiptir. İnşaat, mühendislik, döküm, otoyol, maden ve demiryolu sektörlerine uygundur.',
    '{
        "protection_class": "S3",
        "toe_cap_material": "Steel",
        "slip_resistance": "SR",
        "upper_material": "Water Repellent Full Grain Leather, LWG Gold Certified",
        "outsole_material": "FORCE10 Nitrile Rubber",
        "anti_perforation": true,
        "anti_perforation_material": "Activ-Step Penetration Resistant",
        "antistatic": true,
        "electrical_hazard": false,
        "water_resistant": true,
        "closure_system": "Laces",
        "standard": "EN ISO 20345:2022 S3S CI HI HRO SC FO SR",
        "impact_protection_joules": 200,
        "compression_protection_newtons": 15000,
        "shoe_type": "Boot",
        "lining_material": "100% Polyester Mesh",
        "sizes_available": "UK 3-15",
        "weight_grams": 883,
        "height_inches": 5,
        "non_metallic": false,
        "fuel_oil_resistant": true,
        "recycled_materials": true,
        "cold_insulation": true,
        "heat_insulation": true,
        "heat_resistant_outsole": true,
        "heat_resistant_outsole_temp": 300,
        "scuff_cap": "FORCE10 TPU",
        "digging_plate": "Impact Shield Polypropylene",
        "kick_protector": "TPU",
        "technologies": ["FORCE10", "FSC", "Impact Shield"],
        "industries": ["Construction", "Engineering", "Foundry", "Highways", "Quarry and Mining", "Rail", "Utilities"],
        "certification_ce": "2777/15487-02/E00-00",
        "certification_ce_expiry": "2030-04-10"
    }'::jsonb,
    true
);
