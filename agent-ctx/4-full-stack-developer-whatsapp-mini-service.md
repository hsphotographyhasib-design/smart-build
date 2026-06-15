# Task 4 — WhatsApp Mini Service Agent Work Record

## Task
Create the WhatsApp Real-Time mini service using Socket.IO at `mini-services/whatsapp-realtime/`.

## Files Created
- `mini-services/whatsapp-realtime/package.json` — Package config with socket.io@4.8.3, `bun --hot` dev script
- `mini-services/whatsapp-realtime/index.ts` — Full Socket.IO server + HTTP Bridge

## Architecture Decisions

### Two-Server Design (Ports 3006 + 3096)
Socket.IO with `path: '/'` (required for Caddy routing) intercepts ALL HTTP requests on the same port, returning `{"code":0,"message":"Transport unknown"}` for non-Socket.IO requests. To avoid this conflict, the HTTP Bridge runs on a **separate HTTP server on port 3096** while Socket.IO runs on port 3006.

- **Port 3006** — Socket.IO WebSocket server (client connections via `/?XTransformPort=3006`)
- **Port 3096** — HTTP Bridge (server-to-server, `POST /api/events`)

### Rooms
| Room | Purpose |
|------|---------|
| `whatsapp` | Global — all connected WhatsApp agents |
| `conversation-{id}` | Per-conversation message/typing updates |
| `agent-{userId}` | Per-agent notifications |
| `contact-{contactId}` | Per-contact info updates |

### Events
- **Client→Server**: `join-room`, `leave-room`, `subscribe-agent`, `unsubscribe-agent`, `typing`
- **Server→Client** (via HTTP Bridge): `message:new`, `message:sent`, `message:read`, `conversation:updated`, `conversation:new`, `contact:updated`, `ticket:linked`, `typing`, `dashboard:updated`, `notification`
- **System**: `service:heartbeat` every 60s

### HTTP Bridge API
```
POST http://localhost:3096/api/events
Content-Type: application/json

{ "room": "whatsapp", "event": "message:new", "data": { ... } }

Response: { "success": true, "room": "whatsapp", "event": "message:new" }
```

## Validation
- All client events validate input (non-empty strings, required payload fields)
- HTTP Bridge validates: required `room`/`event` fields, room name regex (`^[a-zA-Z0-9\-:]+$`), valid JSON
- Returns 400 for validation errors, 404 for non-matching routes

## Test Results
- ✅ Startup: no crash within 3 seconds
- ✅ Socket.IO handshake on port 3006: valid SID, correct pingInterval/pingTimeout
- ✅ HTTP Bridge: successful event emission
- ✅ HTTP Bridge validation: missing room, invalid room, missing event all return proper errors
- ✅ HTTP Bridge 404: GET requests and unknown paths return 404
- ✅ Service running in background on both ports