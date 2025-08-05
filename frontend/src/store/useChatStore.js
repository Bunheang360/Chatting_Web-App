import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/user');
      
      // Normalize user data to match frontend expectations
      const normalizedUsers = res.data.map(user => ({
        ...user,
        profilePic: user.profilepic || user.profilePic || "",
        fullName: user.fullname || user.fullName || ""
      }));
      
      set({ users: normalizedUsers});
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data});
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  }, 

  sendMessage: async (messageData) => {
    const {selectedUser, messages} = get();
    
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser.id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.log("No socket found. Aborting subscribe.");
      return;
    }

    console.log("Subscribing to socket events...");

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);

      const selectedUser = useChatStore.getState().selectedUser;
      const authUser = useAuthStore.getState().authUser;

      console.log("AuthUser:", authUser?.id);
      console.log("SelectedUser:", selectedUser?.id);
      console.log("Message From:", newMessage.senderID, "To:", newMessage.receiverID);

      const isMessageForCurrentChat =
        (newMessage.senderID == selectedUser?.id && newMessage.receiverID == authUser?.id) ||
        (newMessage.senderID == authUser?.id && newMessage.receiverID == selectedUser?.id);

      if (!isMessageForCurrentChat) {
        console.log("Not for this chat. Ignoring.");
        return;
      }

      useChatStore.setState((prev) => ({
        messages: [...prev.messages, newMessage],
      }));

      console.log("Message added to chat state.");
    });
  },




  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

}));