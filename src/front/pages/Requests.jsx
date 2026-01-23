import {
    ClipboardList,
    Search,
    Plus,
    X,
    Check,
    Home,
    Calendar,
    MessageSquare,
    User
} from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { MultiStepForm } from "../../components/ui/multi-step-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
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
import ActionMenu from "../components/ActionMenu";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const getTodayISO = () => new Date().toISOString().split("T")[0];

const REQUEST_COLUMNS = [
    { key: "resident", label: "Residente / Depto" },
    { key: "type", label: "Tipo" },
    { key: "subject", label: "Asunto" },
    { key: "date", label: "Fecha" },
    { key: "status", label: "Estado" },
];

const Requests = () => {
    // --- Estados del Formulario ---
    const [residentName, setResidentName] = useState("");
    const [unitNumber, setUnitNumber] = useState(""); // Depto
    const [requestType, setRequestType] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [requestDate, setRequestDate] = useState(getTodayISO());
    // --- Estados de la Tabla ---
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [refresh, setRefresh] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const { user } = useAuth();
    const Icon = ClipboardList;

    // --- Carga de Datos ---
    useEffect(() => {
        if (!user?.condominium_id) return;
        // Asumiendo que crearás este endpoint en tu Flask
        axios.get(`${backendUrl}/api/requests?condominio_id=${user.condominium_id}`)
            .then(res => setRequests(res.data))
            .catch(err => setRequests([]));
    }, [user?.condominium_id, refresh]);

    // --- Lógica de Envío ---
    const handleSubmit = async () => {
        try {
            await axios.post(`${backendUrl}/api/requests`, {
                condominium_id: user.condominium_id,
                resident_name: residentName,
                unit_number: unitNumber,
                request_type: requestType,
                subject: subject,
                description: description,
                request_date: requestDate,
                status_id: 1 // Pendiente
            });
            alert("Solicitud registrada correctamente.");
            resetForm();
            setRefresh(prev => prev + 1);
        } catch (error) {
            alert("Error al registrar la solicitud.");
        }
    };

    const resetForm = () => {
        setResidentName("");
        setUnitNumber("");
        setRequestType("");
        setSubject("");
        setDescription("");
        setRequestDate(getTodayISO());
    };

    const handleStatusChange = async (req, statusId) => {
        try {
            await axios.put(`${backendUrl}/api/requests/${req.id}`, {
                status_id: statusId
            });
            setRefresh(prev => prev + 1);
        } catch (error) {
            alert("Error al actualizar el estado de la solicitud.");
        }
    };

    // --- Filtros y Paginación ---
    const filteredData = Array.isArray(requests)
        ? requests.filter((r) => {
            const searchTerm = search.toLowerCase();
            return (
                r.subject?.toLowerCase().includes(searchTerm) ||
                r.unit_number?.toLowerCase().includes(searchTerm) ||
                r.resident_name?.toLowerCase().includes(searchTerm)
            );
        })
        : [];

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const progress = Math.round(([residentName, unitNumber, requestType, subject].filter(f => f).length / 4) * 100);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] overflow-visible font-sans text-slate-900">

            {/* COLUMNA IZQUIERDA: Formulario Violeta */}
            <div className="w-full lg:w-[40%] h-full">
                <div className="p-6 h-full flex flex-col overflow-hidden">
                    <MultiStepForm
                        className="w-full h-full md:w-full"
                        title="Nueva Solicitud"
                        description="Registra reservas de espacios o requerimientos de vecinos."
                        currentStep={1}
                        totalSteps={1}
                        progress={progress}
                        accentColor="violet"
                        icon={Icon}
                        onNext={() => (residentName && subject) ? handleSubmit() : alert("Completa los campos obligatorios")}
                        nextButtonText="Registrar Solicitud"
                        fullWidthButton
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre Residente *</Label>
                                    <Input placeholder="Juan Pérez" value={residentName} onChange={e => setResidentName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>N° Unidad / Depto *</Label>
                                    <Input placeholder="Ej: 402-B" value={unitNumber} onChange={e => setUnitNumber(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Solicitud *</Label>
                                    <Select value={requestType} onValueChange={setRequestType}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Reserva">Reserva Espacio</SelectItem>
                                            <SelectItem value="Requerimiento">Requerimiento</SelectItem>
                                            <SelectItem value="Sugerencia">Sugerencia</SelectItem>
                                            <SelectItem value="Reclamo">Reclamo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha</Label>
                                    <Input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Asunto / Título *</Label>
                                <Input placeholder="Ej: Arriendo de Quincho" value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción Detallada</Label>
                                <textarea
                                    className="w-full min-h-[100px] rounded-md border border-slate-300 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-violet-400 transition-all outline-none"
                                    style={{ resize: 'none' }}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Indique detalles adicionales..."
                                />
                            </div>
                        </div>
                    </MultiStepForm>
                </div>
            </div>

            {/* COLUMNA DERECHA: Tabla Violeta */}
            <div className="w-full lg:w-[60%] h-full">
                <div className="p-6 h-full flex flex-col overflow-hidden">
                    <div className="w-full rounded-md border border-l-4 border-l-violet-500 bg-background overflow-hidden flex flex-col flex-1 shadow-sm">

                        <div className="flex items-center justify-between gap-4 border-b p-4 bg-violet-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                                    <ClipboardList className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold whitespace-nowrap text-violet-900">Gestión de Solicitudes</h3>
                            </div>
                            <Input
                                className="w-[200px] text-sm focus-visible:ring-violet-500"
                                placeholder="Buscar depto o asunto..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm">
                                <TableHeader>
                                    <TableRow className="sticky top-0 z-20 bg-violet-50/50 shadow-sm border-b-violet-100">
                                        {REQUEST_COLUMNS.map(col => (
                                            <TableHead key={col.key} className="font-bold text-violet-800 tracking-wide">{col.label}</TableHead>
                                        ))}
                                        <TableHead />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={REQUEST_COLUMNS.length + 1} className="text-center h-24 text-slate-400 italic">No hay solicitudes pendientes</TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map(r => (
                                            <TableRow key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-700">{r.resident_name}</span>
                                                        <span className="text-xs text-slate-400">Depto: {r.unit_number}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-slate-600">{r.request_type}</span>
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate" title={r.subject}>
                                                    {r.subject}
                                                </TableCell>
                                                <TableCell className="text-slate-500">
                                                    {new Date(r.request_date).toLocaleDateString("es-CL")}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "font-medium shadow-none border",
                                                        r.status_id === 1 && "bg-yellow-50 text-yellow-700 border-yellow-200",
                                                        r.status_id === 2 && "bg-violet-50 text-violet-700 border-violet-200", // Aprobado/En Proceso
                                                        r.status_id === 3 && "bg-red-50 text-red-700 border-red-200"
                                                    )}>
                                                        {r.status_name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right px-4">
                                                    <ActionMenu
                                                        expense={r}
                                                        onStatusChange={(id, sid) => handleStatusChange(r, sid)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </table>
                        </div>

                        {/* Paginación Temática Violeta */}
                        <div className="flex items-center justify-end p-4 border-t bg-slate-50/30">
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="hover:border-violet-500 hover:text-violet-600"
                            >
                                Anterior
                            </Button>
                            <div className="text-sm font-medium px-4 text-violet-900">
                                Página {currentPage} de {totalPages || 1}
                            </div>
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="hover:border-violet-500 hover:text-violet-600"
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

export default Requests;