import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaTimes, FaPlay, FaPause, FaHeadphones, FaHeart as FaHeartRegular, FaHeart as FaHeartSolid} from 'react-icons/fa';
import { MdOutlineVolumeOff, MdOutlineVolumeUp } from "react-icons/md";
import { usePlayer } from '../Context/Context';
import Loader from './Loader';
import './player.css'
import TopArtist from './TopArtist';
import AppDrawer from './AppDrawer';
import axios from 'axios';
import musicPng from '../assets/music.png'
import './flip.css';
//import * as Tone from "tone";
//import Lottie from 'react-lottie'
import person from '../assets/person.json'
import { useSwipeable } from 'react-swipeable';
import './playlist.css'
import box from '../assets/box.json'
import Sleep from './Sleep';
import Animation from './Animation';

let myFavorites = [];



// Google Authentication
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, provider, db } from '../firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, arrayUnion, getDoc, arrayRemove } from 'firebase/firestore';

// long press


const MusicDiscover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [favorite, setFavorite] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('Songs');
  const [searchArtist, setSearchArtist] = useState('');
  const [artistSongs, setArtistSongs] = useState([]);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  
  const {audioQuality, setAudioQuality, pausedTime, setPausedTime, currentSong, setCurrentSong,  musicDuration, currentTime, setMusicDuration, setCurrentTime,  audioRef, isPlaying, setIsPlaying, playSong, Latest, isOpen, toggleDrawer, TopArtists, isArtistOpen, toggleArtistDrawer, isCategoryOpen, toggleCategoryDrawer } = usePlayer();
  const [isLoading, setIsLoading] = useState(false);
   const [progress, setProgress] = useState(0)
  
  const [categoryData, setCategoryData] = useState([]);
  const [CategorySongs, setCategorySongs] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
 
  const [songUrl, setSongUrl] = useState(null);
  const base_url = import.meta.env.VITE_API_URL;

  const qualities = [
    { id: 0, label: 'Poor Quality' },
    { id: 1, label: 'Low Quality' },
    { id: 2, label: 'Medium Quality' },
    { id: 3, label: 'High Quality' },
  ];

  const handleQualityChange = (id) => {
    setAudioQuality(id);
    localStorage.setItem('quality', id);
  };

  const isChecked = (id) => audioQuality === id;


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const modal = useRef(null);

  const showModal = () => {
    if (modal.current) {
      modal.current.classList.remove('translate-x-full');
      modal.current.classList.add('transform-none');
    }
  }

  const hideModal = () => {
    if (modal.current) {
      modal.current.classList.remove('transform-none');
      modal.current.classList.add('translate-x-full');
    }
  }

  const qualityRef = useRef(null);

  const toggleQualityRef = () => {
      
      if (qualityRef.current) {
        qualityRef.current.classList.toggle('hidden')
      }
  }

  // active tab is selected

  


  useEffect(()=> {
    if (myFavorites.length == 0) {
      const fetchDataFromLocalStorage = localStorage.getItem('last_played');
      if (fetchDataFromLocalStorage) {
        const fetchedSongs = JSON.parse(fetchDataFromLocalStorage);
        myFavorites = fetchedSongs;
        
      }
    }
  }, []);
  
  // implimenting dark mode
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage to see if dark mode is already enabled
    const savedMode = localStorage.getItem('dark-mode');
    return savedMode === 'true' || false;
  });

  // Toggle dark mode class on the root html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save the user's preference in localStorage
    localStorage.setItem('dark-mode', darkMode);
  }, [darkMode]);

    

  const handleMuteToggle = () => {
    setIsMuted(prev => {
        audioRef.current.muted = !prev; // Set the muted value based on the updated state
        return !prev;
    });
}




useEffect(() => {
  const handleEnded = () => {
    setIsPlaying(false);
    // Additional logic like playing the next song could go here
   // setIsPlaying(true);
   audioRef.current.play();
    setIsPlaying(true);
  };

  audioRef.current.addEventListener('ended', handleEnded);

  // Cleanup event listener on component unmount
  return () => {
    audioRef.current.removeEventListener('ended', handleEnded);
  };
}, [audioRef.current]);


useEffect(() => {
  const handleLoadedMetadata = () => {
    setMusicDuration(audioRef.current.duration);  // Set the total duration
  };

  audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

  return () => {
    audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
  };
}, [audioRef.current]);

useEffect(() => {
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);  // Update the played time
  };

  audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

  return () => {
    audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
  };
}, [audioRef.current]);


const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};




  

  useEffect(() => {
    const handleEnded = () => {
      setIsPlaying(false);
      // Additional logic like playing the next song could go here
     // setIsPlaying(true);
     audioRef.current.play();
      setIsPlaying(true);
    };
  
    audioRef.current.addEventListener('ended', handleEnded);
  
    // Cleanup event listener on component unmount
    return () => {
      audioRef.current.removeEventListener('ended', handleEnded);
    };
  }, [audioRef.current]);

  
 

    // Function to play offline songs


