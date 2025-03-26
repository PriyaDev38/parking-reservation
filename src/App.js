import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Dashboard from "./components/Dashboard";
import ReserveSlot from "./components/ReserveSlot";
import Reservations from "./components/Reservations";

const App = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [spots, setSpots] = useState(new Array(6).fill({ reserved: false }));

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const addReservation = (newReservation) => {
    const availableIndex = spots.findIndex((spot) => !spot.reserved);
    if (availableIndex !== -1) {
      const updatedSpots = [...spots];
      updatedSpots[availableIndex] = { reserved: true, ...newReservation };
      setSpots(updatedSpots);
    } else {
      alert("No available parking spots!");
    }
  };

  const cancelReservation = (index) => {
    const updatedSpots = [...spots];
    updatedSpots[index] = { reserved: false };
    setSpots(updatedSpots);
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar
          sx={{
            flexDirection: isSmallScreen ? "column" : "row",
            alignItems: isSmallScreen ? "flex-start" : "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{ flexGrow: 1, fontWeight: 600, mb: isSmallScreen ? 1 : 0 }}
          >
            🚗Parking Management System
          </Typography>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            centered={!isSmallScreen}
            variant={isSmallScreen ? "scrollable" : "standard"}
            scrollButtons={isSmallScreen ? "auto" : false}
            sx={{
              ml: isSmallScreen ? 0 : 4,
              width: isSmallScreen ? "100%" : "auto",
            }}
          >
            <Tab label="Dashboard" />
            <Tab label="Reserve Slot" />
            <Tab label="Reservations" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, maxWidth: "1200px", margin: "0 auto" }}>
        {currentTab === 0 && (
          <Dashboard spots={spots} cancelReservation={cancelReservation} />
        )}
        {currentTab === 1 && <ReserveSlot addReservation={addReservation} />}
        {currentTab === 2 && <Reservations spots={spots} />}
      </Box>
    </Box>
  );
};

export default App;
