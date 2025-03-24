import React, { useEffect, useState } from "react";
import { database, ref, get, update, remove } from "./firebase/firebase";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    Alert,
    Grid2,
} from "@mui/material";

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const snapshot = await get(ref(database, "reservations"));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setReservations(
                        Object.keys(data).map((key) => ({
                            name: key,
                            ...data[key],
                        }))
                    );
                } else {
                    setReservations([]);
                }
            } catch (err) {
                console.error("Error fetching reservations:", err);
                setError("Failed to load reservations.");
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    const makeSlotAvailable = async (name, slot) => {
        try {
            await update(ref(database, `parking/${slot}`), {
                available: true,
                user: "",
                time: "",
                gender: "",
                vehicleType: "",
                vehicleNumber: "",
                paymentMethod: "",
            });

            await remove(ref(database, `reservations/${name}`));

            setReservations((prev) => prev.filter((res) => res.name !== name));
        } catch (err) {
            console.error("Error updating the slot or removing reservation:", err);
            alert("Failed to update the slot or remove reservation.");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" color="#186bc3">
                Active Reservations
            </Typography>

            <Box>
                <Grid container spacing={3}>
                    {reservations.length === 0 ? (
                        <Grid item xs={12}>

                            <Box sx={{ mt: 5, textAlign: "center" }}>

                                <Typography variant="h6" color="textSecondary">
                                    No reservations available.
                                </Typography>
                            </Box>

                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Slot</TableCell>
                                        <TableCell>Gender</TableCell>
                                        <TableCell>Vehicle Type</TableCell>
                                        <TableCell>Vehicle Number</TableCell>
                                        <TableCell>Payment Method</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reservations.map((res) => (
                                        <TableRow key={res.name}>
                                            <TableCell>{res.name}</TableCell>
                                            <TableCell>{res.slot}</TableCell>
                                            <TableCell>{res.gender}</TableCell>
                                            <TableCell>{res.vehicleType}</TableCell>
                                            <TableCell>{res.vehicleNumber}</TableCell>
                                            <TableCell>{res.paymentMethod}</TableCell>
                                            <TableCell>{res.time}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    size="small"
                                                    sx={{ '&:hover': { backgroundColor: 'red' }, fontWeight: 'bold' }}
                                                    onClick={() => {
                                                        if (window.confirm(`Free slot ${res.slot} reserved by ${res.name}?`)) {
                                                            makeSlotAvailable(res.name, res.slot);
                                                        }
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    );
};

export default Reservations;
