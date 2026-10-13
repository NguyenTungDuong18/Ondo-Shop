require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { ChatTestView } = require('../src/presentation/features/chat/components/ChatTestView.tsx');
const noop = () => {};
function model() {
  const friend = { id: 'bob', username: 'Bob', isOnline: false };
  return {
    username: 'Alice', userId: 'alice', users: [friend], rooms: [], friends: [], friendship: () => ({ accepted: true }),
    activeChatTarget: 'user:bob', activeUser: friend, setActiveChatTarget: noop,
    isConnected: true, connectionStatus: 'Connected', messageText: '', setMessageText: noop,
    messagesContainerRef: { current: null }, filteredMessages: [{ id: 'm1', senderId: 'bob', sender: 'Bob', receiverId: 'alice', roomId: null, text: 'Tin nhắn đã lưu', timestamp: '2026-10-13T03:00:00Z' }],
    handleSendMessage: noop, roomName: '', setRoomName: noop, joinCode: '', setJoinCode: noop,
    createRoom: noop, joinRoom: noop, search: '', setSearch: noop, busy: false, act: noop,
    now: Date.parse('2026-10-13T03:00:00Z'), canMessage: true,
  };
}
test('offline friend and saved conversation remain visible without elapsed offline time', () => {
  const html = renderToString(React.createElement(ChatTestView, { model: model() }));
  assert.match(html, /Bob/);
  assert.match(html, /Offline/);
  assert.match(html, /Tin nhắn đã lưu/);
  assert.match(html, /Nội dung tin nhắn/);
  assert.doesNotMatch(html, /hoạt động.*trước|offline.*phút trước/i);
});
test('disconnected viewer keeps the conversation and disables send', () => {
  const m = { ...model(), isConnected: false, connectionStatus: 'Disconnected', messageText: 'Draft' };
  const html = renderToString(React.createElement(ChatTestView, { model: m }));
  assert.match(html, /Tin nhắn đã lưu/);
  assert.match(html, /aria-label="Gửi tin nhắn" disabled=""/);
});
test('online friend has active label and green indicator', () => {
  const m = model(); m.activeUser.isOnline = true;
  const html = renderToString(React.createElement(ChatTestView, { model: m }));
  assert.match(html, /Đang hoạt động/);
  assert.match(html, /bg-emerald-500/);
});
test('expired room code disappears while room conversation stays usable', () => {
  const m = model(); m.activeUser = undefined;
  m.activeRoom = { id: 'r1', name: 'Phòng thử', inviteCode: '123456', inviteExpiresAt: '2026-10-13T02:59:59Z' };
  m.activeChatTarget = 'room:r1'; m.rooms = [m.activeRoom];
  const html = renderToString(React.createElement(ChatTestView, { model: m }));
  assert.match(html, /Mã tham gia đã hết hạn/);
  assert.doesNotMatch(html, /123456/);
  assert.match(html, /Nội dung tin nhắn/);
});
