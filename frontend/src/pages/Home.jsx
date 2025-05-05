import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../components/NavBar.jsx";
import Body from "../styles/Body.css";

function Home() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <section>
          <h1>Welcome to AI Course Insights!</h1>
        </section>
        <div className="instructions">
          <p>1. To start, sign up and log in to our website!</p>
          <p>2. Next, add your classes by selecting the create tab.</p>
          <p>3. Then add homework, quizzes, and tests by selecting the upload tab.</p>
          <p>4. After this, we will provide valuable insights about your performance and suggest improvements!</p>
        </div>
      </div>
    </div>
  );
}

export default Home;