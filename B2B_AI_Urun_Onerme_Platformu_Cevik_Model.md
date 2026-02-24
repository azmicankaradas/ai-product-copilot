
# B2B Yapay Zeka Destekli Ürün Önerme Platformu Mimari Dokümanı  
## (Çevik Ölçekleme Modeli)

---

## 1. Yönetici Özeti (Executive Summary)

Bu doküman, B2B sektörüne yönelik, yapay zeka destekli, ölçeklenebilir bir ürün önerme platformunun mimari temelini tanımlamaktadır. Sistem, en hızlı şekilde canlıya alınmak üzere tasarlanmıştır; ilk günden itibaren çoklu kiracı (multi-tenant) yapısını, sayısız markayı, tüm Kişisel Koruyucu Donanım (KKD) kategorilerini ve gelişmiş LLM tabanlı anlamsal (semantic) aramayı destekler.

---

## 2. Hızlı Geliştirme ve Pazar Vizyonu

### Aşama 1 (Çekirdek MVP - İlk 6 Hafta)
- Tüm KKD kategorilerini kapsayan dinamik veritabanı altyapısı  
- Deterministik + vektör tabanlı arama  

### Aşama 2 (Veri Otomasyonu - Takip Eden 4 Hafta)
- Üretici PDF’lerinden otonom veri çekimi  
- Self-servis multi-tenant onboarding  

### Aşama 3 (Büyüme - Sürekli)
- ERP entegrasyonları (SAP, Oracle)  
- Proaktif AI satış asistanları  

---

## 3. Genel Kapsam (Tüm KKD Kategorileri & Çoklu Müşteri)

- **Müşteri:** Sınırsız (GTC, diğer distribütörler vb.)  
- **Katalog:** Ayakkabı, eldiven, baret, gaz dedektörü, tekstil vb.  
- **Kullanıcılar:** Satın Alma Yöneticileri ve Platform Yöneticileri  
- **Temel İşlev:** En uygun ürünleri eşleştirme ve açıklama üretme  

---

## 4. Sistem Mimarisi

- **Frontend:** Next.js (App Router, SSR)  
- **Backend:** Node.js (NestJS önerilir)  
- **Database:** PostgreSQL (Supabase) + pgvector  
- **AI:** Claude Opus 4.6 + Embedding modelleri  

---

## 5. Veritabanı Tasarımı (Multi-Tenant & Çoklu Kategori)

### Tablolar

**tenants**
- id
- name
- domain
- config_json
- created_at

**users**
- id
- tenant_id (FK)
- role_id
- email
- password_hash

**categories**
- id
- name
- parent_id
- attributes_schema (JSONB)

**products**
- id
- tenant_id (FK)
- category_id (FK)
- sku
- name
- base_price
- metadata (JSONB)

**product_embeddings**
- id
- product_id (FK)
- embedding (vector)
- content_hash

---

## 6. Dinamik Ürün Ontolojisi & Attribute Modelleme

### Ortak Alanlar
- SKU
- İsim
- Açıklama
- Marka
- Görsel

### Kategoriye Özel Alanlar (JSONB)

**Ayakkabı**
- protection_class (S1, S2, S3)
- toe_cap_material
- slip_resistance (SRA, SRB, SRC)

**Eldiven**
- cut_resistance_level
- coating_material
- food_safe

**Gözlük**
- lens_material
- anti_fog
- uv_protection

---

## 7. Eşleştirme Motoru (Matching Engine)

### Faz 1 (Hybrid)
1. Sorgu embedding'e dönüştürülür  
2. pgvector ile similarity search  
3. Deterministik filtreleme  

### Faz 2 (Otonom)
- LLM tabanlı SQL + Vector query üretimi  
- Agentic RAG yaklaşımı  

---

## 8. Yapay Zeka Katmanı

- Semantic search  
- LLM explainability  
- Context window optimizasyonu  

---

## 9. Hızlı Veri İçeri Aktarma (Ingestion Pipeline)

### Toplu Yükleme
- Excel/CSV  
- Schema validation  
- Asenkron embedding üretimi  

### Akıllı Yükleme
- PDF parsing  
- Multimodal LLM extraction  
- Zod şema doğrulama  

---

## 10. Güvenlik (RBAC) & Veri İzolasyonu

- Platform Super Admin  
- Tenant Admin  
- Sales Rep  

Supabase RLS zorunlu uygulanacaktır.

---

## 11. API Mimarisi

- RESTful  
- Versioned: `/api/v1/`  

### Kritik Endpointler
- POST `/api/v1/search`  
- POST `/api/v1/products/ingest`  
- GET `/api/v1/categories/:id/schema`  

---

## 12. Frontend Mimarisi

- Next.js  
- Tailwind + shadcn/ui  
- Zustand  
- React Query  
- Dynamic JSON-schema forms  

---

## 13. Teknoloji Yığını

| Katman | Teknoloji |
|--------|------------|
| Frontend | Next.js |
| Backend | Node.js (NestJS) |
| DB | PostgreSQL + pgvector |
| AI | Claude Opus 4.6 |
| Queue | BullMQ + Redis |

---

## 14. Agresif Geliştirme Yol Haritası (10 Hafta)

### Sprint 1-3
- DB + RLS  
- CRUD API  
- Excel ingestion  

### Sprint 4-6
- pgvector  
- Hybrid search  
- LLM explainability  

### Sprint 7-8
- Frontend  
- Dynamic forms  

### Sprint 9-10
- PDF parsing  
- UAT  
- Lansman  

---

## 15. Riskler ve Mitigasyon

- LLM Hallucination → Strict grounding  
- Veri kalitesi → Zorunlu schema validation  

---

## 16. Ölçeklenebilirlik

- HNSW indexing  
- Redis caching  
- Stateless backend  

