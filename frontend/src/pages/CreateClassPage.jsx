import React from 'react';
import CreateClassForm from '../components/CreateClassForm';
import Navbar from "../components/NavBar.jsx";

function CreateClassPage() {
  return (
    <div>
      <Navbar />
      <div>
        <h1>Create a Class</h1>
        <CreateClassForm />
      </div>
    </div>
  );
}

export default CreateClassPage;