# Task wa-7 + wa-8: Fix Frontend WhatsApp API Paths & Socket Event Names

## Summary
Fixed all frontend API path mismatches and socket event name mismatches between the WhatsApp frontend components/hooks and the actual backend API routes / mini-service.

## Part 1: API Path Fixes (13 occurrences across 4 files)

All occurrences of `/api/maintenance/whatsapp/` replaced with `/api/whatsapp/`:

### `src/components/maintenance/whatsapp-complaint.tsx` (7 fixes)
- Line 112: GET conversations list
- Line 123: GET single conversation detail
- Line 134: GET conversation messages (query)
- Line 149: POST file message (fetch with XTransformPort)
- Line 156: POST text message
- Line 175: PUT mark conversation as read
- Line 264: PUT star/unstar message

### `src/components/maintenance/whatsapp-inbox-detail.tsx` (3 fixes)
- Line 144: POST add internal note
- Line 165: PUT update conversation priority
- Line 181: PUT close conversation

### `src/components/maintenance/whatsapp-convert-dialog.tsx` (1 fix)
- Line 99: POST convert conversation to ticket/work order

### `src/components/maintenance/whatsapp-assign-dialog.tsx` (2 fixes)
- Line 63: GET agents list
- Line 84: POST assign/transfer conversation

### No fixes needed:
- `whatsapp-contact-info.tsx` — pure display component, no API calls
- `whatsapp-message-input.tsx` — uses parent callbacks, no direct API calls

## Part 2: Socket Event Name Fixes in `src/hooks/use-whatsapp-socket.ts`

### Emit events (6 changes):
| Old Event | New Event | Context |
|-----------|-----------|---------|
| `agent:subscribe` | `subscribe-agent` | on connect, subscribeAgent callback |
| `agent:unsubscribe` | `unsubscribe-agent` | on cleanup, unsubscribeAgent callback |
| `conversation:join` | `join-room` | joinConversation callback |
| `conversation:leave` | `leave-room` | leaveConversation callback |

### Listen events (2 changes):
| Old Event | New Event |
|-----------|-----------|
| `message:new` | `new-message` |
| `conversation:updated` | `conversation-update` |

### Unchanged (already correct):
- `typing` — emit and listen match mini-service
- `notification` — dynamic event from HTTP bridge
- `dashboard:updated` — dynamic event from HTTP bridge

## Mini-service verification: `mini-services/whatsapp-realtime/index.ts`
No fixes needed — the mini-service already uses the correct event names:
- `subscribe-agent`, `unsubscribe-agent`, `join-room`, `leave-room`, `typing`

## Verification
- `rg "/api/maintenance/whatsapp/"` in src/ → 0 results (all fixed)
- `bun run lint` → 0 errors
