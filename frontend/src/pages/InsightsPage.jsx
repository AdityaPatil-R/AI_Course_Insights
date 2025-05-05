import React from 'react';
import InsightsViewer from '../components/InsightsViewer';
import NavBar from '../components/NavBar';

function InsightsPage() {

  return (
    <div>
      <NavBar />
        <div>
          <h1>Course Insights</h1>
          <InsightsViewer />
        </div>
    </div>
  );
}

export default InsightsPage;
