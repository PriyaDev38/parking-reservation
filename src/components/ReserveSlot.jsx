import React, { useState, useEffect } from "react";
import { database, ref, get, update } from "./firebase/firebase";
import {
    Box,
    TextField,
    Button,
    Typography,
    Snackbar,
    Alert,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    CircularProgress,
    Paper,
} from "@mui/material";

const ReserveSlot = () => {
    const [slot, setSlot] = useState("");
    const [name, setName] = useState("");
    const [gender, setGender] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAvailableSlots = async () => {
            try {
                const snapshot = await get(ref(database, "parking"));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const slots = Object.keys(data)
                        .filter((key) => data[key].available)
                        .map((key) => ({ id: key, ...data[key] }));
                    setAvailableSlots(slots);
                }
            } catch (err) {
                console.error("Error fetching available slots:", err);
                setError("Failed to load slots. Try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableSlots();
    }, []);

    const reserveSlot = async () => {
        if (!slot || !name || !gender || !vehicleType || !vehicleNumber || !paymentMethod) {
            setError("Please fill all fields!");
            return;
        }

        try {
            const snapshot = await get(ref(database, `parking/${slot}`));
            if (!snapshot.exists() || !snapshot.val().available) {
                setError("Slot is no longer available.");
                return;
            }

            const time = new Date().toLocaleTimeString();

            await update(ref(database, `parking/${slot}`), {
                available: false,
                user: name,
                time,
                gender,
                vehicleType,
                vehicleNumber,
                paymentMethod,
            });

            await update(ref(database, `reservations/${name}`), {
                slot,
                time,
                gender,
                vehicleType,
                vehicleNumber,
                paymentMethod,
            });

            setSuccess(true);
            setSlot("");
            setName("");
            setGender("");
            setVehicleType("");
            setVehicleNumber("");
            setPaymentMethod("");
            setError("");
            setAvailableSlots((prev) => prev.filter((s) => s.id !== slot));
        } catch (err) {
            console.error("Error reserving slot:", err);
            setError("Failed to reserve slot. Please try again.");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 2,
                gap: 1,
                display: "flex",
                flexDirection: "column",
                maxWidth: 600,
                margin: "40px auto",
                borderRadius: 3,
                backgroundColor: "#ffffff",
            }}
        >
            <Typography variant="h5" color="#186bc3">
                Reserve a Spot
            </Typography>

            <FormControl fullWidth variant="outlined">
                <InputLabel>Available Slot</InputLabel>
                <Select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    label="Available Slot"
                >
                    {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                            <MenuItem key={slot.id} value={slot.id}>
                                {slot.id}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>No available slots</MenuItem>
                    )}
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
            />

            <FormControl fullWidth variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select value={gender} onChange={(e) => setGender(e.target.value)} label="Gender">
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined">
                <InputLabel>Vehicle Type</InputLabel>
                <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} label="Vehicle Type">
                    <MenuItem value="Two-Wheeler">Two-Wheeler</MenuItem>
                    <MenuItem value="Four-Wheeler">Four-Wheeler</MenuItem>
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Vehicle Number"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                variant="outlined"
            />

            <FormControl fullWidth variant="outlined">
                <InputLabel>Payment Method</InputLabel>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} label="Payment Method">
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                </Select>
            </FormControl>

            <Button variant="contained" color="primary" onClick={reserveSlot} sx={{ fontWeight: "bold", mt: 2 }}>
                Reserve Slot
            </Button>

            <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}>
                <Alert severity="success">Slot reserved successfully!</Alert>
            </Snackbar>

            {error && (
                <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
            )}
        </Box>
    );
};

export default ReserveSlot;
