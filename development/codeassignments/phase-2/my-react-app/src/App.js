// Import React and useState hook
import React, { useState } from 'react';
// Import the CSS file for styling
import './styles.css';

const App = () => {
  // State variable to track the login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to toggle the login status
  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="app">
      <h1>Conditional Rendering in React</h1>
      {/* Conditional rendering based on isLoggedIn state */}
      {isLoggedIn ? (
        <div>
          <h2>Welcome back, user!</h2>
          <button onClick={toggleLogin}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Please log in.</h2>
          <button onClick={toggleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default App;


