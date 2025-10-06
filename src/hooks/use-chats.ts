import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from './use-auth';
import type { Message } from '@/types';

export function useChats(botId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !botId) return;

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('userId', '==', user.uid),
      where('botId', '==', botId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
        } as Message;
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, botId]);

  const saveMessage = async (message: Omit<Message, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || !botId) return;

    await addDoc(collection(db, 'chats'), {
      ...message,
      userId: user.uid,
      botId,
      createdAt: serverTimestamp(), // ✅ key fix: Firestore timestamp, not JS Date
    });
  };

  return { messages, saveMessage, loading };
}
