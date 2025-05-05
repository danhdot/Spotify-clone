import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { url } from '../../App';
import { FaSearch } from 'react-icons/fa'; // Thêm icon tìm kiếm

const Chat = () => {
  const { user } = useAuth();
  const [recentChats, setRecentChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [wsStatus, setWsStatus] = useState('disconnected');
  const ws = useRef(null);
  const messagesEndRef = useRef(null); // Ref để scroll đến tin nhắn mới nhất

  // Hàm thêm user vào recentChats
  const addToRecentChats = (newUser) => {
    setRecentChats((prev) => {
      if (!prev.some((u) => u.username === newUser.username)) {
        return [...prev, newUser];
      }
      return prev;
    });
  };

  // Kết nối WebSocket
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);
    setWsStatus('connecting');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setWsStatus('connected');
    };
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log('Received from WebSocket:', data);
      if (data.content && data.sender && data.timestamp && data.receiver) {
        setMessages((prev) => {
          const exists = prev.some(
            (msg) => msg.timestamp === data.timestamp && msg.sender === data.sender && msg.content === data.content
          );
          if (!exists && (data.sender === selectedUser?.username || data.receiver === selectedUser?.username)) {
            return [...prev, data];
          }
          return prev;
        });
        if (data.sender !== user.username) {
          addToRecentChats({ username: data.sender });
        }
        if (data.receiver !== user.username) {
          addToRecentChats({ username: data.receiver });
        }
      }
    };
    ws.current.onclose = () => {
      console.log('WebSocket disconnected, retrying...');
      setWsStatus('disconnected');
      setTimeout(() => {
        ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);
      }, 1000);
    };
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsStatus('error');
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [user.username, selectedUser]);

  // Tự scroll đến tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Tìm kiếm user
  useEffect(() => {
    if (searchQuery.trim()) {
      const fetchUsers = async () => {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${url}/api/users/?search=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const filteredUsers = data.filter((u) => u.username !== user.username);
          setSearchResults(filteredUsers);
        } else {
          console.error('Failed to fetch users:', response.status);
        }
      };
      fetchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, user.username]);

  // Lấy lịch sử tin nhắn khi chọn user
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${url}/api/messages/${selectedUser.username}/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched messages:', data);
          setMessages(data);
        } else {
          console.error('Failed to fetch messages:', response.status);
        }
      };
      fetchMessages();
    }
  }, [selectedUser]);

  // Lấy danh sách recent chats khi load trang
  useEffect(() => {
    const fetchRecentChats = async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${url}/api/recent-chats/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRecentChats(data);
      } else {
        console.error('Failed to fetch recent chats:', response.status);
      }
    };
    fetchRecentChats();
  }, [user.username]);

  const sendMessage = () => {
    if (message.trim() && ws.current && ws.current.readyState === WebSocket.OPEN && selectedUser) {
      const payload = { message: message, receiver: selectedUser.username };
      console.log('Sending message:', payload);
      ws.current.send(JSON.stringify(payload));
      setMessage('');
    } else {
      console.log('WebSocket chưa sẵn sàng hoặc chưa chọn user');
    }
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setSearchQuery('');
    setSearchResults([]);
    addToRecentChats(u);
  };

  return (
    <div className="flex h-[600px] bg-[#181818] rounded-lg">
      {/* Sidebar: Messages */}
      <div className="w-1/3 bg-[#121212] p-4 flex flex-col border-r border-[#282828]">
        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-2 bg-[#282828] text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            placeholder="Search for friends..."
          />
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute z-10 bg-[#282828] w-full max-h-40 overflow-y-auto rounded-lg shadow-lg mt-2">
              {searchResults.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="p-2 text-white hover:bg-[#383838] cursor-pointer flex items-center"
                >
                  <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
                  {u.username}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {recentChats.map((u) => (
            <div
              key={u.id || u.username}
              onClick={() => setSelectedUser(u)}
              className={`p-2 mb-2 cursor-pointer rounded flex items-center ${
                selectedUser?.username === u.username ? 'bg-[#282828]' : 'hover:bg-[#282828]'
              }`}
            >
              {/* <div className="w-10 h-10 bg-gray-600 rounded-full mr-3"></div> */}
              <span className="text-white">{u.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Khung chat */}
      <div className="w-2/3 flex flex-col bg-[#181818] p-4">
        {selectedUser ? (
          <>
            <div className="flex items-center border-b border-[#282828] pb-2 mb-4">
              {/* <div className="w-10 h-10 bg-gray-600 rounded-full mr-3"></div> */}
              <h2 className="text-xl font-bold text-white">Chat với {selectedUser.username}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.sender}-${msg.timestamp}-${index}`}
                  className={`mb-4 flex ${msg.sender === user.username ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender === user.username
                        ? 'bg-[#1DB954] text-white'
                        : 'bg-[#282828] text-white'
                    }`}
                  >
                    <p>{msg.content || 'Không có nội dung'}</p>
                    <span className="text-xs text-white block mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Điểm neo để scroll */}
            </div>
            <div className="flex mt-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-2 bg-[#282828] text-white rounded-l-full focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-[#1DB954] text-black px-4 rounded-r-full hover:bg-[#1ed760]"
                disabled={wsStatus !== 'connected'}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

// import { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { url } from '../../App';

// const Chat = () => {
//   const { user } = useAuth();
//   const [recentChats, setRecentChats] = useState([]); // Danh sách user đã chat
//   const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm
//   const [searchResults, setSearchResults] = useState([]); // Kết quả tìm kiếm
//   const [selectedUser, setSelectedUser] = useState(null); // User đang chat
//   const [messages, setMessages] = useState([]); // Tin nhắn
//   const [message, setMessage] = useState(''); // Input tin nhắn
//   const [wsStatus, setWsStatus] = useState('disconnected');
//   const ws = useRef(null);

//   // Hàm thêm user vào recentChats, kiểm tra trùng lặp
//   const addToRecentChats = (newUser) => {
//     setRecentChats((prev) => {
//       if (!prev.some((u) => u.username === newUser.username)) {
//         return [...prev, newUser];
//       }
//       return prev;
//     });
//   };

//   // Kết nối WebSocket
//   useEffect(() => {
//     const token = localStorage.getItem('access_token');
//     ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);
//     setWsStatus('connecting');

//     ws.current.onopen = () => {
//       console.log('WebSocket connected');
//       setWsStatus('connected');
//     };
//     ws.current.onmessage = (e) => {
//       const data = JSON.parse(e.data);
//       console.log('Received from WebSocket:', data);
//       if (data.content && data.sender && data.timestamp && data.receiver) {
//         setMessages((prev) => {
//           const exists = prev.some(
//             (msg) => msg.timestamp === data.timestamp && msg.sender === data.sender && msg.content === data.content
//           );
//           if (!exists && (data.sender === selectedUser?.username || data.receiver === selectedUser?.username)) {
//             return [...prev, data];
//           }
//           return prev;
//         });
//         // Thêm sender hoặc receiver vào recentChats nếu chưa có
//         if (data.sender !== user.username) {
//           addToRecentChats({ username: data.sender });
//         }
//         if (data.receiver !== user.username) {
//           addToRecentChats({ username: data.receiver });
//         }
//       }
//     };
//     ws.current.onclose = () => {
//       console.log('WebSocket disconnected, retrying...');
//       setWsStatus('disconnected');
//       setTimeout(() => {
//         ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);
//       }, 1000);
//     };
//     ws.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       setWsStatus('error');
//     };

//     return () => {
//       if (ws.current) ws.current.close();
//     };
//   }, [user.username, selectedUser]);

//   // Tìm kiếm user
//   useEffect(() => {
//     if (searchQuery.trim()) {
//       const fetchUsers = async () => {
//         const token = localStorage.getItem('access_token');
//         const response = await fetch(`${url}/api/users/?search=${searchQuery}`, {
//           headers: { 'Authorization': `Bearer ${token}` },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           const filteredUsers = data.filter((u) => u.username !== user.username);
//           setSearchResults(filteredUsers);
//         } else {
//           console.error('Failed to fetch users:', response.status);
//         }
//       };
//       fetchUsers();
//     } else {
//       setSearchResults([]);
//     }
//   }, [searchQuery, user.username]);

//   // Lấy lịch sử tin nhắn khi chọn user
//   useEffect(() => {
//     if (selectedUser) {
//       const fetchMessages = async () => {
//         const token = localStorage.getItem('access_token');
//         const response = await fetch(`${url}/api/messages/${selectedUser.username}/`, {
//           headers: { 'Authorization': `Bearer ${token}` },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           console.log('Fetched messages:', data);
//           setMessages(data);
//         } else {
//           console.error('Failed to fetch messages:', response.status);
//         }
//       };
//       fetchMessages();
//     }
//   }, [selectedUser]);

//   // Lấy danh sách recent chats khi load trang
//   useEffect(() => {
//     const fetchRecentChats = async () => {
//       const token = localStorage.getItem('access_token');
//       const response = await fetch(`${url}/api/recent-chats/`, {
//         headers: { 'Authorization': `Bearer ${token}` },
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setRecentChats(data); // Reset recentChats từ server
//       } else {
//         console.error('Failed to fetch recent chats:', response.status);
//       }
//     };
//     fetchRecentChats();
//   }, [user.username]);

//   const sendMessage = () => {
//     if (message.trim() && ws.current && ws.current.readyState === WebSocket.OPEN && selectedUser) {
//       const payload = { message: message, receiver: selectedUser.username };
//       console.log('Sending message:', payload);
//       ws.current.send(JSON.stringify(payload));
//       setMessage('');
//     } else {
//       console.log('WebSocket chưa sẵn sàng hoặc chưa chọn user');
//     }
//   };

//   const handleSelectUser = (u) => {
//     setSelectedUser(u);
//     setSearchQuery(''); // Xóa thanh tìm kiếm sau khi chọn
//     setSearchResults([]);
//     // Thêm user vào recentChats nếu chưa có
//     addToRecentChats(u);
//   };

//   return (
//     <div className="flex h-[500px] bg-[#181818] rounded-lg p-4">
//       {/* Sidebar: Recent Chats + Search */}
//       <div className="w-1/3 bg-[#282828] rounded-l-lg p-4 flex flex-col">
//         <h2 className="text-xl font-bold mb-4 text-white">Chat</h2>
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full p-2 mb-4 bg-[#383838] text-white rounded focus:outline-none"
//           placeholder="Tìm kiếm người dùng..."
//         />
//         {searchQuery && searchResults.length > 0 && (
//           <div className="absolute z-10 bg-[#282828] w-1/3 max-h-40 overflow-y-auto rounded shadow-lg mt-12">
//             {searchResults.map((u) => (
//               <div
//                 key={u.id}
//                 onClick={() => handleSelectUser(u)}
//                 className="p-2 text-white hover:bg-[#383838] cursor-pointer"
//               >
//                 {u.username}
//               </div>
//             ))}
//           </div>
//         )}
//         <div className="flex-1 overflow-y-auto">
//           <h3 className="text-sm text-gray-400 mb-2">Cuộc trò chuyện gần đây</h3>
//           {recentChats.map((u) => (
//             <div
//               key={u.id || u.username} // Dùng id nếu có, nếu không dùng username
//               onClick={() => setSelectedUser(u)}
//               className={`p-2 mb-2 cursor-pointer rounded ${
//                 selectedUser?.username === u.username ? 'bg-[#1DB954] text-black' : 'text-white hover:bg-[#383838]'
//               }`}
//             >
//               {u.username}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Khung chat */}
//       <div className="w-2/3 flex flex-col bg-[#181818] p-4">
//         {selectedUser ? (
//           <>
//             <h2 className="text-xl font-bold mb-4">Chat với {selectedUser.username}</h2>
//             <p className="text-gray-400 mb-2">Trạng thái WebSocket: {wsStatus}</p>
//             <div className="flex-1 overflow-y-auto">
//               {messages.map((msg, index) => (
//                 <div
//                   key={`${msg.sender}-${msg.timestamp}-${index}`}
//                   className={`mb-2 ${msg.sender === user.username ? 'text-right' : 'text-left'}`}
//                 >
//                   <span className="text-gray-400 text-sm">
//                     {msg.sender} ({new Date(msg.timestamp).toLocaleTimeString()}):
//                   </span>
//                   <p className="text-white">{msg.content || 'Không có nội dung'}</p>
//                 </div>
//               ))}
//             </div>
//             <div className="flex mt-2">
//               <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 className="flex-1 p-2 bg-[#282828] text-white rounded-l-md focus:outline-none"
//                 placeholder="Nhập tin nhắn..."
//                 onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//               />
//               <button
//                 onClick={sendMessage}
//                 className="bg-[#1DB954] text-black px-4 rounded-r-md hover:bg-[#1ed760]"
//                 disabled={wsStatus !== 'connected'}
//               >
//                 Gửi
//               </button>
//             </div>
//           </>
//         ) : (
//           <p className="text-gray-400">Chọn một người dùng để bắt đầu chat</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chat;