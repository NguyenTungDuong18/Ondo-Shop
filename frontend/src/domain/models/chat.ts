export interface ChatMessage {
  id: string;
  senderId: string;
  sender: string;
  receiverId: string | null;
  roomId: string | null;
  text: string;
  timestamp: string;
}
export interface ChatUser { id: string; username: string; isOnline: boolean }
export interface ChatRoom { id: string; name: string; inviteCode: string; inviteExpiresAt: string }
export interface ChatFriendship { requesterId: string; recipientId: string; accepted: boolean }
export interface ChatState { users: ChatUser[]; rooms: ChatRoom[]; friends: ChatFriendship[]; messages: ChatMessage[] }
