import EventCard from './EventCard';
import SearchIcon from '../Icons/icon-search.png';
import Circle from '../Icons/circle.png';

import { useState, useEffect } from 'react';
import './Home.css';

const Home=() => {
  const [user, setUser] = useState({
    firstName: 'Vizitator',
    lastName: '',
    role: 'Neautentificat'
  });

 
  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      

      let userRole = "USER";
      if (parsedUser.roles && parsedUser.roles.length > 0) {
        userRole = parsedUser.roles[0].toUpperCase(); 
      }

      setUser({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        role: userRole
      });
    }
  }, []);
  return (
    <div>

       <div className="Header">
        <h1>Event Manager</h1>
        
        <div className="user-info">
          <p className="user-name">
            {user.firstName} {user.lastName} <br/>
              {user.role}
          </p>
          
          <img src={Circle} alt="circle" className="circle-icon"/>
        </div>
      </div>
        <div className="Search">
        <img src={SearchIcon} className="search-icon" alt="Search" />
        <input className="search-input" type="text" placeholder="Type here"/>
      </div>
      <div className="App">
        <div className="Grid">
        <EventCard />
        <EventCard/>
        <EventCard/>

      </div>
    </div>
    </div>

  );
}

export default Home;