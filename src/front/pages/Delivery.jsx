import { Package, X, Check, Calendar, User, MapPin, Box, CheckCircle, Clock, Search, LogOut } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
// Mismos componentes UI
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { MultiStepForm } from "../../components/ui/multi-step-form";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { cn } from "@/lib/utils";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Definimos las columnas específicas para Encomiendas
const DELIVERY_COLUMNS = [
    { key: "arrival", label: "Llegada" },
    { key: "unit", label: "Unidad" },
    { key: "details", label: "Destinatario / Código" },
    { key: "status", label: "Estado" },
    { key: "action", label: "Acción" },
];

const Deliveries = () => {
    // --- ESTADOS DEL FORMULARIO ---
    const [unitNumber, setUnitNumber] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [trackingCode, setTrackingCode] = useState("");
    const [comment, setComment] = useState("");

    // --- ESTADOS DE LISTA Y UI ---
    const [deliveries, setDeliveries] = useState([]);
    const [search, setSearch] = useState("");
    const [refresh, setRefresh] = useState(0);

    // Auth y Paginación
    const { user } = useAuth();
    const ITEMS_PER_PAGE = 8;
    const [currentPage, setCurrentPage] = useState(1);

    // --- EFECTOS DE CARGA (GET) ---
    useEffect(() => {
        if (!user?.condominium_id) return;

        // Cargamos las encomiendas filtrando por condominio
        axios.get(`${backendUrl}/api/deliveries?condominio_id=${user.condominium_id}`)
            .then(res => setDeliveries(res.data))
            .catch(err => {
                console.error("Error cargando encomiendas", err);
                setDeliveries([]);
            });
    }, [user?.condominium_id, refresh]);

    // --- LÓGICA: REGISTRAR PAQUETE (POST) ---
    const handleSubmit = async () => {
        try {
            await axios.post(`${backendUrl}/api/deliveries`, {
                condominium_id: user.condominium_id,
                unit_number: unitNumber,
                recipient_name: recipientName,
                tracking_code: trackingCode,
                comment: comment
            });
            resetForm();
            setRefresh(prev => prev + 1); // Recargar tabla
        } catch (error) {
            console.error(error);
            alert("Error al registrar el paquete. Verifica los datos.");
        }
    };

    // --- LÓGICA: MARCAR RETIRO (PUT) ---
    const handlePickup = async (deliveryId) => {
        if (!window.confirm("¿Confirmar que el residente retiró el paquete?")) return;

        try {
            await axios.put(`${backendUrl}/api/deliveries/${deliveryId}/pickup`);
            setRefresh(prev => prev + 1); // Recargar para ver cambio de estado
        } catch (error) {
            alert("Error al marcar el retiro.");
        }
    };

    const resetForm = () => {
        setUnitNumber("");
        setRecipientName("");
        setTrackingCode("");
        setComment("");
    };

    // --- FILTRADO Y PAGINACIÓN ---
    const filteredData = Array.isArray(deliveries)
        ? deliveries.filter((d) =>
            d.unit_number?.toLowerCase().includes(search.toLowerCase()) ||
            d.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
            d.tracking_code?.toLowerCase().includes(search.toLowerCase())
        ) : [];

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Helper para hora bonita
    const formatTime = (isoDate) => {
        if (!isoDate) return "--:--";
        return new Date(isoDate).toLocaleDateString("es-CL", {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] overflow-visible">

            {/* --- COLUMNA IZQUIERDA: FORMULARIO (AMBER) --- */}
            <div className="w-full lg:w-[40%] h-full">
                <div className="p-6 h-full flex flex-col overflow-hidden">
                    <MultiStepForm
                        className="w-full h-full md:w-full"
                        title="Recepción de Encomiendas"
                        description="Registro de paquetes y correspondencia."
                        currentStep={1}
                        totalSteps={1}
                        // Barra de progreso basada en campos llenos
                        progress={Math.round(([unitNumber, recipientName].filter(f => f).length / 2) * 100)}
                        onBack={() => { }}
                        onNext={() => {
                            if (!unitNumber) {
                                alert("La Unidad de Destino es obligatoria.");
                                return;
                            }
                            handleSubmit();
                        }}
                        nextButtonText="Registrar Paquete"
                        fullWidthButton={true}
                        accentColor="amber" // <--- COLOR ÁMBAR (CAJAS)
                        icon={Package} // Icono de Paquete
                    >
                        <div className="space-y-4">
                            {/* Unidad de Destino */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-amber-900 font-semibold">
                                    Unidad de Destino *
                                </Label>
                                <Input
                                    placeholder="Ej: 402"
                                    value={unitNumber}
                                    onChange={e => setUnitNumber(e.target.value)}
                                    className="bg-amber-50/50 border-amber-200 focus-visible:ring-amber-500 text-lg font-medium text-slate-700"
                                    autoFocus
                                />
                            </div>

                            {/* Datos del Paquete */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre en Etiqueta (Opcional)</Label>
                                    <Input
                                        placeholder="Ej: Juan Pérez"
                                        value={recipientName}
                                        onChange={e => setRecipientName(e.target.value)}
                                        className="focus-visible:ring-amber-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Código de Seguimiento / Barra</Label>
                                    <Input
                                        placeholder="Escanea o escribe..."
                                        value={trackingCode}
                                        onChange={e => setTrackingCode(e.target.value)}
                                        className="font-mono text-xs uppercase focus-visible:ring-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Comentarios */}
                            <div className="space-y-2">
                                <Label>Observaciones</Label>
                                <textarea
                                    className="w-full min-h-[80px] rounded-md border border-slate-300 bg-[var(--body-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-amber-400 transition-colors"
                                    style={{ resize: 'none' }}
                                    placeholder="Ej: Caja grande, Frágil, Dejar en conserjería..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                        </div>
                    </MultiStepForm>
                </div>
            </div>

            {/* --- COLUMNA DERECHA: TABLA (AMBER) --- */}
            <div className="w-full lg:w-[60%] h-full">
                <div className="p-6 h-full flex flex-col overflow-hidden">
                    <div className="w-full rounded-md border border-l-4 border-l-amber-500 bg-background overflow-hidden flex flex-col flex-1 shadow-sm font-sans">

                        {/* Header de la Tabla */}
                        <div className="flex items-center justify-between gap-4 border-b p-4 bg-amber-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <Box className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold whitespace-nowrap text-amber-900">Paquetes en Bodega</h3>
                            </div>
                            <Input
                                className="w-[200px] text-sm focus-visible:ring-amber-500"
                                placeholder="Buscar depto o nombre..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Contenido de la Tabla */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <TableHeader>
                                    <TableRow className="sticky top-0 z-20 bg-amber-50/50 shadow-sm border-b-amber-100">
                                        {DELIVERY_COLUMNS.map(col => (
                                            <TableHead key={col.key} className="font-bold text-amber-800 tracking-wide">
                                                {col.label}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={DELIVERY_COLUMNS.length} className="text-center h-24 text-muted-foreground italic text-slate-400">
                                                Bodega vacía. No hay paquetes registrados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map(d => (
                                            <TableRow key={d.id} className="hover:bg-slate-50/50 transition-colors group">

                                                {/* 1. LLEGADA */}
                                                <TableCell className="font-mono text-slate-600 text-xs">
                                                    {formatTime(d.arrival_time)}
                                                </TableCell>

                                                {/* 2. UNIDAD */}
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-bold">
                                                        {d.unit_number}
                                                    </Badge>
                                                </TableCell>

                                                {/* 3. DETALLES (Nombre + Código) */}
                                                <TableCell>
                                                    <div className="font-medium text-slate-700">
                                                        {d.recipient_name || <span className="text-slate-400 italic">Sin nombre</span>}
                                                    </div>
                                                    {d.tracking_code && (
                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                            #{d.tracking_code}
                                                        </div>
                                                    )}
                                                    {d.comment && (
                                                        <div className="text-[10px] text-slate-500 italic truncate max-w-[120px]">
                                                            "{d.comment}"
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* 4. ESTADO */}
                                                <TableCell>
                                                    {d.status === 'pending' ? (
                                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 shadow-sm">
                                                            <Clock className="w-3 h-3 mr-1" /> En Bodega
                                                        </Badge>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 shadow-none w-fit">
                                                                <CheckCircle className="w-3 h-3 mr-1" /> Entregado
                                                            </Badge>
                                                            <span className="text-[10px] text-slate-400 mt-1">
                                                                {d.pickup_time ? new Date(d.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* 5. ACCIÓN */}
                                                <TableCell className="text-right">
                                                    {d.status === 'pending' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handlePickup(d.id)}
                                                            className="h-8 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100 text-xs"
                                                        >
                                                            Entregar
                                                        </Button>
                                                    ) : (
                                                        <span className="flex items-center justify-end gap-1 text-xs text-slate-400">
                                                            <Check className="h-3 w-3" /> Listo
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="flex items-center justify-end p-4 border-t bg-slate-50/30">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="hover:border-amber-500 hover:text-amber-600"
                            >
                                Anterior
                            </Button>
                            <div className="text-sm font-medium px-4 text-amber-900 text-xs">
                                Página {currentPage} de {totalPages || 1}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="hover:border-amber-500 hover:text-amber-600"
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Deliveries;