// useEffect to handle playback logic
useEffect(() => {
  let blobUrl;

  if (isPlaying && currentSong) {
    try {
      let sourceUrl;
      

     // console.log('currentSong:', currentSong); // Check the structure of currentSong
     // console.log('downloadUrl:', currentSong.downloadUrl); // Check if downloadUrl is present
      //console.log('audioBlob:', currentSong.audioBlob); // Check if audioBlob is present

      // Check if the song has a downloadUrl (URL-based source)
      if (currentSong.downloadUrl && typeof currentSong.downloadUrl === 'string') {
        if (currentSong.downloadUrl.startsWith('blob:')) {
          // If it's a Blob URL, use it directly
          sourceUrl = currentSong.downloadUrl;
        } else {
          // For normal URLs, use the downloadUrl
          sourceUrl = currentSong.downloadUrl;
        }
      } else if (currentSong.audioBlob) {
        // For offline songs with audioBlob, create a URL from the Blob
        blobUrl = URL.createObjectURL(currentSong.audioBlob);
        sourceUrl = blobUrl;
       
      } else {
        throw new Error('Invalid audio source.');
      }

      // Set the audio source and play
      audioRef.current.src = sourceUrl;
      audioRef.current
        .play()
        .then(() => console.log('Playing audio'))
        .catch((error) => console.error('Error playing audio:', error));
    } catch (error) {
      console.error('Error setting audio source:', error);
    }
  } else {
    // Pause the audio if not playing
    audioRef.current.pause();
  }

  // Cleanup Blob URL on unmount or song change
  return () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrl = null;
    }
    // Ensure audio is reset
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };
}, [isPlaying, currentSong]);




     
   
  
    const handleSongClick = (song) => {
      
      const formattedSong = {
        title: song.name,
        name: song.primaryArtists,
        albumArt: song.image[2].link || song.albumArt,
        downloadUrl: song.downloadUrl[audioQuality].link || song.downloadUrl,  // Ensure this link exists
      };
      
      setCurrentSong(formattedSong);  // Set the new song
      playSong(formattedSong);  // Start playing the song
      setIsPlayerVisible(true);  // Show the player UI
      setSongUrl(formattedSong.downloadUrl);
    };
    
    


    const togglePlayPause = (song) => {
      let sourceUrl;
    
      // For online songs, use the download URL
      if (song.downloadUrl && typeof song.downloadUrl === 'string') {
        sourceUrl = song.downloadUrl;
      } else if (song.audioBlob && song.audioBlob instanceof Blob) {
        // For offline songs, create a URL from the audioBlob
        sourceUrl = URL.createObjectURL(song.audioBlob);
      } else {
        console.error('Invalid audio source.');
        return;
      }
    
      // Set the player visibility when a song starts
      setIsPlayerVisible(true);
      setCurrentSong(song); // Update the currentSong state
    
      const isSameSong = audioRef.current.src === sourceUrl;
    
      if (isPlaying && isSameSong) {
        // If the song is playing, pause it and save the current time
        setPausedTime(audioRef.current.currentTime);
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // If it's a new song or we are resuming, handle accordingly
        if (!isSameSong) {
          setPausedTime(0); // Reset the paused time if it's a new song
    
          // Set the audio source and play the audio
          audioRef.current.src = sourceUrl;
          audioRef.current.play()
            .then(() => {
              console.log('Playing audio');
            })
            .catch((error) => {
              console.error('Error playing audio:', error);
            });
    
          setIsPlaying(true);
        } else {
          // If it's the same song, resume from the paused time
          audioRef.current.currentTime = pausedTime;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    };
    
    
    
    useEffect(() => {
      const audio = audioRef.current;
      const updateProgress = () => {
        const currentProgress = (audio.currentTime / audio.duration) * 100 || 0;
        setProgress(currentProgress);
      };
      // Add event listener for `timeupdate`
      audio.addEventListener("timeupdate", updateProgress);
      // Cleanup event listener
      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
      };
    }, []);
  
    
  
    const handleProgressChange = (e) => {
      const newTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(e.target.value);
    };
    
    const fetchData = useCallback(async function getData() {
      try {
        const search = searchQuery || 'mitraz' 
        const response  = await axios.get(`${base_url}/search/songs?query=${search}&limit=20&page=1`);
        const data =  response.data;
        const formattedSongs = data.data.results.map((song) => ({
          ...song,
          formattedDuration: formatDuration(song.duration),
        }));
        setSongs(formattedSongs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    }, [searchQuery])
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery);  // Update debounced query after delay
  }, 500);  // 500ms debounce time

  // Cleanup function to clear timeout if searchQuery changes before delay
  return () => clearTimeout(timer);
}, [searchQuery]);

// Triggering fetchData after debouncedQuery change
useEffect(() => {
  if (debouncedQuery) {
    fetchData();
  }
}, [debouncedQuery]);

   
// first rendering
useEffect(() => {
  fetchData()
  handleCategories('hindi');
}, [])


const inputRef = useRef(null)
  


  const handleSearch = () => {
    setSearchQuery('')
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} min`;
  };

 
 // Load favorite songs from localStorage on component mount
 useEffect(() => {
  try {
    const storedFavorites = localStorage.getItem('favoriteSongs');
    const favoriteSongs = storedFavorites ? JSON.parse(storedFavorites) : [];
    setFavorite(favoriteSongs);
  } catch (error) {
    console.error('Error parsing favorite songs from localStorage:', error);
    setFavorite([]);
  }
}, []);

useEffect(() => {
  if (currentSong) {
    const isSongFavorite = favorite.some(fav => fav.id === currentSong.id);
    setIsFavorite(isSongFavorite);
    setSongUrl(currentSong.downloadUrl)
  }
}, [currentSong, favorite]);

const handleFavorite = (song) => {
  try {
    const storedFavorites = localStorage.getItem('favoriteSongs');
    const favoriteSongs = storedFavorites ? JSON.parse(storedFavorites) : [];
    const isAlreadyFavorite = favoriteSongs.some(fav => fav.id === song.id);

    const updatedFavorites = isAlreadyFavorite
      ? favoriteSongs.filter(fav => fav.id !== song.id)
      : [...favoriteSongs, song];

    localStorage.setItem('favoriteSongs', JSON.stringify(updatedFavorites));
    setFavorite(updatedFavorites);
    setIsFavorite(!isAlreadyFavorite); // Toggle the state
  } catch (error) {
    console.error('Error handling favorite status:', error);
  }
};
const isSongFavorite = (songId) => {
  return favorite.some(fav => fav.id === songId);
};

async function getArtistSongs(search) {
  try {
    setIsLoading(true);
    const response = await axios.get(`${base_url}/search/songs?query=${search}&limit=20&page=1`);
    const data = await response.data;
    setArtistSongs(data.data.results)
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching songs:", error);
    setArtistSongs([]);
    setIsLoading(false);
  }
}

async function handleCategories(category) {
  try {
    const res = await axios.get(`${base_url}/modules?language=${category}`)
    const data = await res.data;
    setCategoryData(data.data.charts);
  }
  catch (error) {
    console.error('Error fetching categories:', error);
  }
}



async function getCategorySongs(id) {
  try {
    setIsLoading(true);
    const res = await axios.get(`${base_url}/playlists?id=${id}`)
    const data = await res.data;
    setCategorySongs(data.data.songs)
    setIsLoading(false);
  }
  catch (error) {
    console.error('Error fetching category songs:', error);
  }
}

const handleDownload = (song) => {
  const fileUrl = song.downloadUrl;
  

  fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = song.title; // Use the original file name
          document.body.appendChild(a);
          a.click();
          a.remove();
      })
      .catch(err => console.error('Error downloading the file:', err));
};

const swipeHandlers = useSwipeable({
  onSwipedDown: () => setIsPlayerVisible(false),  // Hide player on swipe down
  onSwipedUp: () => setIsPlayerVisible(true),    // Show player on swipe up
});
 
const [isDrawerOpen, setIsDrawerOpen] = useState(isOpen);

  // Swipe handlers for the drawer
  const swipeFavorites = useSwipeable({
    onSwipedDown: () => {
      setIsDrawerOpen(false); // Close the drawer on swipe down
    },
    onSwipedUp: () => {
      setIsDrawerOpen(true); // Open the drawer on swipe up
    },
  });
 


 // Authentication handlers with playlist 

 const [ user, setUser ] = useState(null);
 
 async function HandleGoogleLogin() {
  try {
    const result = await signInWithPopup(auth, provider);
  
    setUser(result.user);
  }
  catch (error) {
    console.error('Error logging in with Google:', error);
  }
 }

 async function HandleSignOut() {
  try {
    await signOut(auth);
  
    setUser(null);
  }
  catch (error) {
    console.error('Error signing out:', error);
  }
 }


 useEffect(() => {
  
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
      } else {
        setUser(null);
      }
    });

    
    return () => unsubscribe();
 }, [])


 // playlist support

const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

const togglePlaylist = () => {
  
  setIsPlaylistOpen(!isPlaylistOpen);
};
 
const [playlists, setPlaylists] = useState([]);
const [playlistName, setPlaylistName] = useState('');
const [playlistCategory, setPlaylistCategory] = useState('Public'); // Default category
const [publicPlaylistLink, setPublicPlaylistLink] = useState(null);
const [addToPlaylistDropDown, setAddToPlaylistDropDown] = useState(false);
const [playlistSongs, setPlaylistSongs] = useState([]);
const [playlistSongsDrawer, setPlaylistSongsDrawer] = useState(false);
const [ selectedPlaylist, setSelectedPlaylist] = useState(null);

const togglePlaylistSongsDrawer = () => {
  setPlaylistSongsDrawer((prev) => !prev);
}





const createPlaylist = async (imageUrl) => {
  if (!playlistName.trim()) {
    alert("Playlist name cannot be empty");
    return;
  }
  
  // Check if playlist name already exists
  const existingPlaylist = playlists.find(
    (playlist) => playlist.name.toLowerCase() === playlistName.toLowerCase()
  );

  if (existingPlaylist) {
    alert("A playlist with this name already exists.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "playlists"), {
      name: playlistName || `MyPlaylist ${playlists.length + 1}`, // Default name
      category: playlistCategory,
      imageUrl: imageUrl || null,
      userId: user.uid,
      username: user.displayName, 
      createdAt: new Date(),
      songs: [],
    });

    setPlaylists((prev) => [
      ...prev,
      { id: docRef.id, name: playlistName, category: playlistCategory, songs: [] },
    ]);
    setPlaylistName(''); // Reset input
    setPlaylistCategory('Public'); // Reset category
    
  } catch (e) {
    console.error("Error creating playlist: ", e);
  
  }
};

const handleCreatingPlaylist = (e) => {
  const getRandomHexColor = () => {
    let randomColor;
    do {
      // Generate a random hex color
      randomColor = `${Math.floor(Math.random() * 16777215).toString(16)}`;
  
      // Ensure the color is not white (#FFFFFF)
    } while (randomColor === "#ffffff" || randomColor === "#FFFFFF");
  
    return randomColor;
  };
  if (e.key === 'Enter') {
    const imageUrl = `https://ui-avatars.com/api/?name=${playlistName.split(' ').join('+')}&rounded=true&background=${getRandomHexColor()}&color=ffffff`
    createPlaylist(imageUrl);
    togglePlaylist();
  }
}

