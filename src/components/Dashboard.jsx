import React, { useEffect, useState } from "react";
import { database, ref, get, set, update, remove } from "./firebase/firebase";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const Dashboard = () => {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slotName, setSlotName] = useState("");
  const [slotError, setSlotError] = useState("");
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const snapshot = await get(ref(database, "parking"));
        const slotOrder = ["1", "2", "3", "4", "5", "6"];

        if (snapshot.exists()) {
          const data = snapshot.val();
          const slotsArray = Object.keys(data).map((key) => ({
            id: key,
            reserved: !data[key].available,
            time: data[key].time || null,
            ...data[key],
          }));

          // Sort by slotOrder
          const sortedSlots = slotsArray.sort(
            (a, b) => slotOrder.indexOf(a.id) - slotOrder.indexOf(b.id)
          );
          console.log(sortedSlots);
          setParkingSlots(sortedSlots);
        } else {
          const defaultSlots = {};
          const defaultSlotNames = slotOrder;

          defaultSlotNames.forEach((name) => {
            defaultSlots[name] = {
              available: true,
              user: "",
              time: "",
              gender: "",
              vehicleType: "",
              vehicleNumber: "",
              paymentMethod: "",
            };
          });

          await set(ref(database, "parking"), defaultSlots);

          setParkingSlots(
            defaultSlotNames.map((name) => ({
              id: name,
              reserved: false,
              user: "",
              time: "",
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching parking data:", err);
        setError("Failed to load parking data.");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingData();
  }, []);

  const handleAddSlot = async () => {
    if (!slotName.trim()) {
      setSlotError("Slot name cannot be empty!");
      return;
    }

    try {
      setSlotError("");
      const newSlotRef = ref(database, `parking/${slotName}`);
      await set(newSlotRef, {
        available: true,
        user: "",
        time: "",
      });
      setParkingSlots((prev) => [
        ...prev,
        {
          id: slotName,
          reserved: false,
          user: "",
          time: "",
        },
      ]);
      setSlotName("");
      setSuccess(true);
      setOpenDialog(false);
    } catch (err) {
      console.error("Error adding slot:", err);
      alert("Failed to add slot. Try again.");
    }
  };

  const cancelReservation = async (slotId, name) => {
    try {
      await update(ref(database, `parking/${slotId}`), {
        available: true,
        user: "",
        time: "",
        gender: "",
        vehicleType: "",
        vehicleNumber: "",
        paymentMethod: "",
      });

      await remove(ref(database, `reservations/${name}`));

      setParkingSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, reserved: false, time: null } : slot
        )
      );
    } catch (err) {
      console.error("Error cancelling reservation:", err);
      alert("Failed to cancel reservation.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* <Tooltip title="Add Parking Slot">
        <Fab
          color="primary"
          onClick={() => setOpenDialog(true)}
          sx={{ position: "fixed", bottom: 24, right: 24 }}
        >
          <AddIcon />
        </Fab>
      </Tooltip> */}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Slot</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Slot Name"
            variant="outlined"
            value={slotName}
            onChange={(e) => setSlotName(e.target.value)}
            error={!!slotError}
            helperText={slotError}
            sx={{ mt: 1, width: "300px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddSlot} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">Slot added successfully!</Alert>
      </Snackbar>

      {parkingSlots.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" color="textSecondary">
            🚫 No parking slots available. Please add a new slot.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ textAlign: "", my: 2 }}>
            <Typography variant="h5" color="#186bc3">
              Current Parking Slots
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {parkingSlots.map((spot) => (
              <Grid item xs={12} sm={6} md={4} lg={4} xl={3} key={spot.id}>
                <Card
                  elevation={4}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    backgroundColor: spot.reserved ? "#ffe5e5" : "#e0f7e9",
                    boxShadow: spot.reserved
                      ? "0 4px 10px rgba(255, 0, 0, 0.2)"
                      : "0 4px 10px rgba(0, 200, 83, 0.2)",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      🅿️ Spot {spot.id}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {spot.reserved ? "🔴 Reserved" : "🟢 Available"}
                    </Typography>
                    {spot.reserved && (
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          ⏰ Time: {spot.time}
                        </Typography>
                      </>
                    )}
                  </CardContent>

                  {spot.reserved && (
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        onClick={() => cancelReservation(spot.id, spot.user)}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Cancel Reservation
                      </Button>
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
