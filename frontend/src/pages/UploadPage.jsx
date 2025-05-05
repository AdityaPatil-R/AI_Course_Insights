import React from 'react';
import FileUpload from '../components/FileUpload';
import Navbar from "../components/NavBar.jsx";

function UploadPage() {

  return (
    <div>
      <Navbar />
      <div>
        <h1>Upload Assignments</h1>
        <FileUpload/>
      </div>
    </div>
  );
}

export default UploadPage;