const getPlaylists = async () => {
  try {
    const q = query(collection(db, "playlists"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPlaylists(data);
    
  } catch (e) {
    console.error("Error fetching playlists: ", e);
  }
};

const getPlaylistSongs = async (playlistId, userId) => {
  try {
    // Query playlists by both userId and document ID
    const q = query(
      collection(db, "playlists"),
      where("userId", "==", userId), // Filter by userId
      where("__name__", "==", playlistId) // Filter by document ID
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const playlist = querySnapshot.docs[0].data();
      setPlaylistSongs(playlist.songs || []); // Set playlist songs
    //  console.log("Playlist songs:", playlist.songs);
    } else {
      console.error("No playlist found for the given user and playlist ID.");
      setPlaylistSongs([]);
    }
  } catch (error) {
    console.error("Error fetching playlist songs:", error);
  }
};





const deletePlaylist = async (playlistId) => {
  try {
    const playlistRef = doc(db, 'playlists', playlistId);
    await deleteDoc(playlistRef);
    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
    
  }
  catch (error) {
    console.error('Error deleting playlist:', error);
    
  }
}

const addSongToPlaylist = async (playlistId, song, playlists, setPlaylists) => {
  try {
    // Reference the specific playlist document
    const playlistRef = doc(db, "playlists", playlistId);

    // Update the playlist document to add the song to the 'songs' array
    await updateDoc(playlistRef, {
      songs: arrayUnion(song),
    });
    getPlaylists();

   

    // Immediately update the playlists state
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        // Add the song to the playlist's songs array locally
        return { ...playlist, songs: [...playlist.songs, song] };
      }
      return playlist;
    });

    setPlaylists(updatedPlaylists); // Update state to reflect the change

  } catch (error) {
    console.error("Error adding song to playlist: ", error);
  }
};
const deleteSongFromPlaylist = async (playlistId, song) => {
  try {
    // Reference the specific playlist document
    const playlistRef = doc(db, "playlists", playlistId);

    // Update the playlist document to remove the song from the 'songs' array
    await updateDoc(playlistRef, {
      songs: arrayRemove(song), // Remove the song from the array
    });
    getPlaylistSongs(selectedPlaylist?.id, user.uid); // Fetch songs for the selected playlist
    

  
  } catch (error) {
    console.error("Error removing song from playlist: ", error);
  }
};



const sharePlaylist = (playlistId) => {
  const link = `${window.location.origin}/playlist/${playlistId}`;
  setPublicPlaylistLink(link);
  navigator.clipboard.writeText(link);
  alert("Playlist link copied to clipboard!");
};

const [isPlaylistSongsDrawerOpen, setPlaylistSongsDrawerOpen] = useState(false);
const [isPlaylistCreationDrawerOpen, setPlaylistCreationDrawerOpen] = useState(false);
const [isImportPlaylistOpen, setIsImportPlaylistOpen] = useState(false);

const handlePlaylistSongsDrawer = () =>
  setPlaylistSongsDrawerOpen(!isPlaylistSongsDrawerOpen);

const togglePlaylistCreationDrawer = () =>
  setPlaylistCreationDrawerOpen(!isPlaylistCreationDrawerOpen);

const toggleImportPlaylistDrawer = () => {
  setIsImportPlaylistOpen(!isImportPlaylistOpen);
}



const [dropdownVisibility, setDropdownVisibility] = useState({}); // Store visibility for each song

// Toggle dropdown visibility for specific song
const toggleAddToPlaylistDropDown = (songId) => {
  setDropdownVisibility((prevState) => ({
    ...prevState,
    [songId]: !prevState[songId], // Toggle visibility
  }));
};


useEffect(() => {
  if (user) {
    getPlaylists(); // Fetch playlists once user is set
   
   
   

  }
}, [user]); // This effect runs whenever `user` changes

function handleImportingPlaylist(e) {
  if (e.key === 'Enter') {
    let url = e.target.value;
   const id = url.split('/')[4];
    if (id) {
      importPlaylistSongs(id);
    }
    
  }
}
const [ importedSongs, setImportedSongs ] = useState([]);
const [ importedPlaylist, setImportedPlaylist ] = useState([]);

