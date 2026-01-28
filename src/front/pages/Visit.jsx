import { FileText, X, Check, Calendar, User, MapPin, CarFront, LogOut, BookUser, Clock } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
// Mismos componentes UI que en tu Mantención
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

// Definimos las columnas específicas para Visitas
const VISIT_COLUMNS = [
    { key: "time", label: "Horario" },
    { key: "visitor", label: "Visitante" },
    { key: "unit", label: "Destino" },
    { key: "details", label: "Vehículo / Detalle" },
    { key: "action", label: "Estado / Acción" },
];

const Visits = () => {
    // --- ESTADOS DEL FORMULARIO ---
    const [visitorName, setVisitorName] = useState("");
    const [visitorRut, setVisitorRut] = useState("");
    const [unitNumber, setUnitNumber] = useState("");
    const [patent, setPatent] = useState("");
    const [comment, setComment] = useState("");

    // --- ESTADOS DE LISTA Y UI ---
    const [visits, setVisits] = useState([]);
    const [search, setSearch] = useState("");
    const [refresh, setRefresh] = useState(0);

    // Auth y Paginación
    const { user } = useAuth();
    const ITEMS_PER_PAGE = 8; // Un poco más porque las filas son más compactas
    const [currentPage, setCurrentPage] = useState(1);

    // --- EFECTOS DE CARGA (GET) ---
    useEffect(() => {
        if (!user?.condominium_id) return;

        // Cargamos las visitas filtrando por condominio
        axios.get(`${backendUrl}/api/visits?condominio_id=${user.condominium_id}`)
            .then(res => setVisits(res.data))
            .catch(err => {
                console.error("Error cargando visitas", err);
                setVisits([]);
            });
    }, [user?.condominium_id, refresh]);

    // --- LÓGICA: REGISTRAR ENTRADA (POST) ---
    const handleSubmit = async () => {
        try {
            await axios.post(`${backendUrl}/api/visits`, {
                condominium_id: user.condominium_id,
                visitor_name: visitorName,
                visitor_rut: visitorRut,
                unit_number: unitNumber,
                patent: patent, // Se envía tal cual (el backend acepta null o string)
                comment: comment
            });
            resetForm();
            setRefresh(prev => prev + 1); // Recargar tabla
        } catch (error) {
            console.error(error);
            alert("Error al registrar la visita. Verifica los datos.");
        }
    };

    // --- LÓGICA: MARCAR SALIDA (PUT) ---
    const handleExit = async (visitId) => {
        // Confirmación simple antes de cerrar
        if (!window.confirm("¿Confirmar salida de esta visita?")) return;

        try {
            await axios.put(`${backendUrl}/api/visits/${visitId}/exit`);
            setRefresh(prev => prev + 1); // Recargar tabla para ver la hora de salida
        } catch (error) {
            alert("Error al registrar la salida.");
        }
    };

    const resetForm = () => {
        setVisitorName("");
        setVisitorRut("");
        setUnitNumber("");
        setPatent("");
        setComment("");
    };

    // --- FILTRADO Y PAGINACIÓN (Igual a Mantenciones) ---
    const filteredData = Array.isArray(visits)
        ? visits.filter((v) =>
            v.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
            v.unit_number?.toLowerCase().includes(search.toLowerCase()) ||
            v.patent?.toLowerCase().includes(search.toLowerCase())
        ) : [];

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Helper para hora bonita
    const formatTime = (isoDate) => {
        if (!isoDate) return "--:--";
        return new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] overflow-visible">

            {/* --- COLUMNA IZQUIERDA: FORMULARIO (AZUL) --- */}
            <div className="w-full lg:w-[40%] h-full">
                <div className="p-6 h-full flex flex-col overflow-hidden">
                    <MultiStepForm
                        className="w-full h-full md:w-full"
                        title="Registrar Visita"
                        description="Control de acceso peatonal y vehicular."
                        currentStep={1}
                        totalSteps={1}
                        // Barra de progreso decorativa (calculada si hay datos llenos)
                        progress={Math.round(([visitorName, unitNumber].filter(f => f).length / 2) * 100)}
                        onBack={() => { }}
                        onNext={() => {
                            if (!visitorName || !unitNumber) {
                                alert("Nombre y Unidad son obligatorios.");
                                return;
                            }
                            handleSubmit();
                        }}
                        nextButtonText="Registrar Ingreso"
                        fullWidthButton={true}
                        accentColor="blue" // <--- CAMBIO DE COLOR A AZUL
                        icon={User} // Icono de usuario
                    >
                        <div className="space-y-4">
                            {/* Unidad de Destino */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"> Unidad / Depto *</Label>
                                <Input
                                    placeholder="Ej: 402"
                                    value={unitNumber}
                                    onChange={e => setUnitNumber(e.target.value)}
                                    className="bg-blue-50/30 focus-visible:ring-blue-500"
                                />
                            </div>

                            {/* Datos del Visitante */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Nombre Visitante *</Label>
                                    <Input
                                        placeholder="Nombre Completo"
                                        value={visitorName}
                                        onChange={e => setVisitorName(e.target.value)}
                                        className="focus-visible:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>RUT (Opcional)</Label>
                                    <Input
                                        placeholder="12.345.678-9"
                                        value={visitorRut}
                                        onChange={e => setVisitorRut(e.target.value)}
                                        className="focus-visible:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Patente (Opcional)</Label>
                                    <Input
                                        placeholder="Ej: BB-CL-20"
                                        value={patent}
                                        onChange={e => setPatent(e.target.value.toUpperCase())} // Auto mayúsculas
                                        className="uppercase font-mono placeholder:normal-case focus-visible:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Comentarios */}
                            <div className="space-y-2">
                                <Label>Observaciones</Label>
                                <textarea
                                    className="w-full min-h-[80px] rounded-md border border-slate-300 bg-[var(--body-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition-colors"
                                    style={{ resize: 'none' }}
                                    placeholder="Ej: Delivery, Técnico VTR..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                        </div>
                    </MultiStepForm>
                </div>
            </div>

            {/* --- COLUMNA DERECHA: TABLA (AZUL) --- */}
            <div className="w-full lg:w-[60%] h-full">
                <div className="p-6 h-full flex flex-col overflow-hidden">
                    <div className="w-full rounded-md border border-l-4 border-l-blue-500 bg-background overflow-hidden flex flex-col flex-1 shadow-sm font-sans">

                        {/* Header de la Tabla */}
                        <div className="flex items-center justify-between gap-4 border-b p-4 bg-blue-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <BookUser className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold whitespace-nowrap text-blue-900">Bitácora de Accesos</h3>
                            </div>
                            <Input
                                className="w-[200px] text-sm focus-visible:ring-blue-500"
                                placeholder="Buscar visita o patente..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Contenido de la Tabla */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <TableHeader>
                                    <TableRow className="sticky top-0 z-20 bg-blue-50/50 shadow-sm border-b-blue-100">
                                        {VISIT_COLUMNS.map(col => (
                                            <TableHead key={col.key} className="font-bold text-blue-800 tracking-wide">
                                                {col.label}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={VISIT_COLUMNS.length} className="text-center h-24 text-muted-foreground italic text-slate-400">
                                                No hay visitas registradas hoy
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map(v => (
                                            <TableRow key={v.id} className="hover:bg-slate-50/50 transition-colors group">

                                                {/* 1. HORARIO */}
                                                <TableCell className="font-mono text-slate-600">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700">{formatTime(v.entry_time)}</span>
                                                        {v.exit_time && (
                                                            <span className="text-[10px] text-red-400">Salida: {formatTime(v.exit_time)}</span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* 2. VISITANTE */}
                                                <TableCell>
                                                    <div className="font-medium text-slate-700">{v.visitor_name}</div>
                                                    {v.visitor_rut && <div className="text-[10px] text-slate-400">{v.visitor_rut}</div>}
                                                </TableCell>

                                                {/* 3. DESTINO */}
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                                                        {v.unit_number}
                                                    </Badge>
                                                </TableCell>

                                                {/* 4. DETALLES / PATENTE */}
                                                <TableCell>
                                                    {v.patent ? (
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <CarFront className="h-3 w-3 text-yellow-600" />
                                                            <span className="text-xs font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200">
                                                                {v.patent}
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                    {v.comment && (
                                                        <span className="text-[11px] text-slate-500 italic block max-w-[150px] truncate">
                                                            {v.comment}
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* 5. ACCIÓN (SALIDA) */}
                                                <TableCell className="text-right">
                                                    {v.is_active ? (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleExit(v.id)}
                                                            className="h-7 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-100"
                                                        >
                                                            <LogOut className="h-3 w-3 mr-1" /> Salida
                                                        </Button>
                                                    ) : (
                                                        <span className="flex items-center justify-end gap-1 text-xs text-slate-400">
                                                            <Check className="h-3 w-3" /> Completado
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </table>
                        </div>

                        {/* Paginación (Copia exacta de tu código) */}
                        <div className="flex items-center justify-end p-4 border-t bg-slate-50/30">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="hover:border-blue-500 hover:text-blue-600"
                            >
                                Anterior
                            </Button>
                            <div className="text-sm font-medium px-4 text-blue-900 text-xs">
                                Página {currentPage} de {totalPages || 1}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="hover:border-blue-500 hover:text-blue-600"
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

export default Visits;