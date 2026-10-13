import type { ChatRepository } from '../../domain/repositories/ChatRepository';
let repository: ChatRepository | undefined;
export function configureChatRepository(adapter: ChatRepository) { repository = adapter; }
function getRepository() {
  if (!repository) throw new Error('Chat repository has not been configured');
  return repository;
}
export const chatService: ChatRepository = {
  createConnection: username => getRepository().createConnection(username),
  streamAnswer: (...args) => getRepository().streamAnswer(...args),
};
