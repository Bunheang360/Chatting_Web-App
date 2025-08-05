import { useChatStore } from "../store/useChatStore";

import Sidebar from "../Components/SideBar";
import NoChatSelected from "../Components/NoChatSelected";
import ChatContainer from "../Components/ChatContainer";
const HomePage = () => {
  const { selectedUser } = useChatStore();
  
  return (
    <div className="h-screen bg-base-200">
      {/* Desktop and tablet layout */}
      <div className="hidden lg:flex items-center justify-center pt-20 px-4 pb-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden h-full pt-16 pb-20">
        {/* Show sidebar when no user is selected */}
        {!selectedUser && (
          <div className="h-full">
            <Sidebar />
          </div>
        )}
        
        {/* Show chat when user is selected */}
        {selectedUser && (
          <div className="h-full">
            <ChatContainer />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;