const importPlaylistSongs = async (playlistId) => {
  try {
    // Reference the playlist document directly by ID
    const playlistRef = doc(db, "playlists", playlistId);
    const playlistDoc = await getDoc(playlistRef);

    if (playlistDoc.exists()) {
      const playlist = playlistDoc.data();
      setImportedPlaylist(playlist);
      setImportedSongs(playlist.songs)
     // console.log("Playlist songs:", playlist);
    } else {
      console.error("No playlist found for the given playlist ID.");
     setImportedSongs([]);
    }
  } catch (error) {
    console.error("Error fetching playlist songs:", error);
  }
};


  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-4 py-2 bg-gray-50 dark:text-slate-400 dark:bg-zinc-900">
    
    
      <div className="w-full max-w-md">
        <div className='w-full overflow-x-auto sticky top-0 bg-gray-50  dark:text-slate-400 dark:bg-zinc-900' >

       
          <div className="one">
      <div className="two">
      <div className="flex items-center justify-between w-full">
  {/* Left side: Logo and Animation */}
  <div className="flex items-center space-x-4">
    <a
      onClick={() => window.location.reload()}
      className="logo cursor-pointer text-indigo-600 text-xl font-bold"
    >
      Syncy
    </a>
    {/* Animation container */}
    <div className="relative h-[2rem] overflow-hidden ">
      <Animation />
    </div>
  </div>

  {/* Right side: Dark Mode Button */}

 
  
  <button
  onClick={() => {setIsPlayerVisible(false); 
    showModal()
  }}
  type="button" data-drawer-target="drawer-right-example" data-drawer-show="drawer-right-example" data-drawer-placement="right" aria-controls="drawer-right-example"
  
  className="rounded-full z-50 border-0 px-3 py-2 text-sm font-medium text-slate-700 bg-gray-300 dark:bg-slate-800 dark:text-yellow-400 transition-all duration-700"
>

  <i className="fa-solid fa-ellipsis-vertical"></i>
</button>

