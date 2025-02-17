import React, { useState, useEffect } from 'react'
import Warn from './components/Warn';
function MobileOnly({children}) {
    const [isMobile, setIsMobile ] = useState(window.innerWidth <= 768);
    
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };
    
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    if (!isMobile) return <Warn />;

  return (
    <div>
      {children}
    </div>
  )
}

export default MobileOnly
