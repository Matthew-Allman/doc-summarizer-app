"use client";

import React, { useContext, useEffect } from "react";

import backendAPI from "@/api/backendInstance";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [userInfo, setUserInfo] = React.useState({});

  const getUserData = async () => {
    try {
      const response = await backendAPI.get("/auth");

      if (response?.data?.loggedIn) {
        setUserInfo(response.data.userInfo);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <AppContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