</div>




    { currentSong && <div style={{position: 'fixed', right: '-10px', borderRadius: '18px 0 0 18px', top: '60%' }} onClick={()=> setIsPlayerVisible(!isPlayerVisible)} className=' overflow-hidden  z-50 cursor-pointer border-0 player-btn px-4 py-2 text-sm font-medium text-white bg-indigo-600'><i  className="fa-solid fa-headphones cursor-pointer"></i>
    </div>}
  </div>
          </div>

          <div className="flex items-center mt-4 mb-8 bg-gray-100 rounded-full dark:text-slate-400 dark:bg-zinc-900">
          <FaTimes onClick={handleSearch} className="w-5 h-5 ml-3 text-gray-500 cursor-pointer" />
          <input ref={inputRef}
            type="text"
            value={searchQuery}
		  onFocus={() => setIsPlayerVisible(false)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mitraz"
            className="w-full py-2 pl-4 pr-4 text-sm bg-gray-100 rounded-full focus:outline-none placeholder:italic placeholder:text-slate-500"
          />
          <FaHeadphones onClick={()=> setIsPlayerVisible(!isPlayerVisible)} className='cursor-pointer' />
          </div>
          </div>
        <div className="flex items-center justify-between w-full pb-2 mb-4 text-sm font-semibold border-b overflow-x-auto dark:text-slate-400 dark:bg-zinc-900">
          <span
            onClick={() =>{ setActiveTab('Songs'); setIsPlayerVisible(false)} }
            className={`cursor-pointer ${activeTab === 'Songs' ? 'border-b-2 border-yellow-400' : 'text-gray-400 hover:text-gray-800'}`}
          >
            Songs
          </span>
          
          <span
            onClick={() => {setActiveTab('Favorite'); setIsPlayerVisible(false); setTimeout(() => {toggleDrawer(); setIsDrawerOpen(true);}, 200); }}
            className={`cursor-pointer ${activeTab === 'Favorite' ? 'border-b-2 border-yellow-400' : 'text-gray-400 hover:text-gray-800'}`}
          >
            Favorite
          </span>
          <span
            onClick={() => {setActiveTab('Artists'),  setIsPlayerVisible(false)} }
            className={`cursor-pointer ${activeTab === 'Artists' ? 'border-b-2 border-yellow-400' : 'text-gray-400 hover:text-gray-800'}`}
          >
            Artists
          </span>
          <span
            onClick={() => {setActiveTab('Categories'),  setIsPlayerVisible(false)} }
            className={`cursor-pointer ${activeTab === 'Categories' ? 'border-b-2 border-yellow-400' : 'text-gray-400 hover:text-gray-800'}`}
          >
            Categories
          </span>

           <span
            onClick={() => {setActiveTab('Playlist'),  setIsPlayerVisible(false)
            } }
            className={` cursor-pointer ${activeTab === 'Offline' ? 'border-b-2 border-yellow-400' : 'text-gray-400 hover:text-gray-800'}`}
          >
            Playlist
          </span>

        
          
        </div>
        {activeTab === 'Songs' && (
          <div className="mb-12 ">
          <div className='w-full sticky top-0 bg-gray-50  dark:text-slate-400 dark:bg-zinc-900 z-40'>
            <h3 className="mb-4 text-lg font-semibold">Latest Songs</h3>
            <div className="overflow-x-auto">
  <div className="flex gap-4 mb-10" >
    {Latest.length > 0 ? Latest.map((song, index) => (
      <div key={index} className="min-w-[130px]">
        <div className="relative cursor-pointer" onClick={() => handleSongClick(song)}>
          <img
            src={song.image[2].link}
            alt="Popular Song"
            className="rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center w-full bg-gray-900 bg-opacity-50 h-9 rounded-b-lg">
            <button
              onClick={() => togglePlayPause(song.downloadUrl[audioQuality].link)}
              className="text-gray-400 cursor-pointer"
            >
              {isPlaying && audioRef.current.src === song.downloadUrl[audioQuality].link ? <FaPause /> : <FaPlay />}
            </button>
          </div>
        </div>
      </div>
    )) : <Loader />}
  </div>
            </div>
            </div>
            
            <div className='overflow-y-auto '>
            <ul className="space-y-4 ">
            {songs.length > 0 ? (
        songs.map((song, index) => (
          <li
            key={index}
            className="flex items-center me-7 z-1 justify-between p-2 bg-white rounded-lg shadow dark:text-slate-400 dark:bg-zinc-900 custom relative"
          >
            <div className="flex items-center">
              {/* Song Image */}
              <img
                src={song.image[0].link}
                alt={song.title}
                className="w-10 h-10 rounded-lg cursor-pointer"
              />
              <div className="ml-3">
                <h4 className="text-base font-semibold cursor-pointer" onClick={() => handleSongClick(song)}>
                  {song.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {song.primaryArtists} &nbsp; &nbsp;
                  <span className="text-sm text-gray-400">{song.formattedDuration}</span> &nbsp; &nbsp; &nbsp; &nbsp;
                  <span
                    className="cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleFavorite(song); }}
                  >
                    {isSongFavorite(song.id) ? <FaHeartSolid color="red" /> : <FaHeartRegular />}
                  </span>
                </p>
              </div>
            </div>

            {/* Add to Playlist Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event propagation to avoid triggering other buttons
                toggleAddToPlaylistDropDown(song.id);
              }}
              className="pe-3 text-slate-700 dark:text-white shadow-md ml-2 flex items-center justify-center"
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>

            {/* Dropdown Menu for Adding to Playlist */}
            {dropdownVisibility[song.id] && (
              <div className="absolute right-9 top-2 z-40 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
                <ul className="py-1">
                  {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                      <li
                        key={playlist.id}
                        onClick={() => {
                      
                          addSongToPlaylist(playlist.id, song);
                          setDropdownVisibility((prevState) => ({
                            ...prevState,
                            [song.id]: false, // Close dropdown after selecting
                          }));
                        }}
                        className="px-4 py-1.5  text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        
                        {playlist.name}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500">No playlists available</li>
                  )}
                </ul>
              </div>
            )}
          </li>
        ))
      ) : (
        <Loader />
      )}

            </ul>
            </div>


          </div>
        )}
        {activeTab === 'Latest' && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Popular This Week</h3>
            <div className="overflow-x-auto">
  <div className="flex gap-4 mb-10">
    {Latest.length > 0 ? Latest.map((song, index) => (
      <div key={index} className="min-w-[200px] ">
        <div className="relative cursor-pointer" onClick={() => handleSongClick(song)}>
          <img
            src={song.image[2].link}
            alt="Popular Song"
            className="rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center w-full bg-gray-900 bg-opacity-50 h-9 rounded-b-lg">
            <button
              onClick={() => togglePlayPause(song.downloadUrl[audioQuality].link)}
              className="text-gray-400 cursor-pointer"
            >
              {isPlaying && audioRef.current.src === song.downloadUrl[audioQuality].link ? <FaPause /> : <FaPlay />}
            </button>
          </div>
        </div>
      </div>
    )) : <Loader />}
  </div>
</div>

          </div>
        )}

       {activeTab === 'Favorite' && (
        <div {...swipeFavorites} onClick={() => {
          toggleDrawer();
          setIsDrawerOpen(true);
        }}> {/* Apply swipeable handlers */}
          <h3 className="mb-4 text-lg font-semibold cursor-pointer" onClick={toggleDrawer}>
            Favorites <i className="fa-solid fa-star" style={{ color: '#fcd34d' }}></i>
          </h3>
          
          <svg className="animate-bounce w-6 h-6 ..." />
  
          <div className={`app-drawer dark:text-slate-400 dark:bg-zinc-900 ${isDrawerOpen ? 'open' : ''}`}>
            <span className='backButton' onClick={() => setIsDrawerOpen(false)}><i className="fa-solid fa-chevron-down"></i></span>

           
  
            <div className="drawer-handle" onClick={toggleDrawer}>
              <span className="handle-bar"></span>
            </div>
            <div className="app-list">
              <h2 className="heart-beat dark:text-slate-400 dark:bg-zinc-900">Heart Beats</h2>
              <ul className="song-list">
                {favorite.length > 0 ? favorite.map((song, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-white rounded-lg shadow cursor-pointer dark:text-slate-400 dark:bg-zinc-900"
                  >
                    <div className="flex items-center" onClick={() => handleSongClick(song)}>
                      <img
                        src={song.image[0].link}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg cursor-pointer"
                      />
                      <div className="ml-3">
                        <h4 className="text-base font-semibold">{song.name}</h4>
                        <p className="text-sm text-gray-500">
                          {song.primaryArtists} &nbsp; &nbsp;
                          <span className="text-sm text-gray-400">
                            {song.formattedDuration}
                          </span> &nbsp; &nbsp; &nbsp; &nbsp;
                          <i className="fa-heart fa-solid" style={{ cursor: 'pointer', color: '#dc2626' }}></i>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePlayPause(song.downloadUrl[audioQuality].link)}
                      className="text-gray-400 cursor-pointer"
                    >
                      {isPlaying && audioRef.current.src === song.downloadUrl[audioQuality].link ? <FaPause /> : <FaPlay />}
                    </button>
                  </li>
                )) : <Loader />}
              </ul>
            </div>
          </div>
        </div>
      )}
        {activeTab === 'Artists' && (
          <div>
            <h3 className="mb-4 text-lg font-semibold" > Top Artists</h3>
            <div className='overflow-y-auto h-96'>

            {TopArtists.length > 0 ? (
                <section 
                    className='grid grid-cols-2 gap-4 mb-10 md:grid-cols-2 md:gap-8 lg:grid-cols-5 lg:grid-rows-2'>
                    {TopArtists.map((artist, index) => (
                        <div key={index} className='relative flex flex-col items-center'>
                            {/* Artist Image with Play Button Overlay */}
                            <div className='relative group cursor-pointer' onClick={() => {getArtistSongs(artist.name); toggleArtistDrawer();}} >
                                <img 
                                    src={artist.image[2].link} 
                                    alt={artist.name} 
                                    className='w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-auto rounded-full object-cover'
                                    
                                   
                                />
                                {/* Play Button Overlay */}
                                <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 rounded-full'>
                                    <button className='text-white text-2xl'>▶</button>
                                </div>
                               
                            </div>
                            {/* Artist Name */}
                            <span className='mt-2 text-sm font-semibold text-center'  >{artist.name}</span>
                        </div>
                    ))}
                </section>
            ) : (
                <Loader />
            )}
            </div>
            {/* Artist Drawer */}
            <div className='w-full'>
            <div className={`app-drawer z-50 dark:text-slate-400 dark:bg-zinc-900 ${isArtistOpen ? 'open' : ''}`}>
      <span className='backButton ' onClick={toggleArtistDrawer}><i className="fa-solid fa-chevron-down"></i></span>
      
<button className="button hidden" onClick={toggleArtistDrawer}>
  <svg className="svgIcon" viewBox="0 0 384 512">
    <path
      d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
    ></path>
  </svg>
</button>

      
      <div className="drawer-handle " onClick={toggleArtistDrawer}>
        <span className="handle-bar"></span>
      </div>
      <div className="app-list">
        <h2>Heart Beats</h2>
        <ul className='song-list'>
          {artistSongs.length > 0 ? artistSongs.map((song, index) => (
             <li
             key={index}
             className="flex items-center justify-between p-2 bg-white rounded-lg shadow cursor-pointer dark:text-slate-400 dark:bg-zinc-900"
             
           >
             <div className="flex items-center" onClick={() => handleSongClick(song)}>
               <img
                 src={song.image[0].link}
                 alt={song.title}
                 className="w-10 h-10 rounded-lg cursor-pointer"
                
               />
               <div className="ml-3">
                 <h4 className="text-base font-semibold" >{song.name}</h4>
                 <p className="text-sm text-gray-500">
                   {song.primaryArtists} &nbsp; &nbsp;
                   <span className="text-sm text-gray-400">
                     {song.formattedDuration}
                   </span> &nbsp; &nbsp; &nbsp; &nbsp;
                  {/* add to favorite */}
                  <span className='cursor-pointer' onClick={(e) => { e.stopPropagation(); handleFavorite(song); }}>
                          {isSongFavorite(song.id) ? <FaHeartSolid color="red" /> : <FaHeartRegular />}
                        </span>
                 </p>
               </div>
             </div>
             <button
                    onClick={() => togglePlayPause(song.downloadUrl[audioQuality].link)}
                    className="text-gray-400 cursor-pointer"
                  >
                    {isPlaying && audioRef.current.src === song.downloadUrl[audioQuality].link ? <FaPause /> : <FaPlay />}
                  </button>

           </li>
          )) : <Loader />}
        </ul>
      </div>
    </div>
            </div>
          </div>
        )}
        {activeTab == 'Categories' && (
          <div>
             <h3 className="mb-4 text-lg font-semibold" > Find Categories</h3>
             <div className="flex items-center justify-center h-full  mx-auto" >
               <button   className="animatedButton mx-0.5 " onClick={() => handleCategories('hindi')}>Hindi</button>
               <button className="animatedButton mx-0.5" onClick={() => handleCategories('english')}>English</button>
               <button className="animatedButton mx-0.5" onClick={() => handleCategories('punjabi')}>Punjabi</button>
               <button className="animatedButton mx-0.5" onClick={() => handleCategories('haryanvi')}>Haryanvi</button>
           </div>

             <div className='overflow-y-auto h-96'>
             {categoryData.length > 0 && (
                <section 
                    className='  grid grid-cols-2  gap-4 mb-10 md:grid-cols-2 md:gap-8 lg:grid-cols-5 lg:grid-rows-2'>
                    {categoryData.map((chart, index) => (
                        <div key={index} className='relative flex flex-col items-center mt-3'>
                            {/* Artist Image with Play Button Overlay */}
                            <div className='relative group cursor-pointer' onClick={() => { getCategorySongs(chart.id); toggleCategoryDrawer();}} >
                                <img 
                                    src={chart.image[2].link} 
                                    alt={chart.name} 
                                    className='w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-auto rounded-full object-cover'
                                    
                                   
                                />
                                {/* Play Button Overlay */}
                                <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 rounded-full'>
                                    <button className='text-white text-2xl'>▶</button>
                                </div>
                               
                            </div>
                            {/* Artist Name */}
                            <span className='mt-2 text-sm font-semibold text-center'  >{chart.title}</span>
                        </div>
                    ))}
        <div className={`app-drawer z-50 dark:text-slate-400 dark:bg-zinc-900 ${isCategoryOpen ? 'open' : ''}`}>
  {/* Back Button */}
  <span className='backButton' onClick={toggleCategoryDrawer}>
    <i className="fa-solid fa-chevron-down"></i>
  </span>

  {/* Drawer Toggle Button */}
  <button className="button hidden" onClick={toggleCategoryDrawer}>
    <svg className="svgIcon" viewBox="0 0 384 512">
      <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"></path>
    </svg>
  </button>

  {/* Drawer Handle */}
  <div className="drawer-handle" onClick={toggleCategoryDrawer}>
    <span className="handle-bar"></span>
  </div>

  {/* Song List */}
  <div className='app-list'>
   
    <ul className='song-list'>
    
      {CategorySongs.length > 0 ? (
        CategorySongs.map((song, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-2 bg-white rounded-lg shadow cursor-pointer dark:text-slate-400 dark:bg-zinc-900"
          >
            <div className="flex items-center" onClick={() => handleSongClick(song)}>
              
              <img
                src={song.image[0].link}
                alt={song.title}
                className="w-10 h-10 rounded-lg cursor-pointer"
              />
              <div className="ml-3">
                <h4 className="text-base font-semibold">{song.name}</h4>
                <p className="text-sm text-gray-500">
                  {song.primaryArtists} &nbsp; &nbsp;
                  <span className="text-sm text-gray-400">{song.formattedDuration}</span>
                  <span onClick={(e) => { e.stopPropagation(); handleFavorite(song); }}>
                          {isSongFavorite(song.id) ? <FaHeartSolid color="red" /> : <FaHeartRegular />}
                        </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => togglePlayPause(song.downloadUrl[audioQuality].link)}
              className="text-gray-400 cursor-pointer"
            >
              {isPlaying && audioRef.current.src === song.downloadUrl[audioQuality].link ? (
                <FaPause />
              ) : (
                <FaPlay />
              )}
            </button>
          </li>
        ))
      ) : (
        <Loader />
      )}
    </ul>
  </div>
</div>

                </section>
            )}
             </div>

            </div>
        )}

      
{activeTab === 'Playlist' && (
  <div>
    {user ? (
      <div>
      <div className='flex  items-center justify-between'>
        <h3 className="mb-4 text-lg font-semibold">
          Playlists <i className="fa-solid fa-guitar ps-2 text-blue-300"></i>
        </h3>
        <div className='mb-4 ring-slate-600 ring-1 p-1 px-2 rounded-lg cursor-pointer' onClick={toggleImportPlaylistDrawer}>
        <span className='font-bold'> Import Playlist</span>
       </div>
      </div>

        

        {/* List of Playlists */}
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <div key={playlist.id}>
              <div
                className="flex items-center justify-between p-2 bg-white rounded-lg shadow cursor-pointer dark:text-slate-400 dark:bg-zinc-900"
                onClick={() => {
                  getPlaylistSongs(playlist.id, user?.uid);
                  handlePlaylistSongsDrawer(); // Open playlist songs drawer
                  setSelectedPlaylist(playlist);
                  
                }}
              >
                <div className="flex items-center">
                  

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#eabd11" fill="none">
    <path d="M7 9.5C7 10.8807 5.88071 12 4.5 12C3.11929 12 2 10.8807 2 9.5C2 8.11929 3.11929 7 4.5 7C5.88071 7 7 8.11929 7 9.5ZM7 9.5V2C7.33333 2.5 7.6 4.6 10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10.5" cy="19.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 19.5L13 11C13 10.09 13 9.63502 13.2466 9.35248C13.4932 9.06993 13.9938 9.00163 14.9949 8.86504C18.0085 8.45385 20.2013 7.19797 21.3696 6.42937C21.6498 6.24509 21.7898 6.15295 21.8949 6.20961C22 6.26627 22 6.43179 22 6.76283V17.9259" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 13C17.8 13 21 10.6667 22 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
                  <div className="ml-3">
                    <h4 className="text-base font-semibold">{playlist.name}</h4>
                    <p className="text-sm text-gray-500">
                      {playlist.songs.length} songs &nbsp; &nbsp;
                      <span className="text-sm text-gray-400">{playlist.category}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sharePlaylist(playlist.id);
                    }}
                    className="text-gray-400 cursor-pointer"
                  >
                    <i className="fa-solid fa-share"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id);
                    }}
                    className="text-gray-400 cursor-pointer"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No playlists found</p>
        )}

        {/* Add Playlist Button */}
        <div className="absolute right-6 bottom-10">
          <button
            title="Add New"
            className="group cursor-pointer outline-none hover:rotate-90 duration-300"
            onClick={togglePlaylistCreationDrawer} // Open playlist creation drawer
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50px"
              height="50px"
              viewBox="0 0 24 24"
              className="stroke-zinc-400 fill-none group-hover:fill-zinc-800 group-active:stroke-zinc-200 group-active:fill-zinc-600 group-active:duration-0 duration-300"
            >
              <path
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                strokeWidth="1.5"
              ></path>
              <path d="M8 12H16" strokeWidth="1.5"></path>
              <path d="M12 16V8" strokeWidth="1.5"></path>
            </svg>
          </button>

        </div>

        {/* Playlist Songs Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg dark:bg-zinc-900 transform ${
            isPlaylistSongsDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-300`}
        >
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-slate-400">Playlist Songs</h3>
              <button onClick={handlePlaylistSongsDrawer}>
                <i className="fa-solid fa-times text-gray-400"></i>
              </button>
            </div>
          </div>
          <div className="p-4">
            {playlistSongs.length > 0 ? (
              <ul className="space-y-3">
                {playlistSongs.map((song, index) => (
                  <li
                    key={index}
                    
                    className="flex items-center justify-between p-2 bg-gray-100 rounded-lg shadow dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2" 
                    onClick={() => handleSongClick(song)}>
                      <img
                        src={song.imageUrl || song.image[1].link || song.albumArt || 'default_song_thumbnail.jpg'}
                        alt="Song"
                        className="w-10 h-10 rounded-lg"
                      />
                      <div>
                        <p className="text-sm font-medium">{song.name}</p>
                        <p className="text-xs text-gray-500">{song.artist}</p>
                      </div>
                    </div>
                    <button
                      className="text-gray-400"
                      onClick={() => deleteSongFromPlaylist(selectedPlaylist.id, song)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No songs in this playlist</p>
            )}
          </div>
        </div>

        {/* Playlist Creation Drawer */}
        <div
          className={`fixed bottom-0 left-0 w-full bg-white shadow-lg dark:bg-zinc-900 transform ${
            isPlaylistCreationDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          } transition-transform duration-300`}
        >
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-slate-400">Create Playlist</h3>
              <button onClick={togglePlaylistCreationDrawer}>
                <i className="fa-solid fa-times text-gray-400"></i>
              </button>
            </div>
          </div>
          <div className="p-4">
            <input
              type="text"
              placeholder="Playlist Name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              onKeyDown={handleCreatingPlaylist}
              className="w-full p-2 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-slate-400"
            />
          </div>

          
        </div>

        {/* Import Playlist Drawer */}

        <div
  className={`fixed bottom-0 left-0 w-full shadow-lg transform transition-transform duration-300 ${
    isImportPlaylistOpen ? 'translate-y-0' : 'translate-y-full '
  } bg-white dark:bg-zinc-900`}
>
  <div className="p-4 border-b border-gray-300 dark:border-gray-700">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-400">
        Import Playlist
      </h3>
      <button onClick={toggleImportPlaylistDrawer}>
        <i className="fa-solid fa-times text-gray-600 dark:text-gray-400"></i>
      </button>
    </div>
  </div>
  <div className="p-4 ">
    <input
      type="text"
      placeholder="Paste playlist url here ..."
      
      
      onKeyDown={handleImportingPlaylist}
      className="w-full p-2 bg-gray-100 text-gray-700 placeholder-gray-400 rounded-lg  ring-1  ring-slate-600
                 dark:bg-gray-800 dark:text-slate-400 dark:placeholder-gray-500"
    />
  </div>
    {/* imported playlist songs */}
       <div>
       {importedSongs.length > 0 ? (
             
              <div>
              <div >
              <div
                className="flex items-center justify-between p-2 bg-white rounded-lg shadow cursor-pointer dark:text-slate-400 dark:bg-zinc-900"
              >
                <div className="flex items-center">
                  

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#eabd11" fill="none">
    <path d="M7 9.5C7 10.8807 5.88071 12 4.5 12C3.11929 12 2 10.8807 2 9.5C2 8.11929 3.11929 7 4.5 7C5.88071 7 7 8.11929 7 9.5ZM7 9.5V2C7.33333 2.5 7.6 4.6 10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10.5" cy="19.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 19.5L13 11C13 10.09 13 9.63502 13.2466 9.35248C13.4932 9.06993 13.9938 9.00163 14.9949 8.86504C18.0085 8.45385 20.2013 7.19797 21.3696 6.42937C21.6498 6.24509 21.7898 6.15295 21.8949 6.20961C22 6.26627 22 6.43179 22 6.76283V17.9259" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 13C17.8 13 21 10.6667 22 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
                  <div className="ml-3">
                    <h3 className='font-bold text-base'>{importedPlaylist.username}</h3>
                    <h4 className="text-sm font-medium ">{importedPlaylist.name}</h4>
                    <p className="text-sm text-gray-500">
                      {importedPlaylist.songs.length} songs &nbsp; &nbsp;
                      <span className="text-sm text-gray-400">{importedPlaylist.category}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {}
                </div>
              </div>
            </div>
              
               <ul className="space-y-3 px-3 overflow-y-auto h-96">
                {importedSongs.map((song, index) => (
                  <li
                    key={index}
                    
                    className="flex items-center justify-between p-2 bg-gray-100 rounded-lg shadow dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2" 
                    onClick={() => handleSongClick(song)}>
                      <img
                        src={song.imageUrl || song.image[1].link || song.albumArt || 'default_song_thumbnail.jpg'}
                        alt="Song"
                        className="w-10 h-10 rounded-lg"
                      />
                      <div>
                        <p className="text-sm font-medium">{song.name}</p>
                        <p className="text-xs text-gray-500">{song.artist}</p>
                      </div>
                    </div>
                    
                  </li>
                ))}
              </ul>
             </div>
            ) : (
              <p className="text-center text-gray-500">No songs in this playlist</p>
            )}
       </div>  
  
        </div>

      </div>
    ) : (
      <div className="flex items-center flex-col gap-6 justify-center h-96">
        <div className="min-h-24 bg-gray-200 flex items-center justify-center rounded-lg shadow-white dark:shadow-slate-600 dark:bg-zinc-600 px-6">
          <div className="flex items-center flex-col gap-2 justify-center">
            <h1 className="dark:text-white text-slate-900">Welcome to Syncy</h1>
            <p className="dark:text-white text-slate-900">Sign in to access Playlists</p>
          </div>
        </div>
        <button onClick={HandleGoogleLogin} className="tooltip-container">
          <div className="button-content">
            <span className="text">Login to access playlist feature 🫡</span>
          </div>
        </button>
      </div>
    )}
  </div>
)}


      </div>

      {/* Player Container */}
      





<div ref={modal} id="drawer-right-example" className="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform translate-x-full bg-white w-80 dark:bg-gray-800" tabIndex="-1" aria-labelledby="drawer-right-label">
    <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"><svg className="w-4 h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
  </svg>Manage </h5>
   <button onClick={hideModal} type="button" data-drawer-hide="drawer-right-example" aria-controls="drawer-right-example" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
         <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
      </svg>
      <span className="sr-only">Close menu</span>
   </button>
  


   <div className="py-4 overflow-y-auto">
      <ul className="space-y-2 font-medium">
         <li >
           { user && (
             <a href="#" className=" flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
             <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
             </svg>
             <span className="ms-3">{user.displayName}</span>
          </a>)
           }
         </li>
         <li>
          
         <button onClick={toggleQualityRef} type="button" className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-example" data-collapse-toggle="dropdown-example">
                  <span className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white">
                    <i className="fa-solid fa-music"></i>
                  </span>
                  
                  <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">Audio Quality</span>
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                  </svg>
            </button>
            <ul ref={qualityRef} id="dropdown-example" className="hidden py-2 space-y-2">
            {qualities.map((quality) => (
        <li key={quality.id}>
          <a
            href="#"
            onClick={() => handleQualityChange(quality.id)}
            className="flex items-center w-full p-2 text-gray-900 transition-all duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center h-5">
                <input
                  id={`helper-radio-${quality.id}`}
                  name="helper-radio"
                  type="radio"
                  value={quality.id}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  checked={isChecked(quality.id)}
                  readOnly
                />
              </div>
              <div className="ms-2 text-sm">
                <label
                  htmlFor={`helper-radio-${quality.id}`}
                  className="text-gray-900 dark:text-gray-300"
                >
                  <div className="font-semibold text-md">{quality.label}</div>
                </label>
              </div>
            </div>
          </a>
        </li>
      ))}
                 
                
            </ul>
 
            
         </li>
        
         <li className='' onClick={user ? HandleSignOut : HandleGoogleLogin}>
            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <span className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white">
               <i className="fa-solid fa-user"></i>
              </span>
              <span className="flex-1 ms-3 whitespace-nowrap">{user ? 'Log out' : 'Sign in'}</span>
               
            </a>
         </li>
         
         <li>
            <a href="#" className="flex items-center p-2 gap-3 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z"/>
                  <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z"/>
                  <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z"/>
               </svg>
               <button
  
                onClick={() =>  setDarkMode(!darkMode)}
                className="rounded-full z-50 border-0 px-3 py-2 text-sm font-medium text-slate-700 bg-gray-300 dark:bg-slate-800 dark:text-yellow-400 transition-all duration-700">
                  <i
                   className={`${
                   darkMode ? "fa-regular fa-sun" : "fa-solid fa-moon"
                   } transform transition-transform duration-700 ease-in-out ${
                   darkMode ? "rotate-180 scale-110" : "rotate-0 scale-100"
                   }`}
                  ></i>
  
              </button>
            </a>
         </li>
      </ul>
   </div>


</div>

     

      <div  {...swipeHandlers}
  style={{
    zIndex: '1002',
    transform: isPlayerVisible ? 'translateY(0)' : 'translateY(100%)',
    opacity: isPlayerVisible ? 1 : 0, // Smooth fade in/out
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out', // Smooth transitions
  }}
  className="fixed bottom-0 w-full max-w-md px-4 bg-white rounded-t-xl shadow-md dark:text-slate-400 dark:bg-zinc-900"
>
{currentSong && (
  <>
    <div className="flex items-center justify-between mt-2 relative">
      <button
        onClick={() => setIsPlayerVisible(false)}
        className="w-10 h-10 rounded-full bg-gray-800 text-white shadow-md hover:bg-gray-700 ml-2"
      >
        <i className="fa-solid fa-chevron-down"></i>
      </button>
      
      {/* Dropdown Button */}

      <div className="relative inline-block text-left">

{/* Dropdown Menu */}
{addToPlaylistDropDown && (
  <div className="absolute left-0 top-3 z-40 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
    <ul className="py-1">
      {playlists.length > 0 ? (
        playlists.map((playlist) => (
          <li
            key={playlist.id}
            onClick={() => {
             
              addSongToPlaylist(playlist.id, currentSong);
              setAddToPlaylistDropDown(false); // Close dropdown
            }}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
          >
            {playlist.name}
          </li>
        ))
      ) : (
        <li className="px-4 py-2 text-sm text-gray-500">No playlists available</li>
      )}
    </ul>
  </div>
)}
</div>
      <button
        onClick={toggleAddToPlaylistDropDown}
        className="hidden w-10 h-10 rounded-full bg-gray-800 text-white shadow-md hover:bg-gray-700 ml-2 flex items-center justify-center"
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>
     
    


     
    </div>
    


    <div className="flex flex-col items-center py-4">
      <div className="flip-card w-72 h-72 rounded-lg shadow-lg">
        <div
          className={`flip-card-inner w-72 h-72 rounded-lg shadow-lg ${isFlipped ? 'rotate' : 'rotate-back'}`}
        >
          {/* Front of the flip card */}
          <div
            className="flip-card-front w-72 h-72 rounded-lg shadow-lg"
            onClick={() => setIsFlipped(true)}
          >
            <img
              src={currentSong.albumArt}
              alt="Album Art"
              className="w-100 h-100 rounded-lg shadow-lg img cursor-pointer"
            />
          </div>

          {/* Back of the flip card */}
          <div className="flip-card-back w-72 h-72 rounded-lg shadow-lg" onClick={() => setIsFlipped(false)} >
           
           </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold">{currentSong.title}</h3>
      <p className="text-gray-500 cursor-pointer" onClick={() => { setSearchQuery(currentSong.name); setIsPlayerVisible(false); }}>
        {currentSong.name}
      </p>

      <div className="flex justify-between w-full mt-4">
        <button
          style={{ paddingLeft: '12px', display: 'flex', alignItems: 'center' }}
          onClick={() => handleDownload(currentSong)}
          className="w-10 h-10 rounded-full bg-gray-800 text-white shadow-md hover:bg-gray-700"
        >
          <i className="fa-solid fa-download"></i>
        </button>

        <button
          style={{ paddingLeft: '12px' }}
          onClick={() => togglePlayPause(currentSong)}
          className="w-10 h-10 rounded-full bg-gray-800 text-white shadow-md hover:bg-gray-700"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <button
          style={{ paddingLeft: '12px' }}
          onClick={handleMuteToggle}
          className="w-10 h-10 rounded-full bg-gray-800 text-white shadow-md hover:bg-gray-700"
        >
          {isMuted ? <MdOutlineVolumeOff /> : <MdOutlineVolumeUp />}
        </button>
      </div>

      <label className="w-full flex mt-2 items-center justify-center gap-1 px-1">
        <span className="currentTime">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
          className="w-10/12 h-1 bg-gray-200 rounded-lg appearance-none thumb cursor-pointer"
          style={{
            background: `linear-gradient(to right, #fad0c4 ${progress}%, #e5e7eb ${progress}%)`,
          }}
        />
        <span className="musicDuration">{formatTime(musicDuration)}</span>
      </label>
    </div>
  </>
)}

      </div>
      


    </div>
  );
};

export default MusicDiscover;
