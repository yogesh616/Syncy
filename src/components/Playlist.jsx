import { useParams } from 'react-router-dom';
import { getDocs, query, collection, where, doc,  getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
function Playlist() {
  const { id } = useParams(); // Extracts the id from the URL
  console.log(id); // Logs the playlist ID
const [user, setUser] = useState(null)
const [ playlistSongs, setPlaylistSongs ] = useState([])

   useEffect(() => {
    
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
         setUser(currentUser)
         getPlaylistSongs(id, currentUser?.uid);
          
        } else {
         setUser(null)
        }
      });
  
      
      return () => unsubscribe();
   }, [])
  

  
  
  useEffect(() => {
    getPlaylistSongs(id, user?.uid);
  }, [user])



  const getPlaylistSongs = async (playlistId) => {
    try {
      // Reference the playlist document directly by ID
      const playlistRef = doc(db, "playlists", playlistId);
      const playlistDoc = await getDoc(playlistRef);
  
      if (playlistDoc.exists()) {
        const playlist = playlistDoc.data();
        setPlaylistSongs(playlist.songs || []); // Set playlist songs
        console.log("Playlist songs:", playlist.songs);
      } else {
        console.error("No playlist found for the given playlist ID.");
        setPlaylistSongs([]);
      }
    } catch (error) {
      console.error("Error fetching playlist songs:", error);
    }
  };

  
  

  return (
    <div>
      <h1>Playlist ID: {id}</h1>
      {/* Other components or logic related to the playlist */}
    </div>
  );
}

export default Playlist;
