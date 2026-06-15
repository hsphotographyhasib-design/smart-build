# Task wa-6: Rewrite WhatsApp API Routes for OpenWA

## Agent: Main Orchestrator

## Summary
Rewrote 10 WhatsApp API routes in SmartBuild ERP to use the OpenWA client (`src/lib/openwa-client.ts`) instead of Meta's WhatsApp Business Graph API. All routes now use the new Prisma schema (WhatsAppAccount with sessionId/status/qrCode, WhatsAppContact with waId/phoneNumber, WhatsAppConversation with waChatId, WhatsAppMessage with direction/mediaUrl/senderName).

## Routes Modified

### 1. `src/app/api/whatsapp/account/route.ts`
- **GET**: Returns account info with live OpenWA session status polling. Maps OpenWA status (CONNECTED, SCANNING, etc.) to internal status (connected, scanning, disconnected).
- **POST**: Creates OpenWA session via `createSession()`, polls for QR code, stores session in DB.
- **PUT**: Updates account settings (name, maxDailyMessages, isActive, businessName).
- **DELETE**: Stops and deletes OpenWA session via `stopSession()`/`deleteSession()`, resets DB record.

### 2. `src/app/api/whatsapp/send/route.ts`
- **POST**: Sends text/media/document messages via `sendTextMessage()`, `sendMediaMessage()`, `sendDocument()`. Supports template variable substitution. Upserts contact and conversation in Prisma.

### 3. `src/app/api/whatsapp/webhook/route.ts`
- **GET**: Returns 200 OK (health check).
- **POST**: Handles OpenWA webhook payloads (multiple formats). Extracts messages, upserts contacts, finds/creates conversations, saves messages with full media info extraction (images, video, audio, documents, locations, contacts, stickers). Emits socket events to `conversation:{id}` and `whatsapp` rooms. Includes AI classification and STATUS command auto-reply.

### 4. `src/app/api/whatsapp/contacts/route.ts`
- **GET**: Lists contacts from Prisma with search, isBusiness, isBlocked filters and pagination.

### 5. `src/app/api/whatsapp/conversations/route.ts`
- **GET**: Lists conversations with tab filtering (unread, open, assigned_to_me, archived), status/priority/assignedTo filters, search, and pagination.

### 6. `src/app/api/whatsapp/conversations/[id]/route.ts`
- **GET**: Full conversation detail with messages, contact, account, assignedTo, complaintLink.
- **PUT**: Update status, priority, isArchived, assignedTo, groupName.
- **DELETE**: Archive conversation (sets isArchived=true, status=closed).

### 7. `src/app/api/whatsapp/conversations/[id]/messages/route.ts`
- **GET**: Paginated messages (desc order, reversed for ascending response).
- **POST**: Send message in conversation via OpenWA with text/media support.

### 8. `src/app/api/whatsapp/conversations/[id]/read/route.ts`
- **POST**: Marks all unread incoming messages as read, resets unreadCount, emits socket events.

### 9. `src/app/api/whatsapp/qr/route.ts` (NEW)
- **GET**: Polls OpenWA for QR code. Creates session if none exists. Returns QR base64 and session status. Returns 503 with stored QR if OpenWA is unavailable.

### 10. `src/app/api/whatsapp/bot/route.ts`
- **POST**: Handles bot commands (menu, menu_selection, status_query, create_complaint). Sends replies via OpenWA `sendTextMessage()`. Stores bot messages in DB.

## Key Changes from Meta API to OpenWA
- **No more `graph.facebook.com/v21.0` calls** — all messaging goes through OpenWA REST API
- **No more `accessToken`/`phoneNumberId`** — uses `sessionId` for OpenWA auth
- **Socket events** use `{ room, event, data }` format (not just `{ event, data }`)
- **Prisma schema aligned** — all creates include `updatedAt` where required
- **Media handling** uses OpenWA's `sendMediaMessage`/`sendDocument` instead of Meta API payloads
- **Chat ID formatting** — `phone@s.whatsapp.net` format required by OpenWA

## Verification
- ESLint: 0 errors, 0 warnings
- TypeScript: 0 errors in all 10 rewritten route files
- Dev server: Running successfully