

// // src/components/admin/AdminPlaylist.jsx
// import { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const AdminPlaylist = () => {
//   const [playlists, setPlaylists] = useState([]);
//   const [newPlaylistName, setNewPlaylistName] = useState('');
//   const [selectedPlaylist, setSelectedPlaylist] = useState(null);
//   const [songs, setSongs] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch all playlists
//   useEffect(() => {
//     const fetchPlaylists = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch('http://127.0.0.1:8000/api/playlists/');
//         const data = await response.json();
//         setPlaylists(data);
//       } catch (error) {
//         toast.error('Lỗi khi tải danh sách playlist');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPlaylists();
//   }, []);

//   // Create new playlist
//   const handleCreatePlaylist = async () => {
//     if (!newPlaylistName.trim()) {
//       toast.warning('Vui lòng nhập tên playlist');
//       return;
//     }

//     try {
//       const response = await fetch('http://127.0.0.1:8000/api/playlists/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: newPlaylistName,
//           user: 1, // Thay bằng user ID thực tế
//         }),
//       });

//       const data = await response.json();
//       setPlaylists([...playlists, data]);
//       setNewPlaylistName('');
//       toast.success('Tạo playlist thành công');
//     } catch (error) {
//       toast.error('Lỗi khi tạo playlist');
//     }
//   };

//   // Delete playlist
//   const handleDeletePlaylist = async (id) => {
//     if (window.confirm('Bạn chắc chắn muốn xóa playlist này?')) {
//       try {
//         await fetch(`http://127.0.0.1:8000/api/playlists/${id}/`, {
//           method: 'DELETE',
//         });
//         setPlaylists(playlists.filter(playlist => playlist.id !== id));
//         toast.success('Xóa playlist thành công');
//       } catch (error) {
//         toast.error('Lỗi khi xóa playlist');
//       }
//     }
//   };

//   // View playlist songs
//   const handleViewSongs = async (playlist) => {
//     setSelectedPlaylist(playlist);
//     try {
//       const response = await fetch(`http://127.0.0.1:8000/api/playlists/${playlist.id}/songs/`);
//       const data = await response.json();
//       setSongs(data);
//     } catch (error) {
//       toast.error('Lỗi khi tải danh sách bài hát');
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-6">Quản lý Playlist</h1>
      
//       {/* Create new playlist */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold mb-4">Tạo Playlist mới</h2>
//         <div className="flex gap-4">
//           <input
//             type="text"
//             value={newPlaylistName}
//             onChange={(e) => setNewPlaylistName(e.target.value)}
//             placeholder="Nhập tên playlist"
//             className="flex-1 p-2 border rounded"
//           />
//           <button
//             onClick={handleCreatePlaylist}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Tạo mới
//           </button>
//         </div>
//       </div>

//       {/* Playlists list */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold mb-4">Danh sách Playlist</h2>
//         {loading ? (
//           <p>Đang tải...</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="py-2 px-4 border">ID</th>
//                   <th className="py-2 px-4 border">Tên</th>
//                   <th className="py-2 px-4 border">Người tạo</th>
//                   <th className="py-2 px-4 border">Thao tác</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {playlists.map((playlist) => (
//                   <tr key={playlist.id} className="hover:bg-gray-50">
//                     <td className="py-2 px-4 border">{playlist.id}</td>
//                     <td className="py-2 px-4 border">{playlist.name}</td>
//                     <td className="py-2 px-4 border">{playlist.user}</td>
//                     <td className="py-2 px-4 border flex gap-2">
//                       <button
//                         onClick={() => handleViewSongs(playlist)}
//                         className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                       >
//                         Xem bài hát
//                       </button>
//                       <button
//                         onClick={() => handleDeletePlaylist(playlist.id)}
//                         className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                       >
//                         Xóa
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Playlist songs */}
//       {selectedPlaylist && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4">
//             Bài hát trong playlist: {selectedPlaylist.name}
//           </h2>
//           {songs.length > 0 ? (
//             <div className="overflow-x-auto">
//               <table className="min-w-full bg-white border">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="py-2 px-4 border">ID</th>
//                     <th className="py-2 px-4 border">Tên bài hát</th>
//                     <th className="py-2 px-4 border">Nghệ sĩ</th>
//                     <th className="py-2 px-4 border">Album</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {songs.map((song) => (
//                     <tr key={song.id} className="hover:bg-gray-50">
//                       <td className="py-2 px-4 border">{song.id}</td>
//                       <td className="py-2 px-4 border">{song.title}</td>
//                       <td className="py-2 px-4 border">
//                         {song.artists.map(a => a.name).join(', ')}
//                       </td>
//                       <td className="py-2 px-4 border">{song.album?.title || '-'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p>Không có bài hát nào trong playlist này</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminPlaylist;