# Rappi Store Availability Intelligence Dashboard
### RappiMakers 2026 — Prueba Técnica

---

## 🏗️ Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS v4 |
| **Backend** | FastAPI + Pydantic v2 + Uvicorn |
| **IA local** | TensorFlow.js + Universal Sentence Encoder |
| **Data viz** | Recharts |
| **State** | Zustand + TanStack Query |
| **ETL** | Python + Pandas |

---

## 🚀 Setup en 3 pasos

### 1. Pipeline ETL (generar data.json)

```bash
python3 data-pipeline/etl.py
```

Procesa los 201 CSVs en `data/` y genera `data-pipeline/output/data.json`.

### 2. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API disponible en: `http://localhost:8000/api/docs`

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

App disponible en: `http://localhost:5173`

---

## 📁 Estructura del proyecto

```
rappi-dashboard/
├── data/                          # CSVs originales
├── data-pipeline/
│   ├── etl.py                     # Pipeline ETL
│   └── output/data.json           # Datos procesados
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py                # FastAPI app
│       ├── models/schemas.py      # Pydantic v2 models
│       ├── services/data_service.py  # lru_cache singleton
│       └── routers/               # health / metrics / analytics
└── frontend/
    ├── index.html                 # CDN: TF.js + USE
    ├── vite.config.ts             # Proxy /api → :8000
    └── src/
        ├── App.tsx                # Pages + routing
        ├── api/client.ts          # TanStack Query hooks
        ├── store/useStore.ts      # Zustand store
        ├── hooks/useAIChat.ts     # TF.js USE hook
        ├── lib/format.ts          # Number formatters
        ├── types/index.ts         # TypeScript interfaces
        └── components/
            ├── kpi/KpiCard.tsx
            └── chat/ChatPanel.tsx
```

---

## 🤖 Cómo funciona el chatbot IA local

1. **ENCODE** — La pregunta del usuario se convierte en un vector de 512 dimensiones usando `Universal Sentence Encoder` corriendo en el browser via TF.js.
2. **MATCH** — Se calcula la similitud coseno entre el vector de la pregunta y 12 documentos pre-codificados con hechos extraídos del CSV.
3. **RESPOND** — Se retorna la respuesta del documento más similar (threshold: 0.28). Sin llamadas a APIs externas.

---

## 📊 Datos

- **Métrica**: `synthetic_monitoring_visible_stores`
- **Período**: Feb 01–11, 2026
- **Resolución**: 10 segundos por medición
- **Peak**: 6,198,472 tiendas (Feb 06)
- **Uptime**: 98.7% en horas operativas
