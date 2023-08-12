import React from "react";
import "./App.css";
import { Outlet, useParams } from "react-router-dom";
import { useState } from "react";

const App = () => {
  const [user, setUser] = useState(0);
  return (
    <div>
      <Outlet context={"hi"} />
    </div>
  );
};

export default App;
