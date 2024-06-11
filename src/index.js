import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import WelcomePage from "./Components/WelcomePage/WelcomePage";
import { QueryClient, QueryClientProvider } from "react-query";
import SingleConnection from "./Components/SingleConnection/SingleConnection";

const root = ReactDOM.createRoot(document.getElementById("root"));

const randomGen = () => {
  console.log("test");
};

const queryClient = new QueryClient();
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <React.StrictMode>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/connection/:id" element={<SingleConnection />} />
        </Routes>
      </React.StrictMode>
    </BrowserRouter>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
