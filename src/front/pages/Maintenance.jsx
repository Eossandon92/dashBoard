import { FileText, Info, X, Check, Calendar, Wrench, CreditCard } from "lucide-react";
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

const MAINTENANCE_COLUMNS = [
    { key: "title", label: "Mantención" },
    { key: "provider", label: "Proveedor" },
    { key: "scheduled_date", label: "Fecha Prog." },
    { key: "estimated_cost", label: "Costo Est." },
    { key: "status", label: "Estado" },
];

const Maintenance = () => {
    // Form & List State
    const [title, setTitle] = useState("");
    const [scheduledDate, setScheduledDate] = useState(getTodayISO());
    const [estimatedCost, setEstimatedCost] = useState("");
    const [costDisplay, setCostDisplay] = useState("");
    const [description, setDescription] = useState("");
    const [providers, setProviders] = useState([]);
    const [provider, setProvider] = useState("");
    const [maintenances, setMaintenances] = useState([]);
    const [search, setSearch] = useState("");
    const [refresh, setRefresh] = useState(0);
    const [selectedMaint, setSelectedMaint] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [files, setFiles] = useState([]);

    // Modal Pago State
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        maintId: null,
        maintTitle: "",
        actual_cost: "",
        document_number: "",
        category_id: "1"
    });

    const { user } = useAuth();
    const ITEMS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);

    const formatCLP = (value) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency", currency: "CLP", minimumFractionDigits: 0,
        }).format(value);
    };

    // --- Efectos de Carga ---
    useEffect(() => {
        axios.get(`${backendUrl}/api/providers`)
            .then(res => setProviders(res.data))
            .catch(err => console.error("Error proveedores", err));
    }, []);

    useEffect(() => {
        if (!user?.condominium_id) return;
        axios.get(`${backendUrl}/api/maintenance?condominio_id=${user.condominium_id}`)
            .then(res => setMaintenances(res.data))
            .catch(err => setMaintenances([]));
    }, [user?.condominium_id, refresh]);

    // --- Lógica de Pago ---
    const handleConfirmPayment = async () => {
        if (!paymentData.actual_cost || !paymentData.document_number) {
            alert("Por favor completa el monto real y el número de documento.");
            return;
        }

        try {
            await axios.post(`${backendUrl}/api/maintenance/${paymentData.maintId}/pay`, {
                actual_cost: paymentData.actual_cost,
                document_number: paymentData.document_number,
                category_id: paymentData.category_id,
                user_id: user.id
            });

            alert("Pago procesado. Se ha generado un registro en Gastos.");
            setIsPayModalOpen(false);
            setRefresh(prev => prev + 1);
        } catch (error) {
            alert("Error al procesar el pago.");
        }
    };

    const handleStatusChange = async (maint, statusId) => {
        if (parseInt(statusId) === 2) {
            setPaymentData({
                maintId: maint.id,
                maintTitle: maint.title,
                actual_cost: maint.estimated_cost,
                document_number: "",
                category_id: "1"
            });
            setIsPayModalOpen(true);
        } else {
            try {
                await axios.put(`${backendUrl}/api/maintenance/${maint.id}`, {
                    maintenance_status_id: statusId
                });
                setRefresh(prev => prev + 1);
            } catch (error) {
                alert("Error al actualizar el estado.");
            }
        }
    };

    const handleSubmit = async () => {
        try {
            await axios.post(`${backendUrl}/api/maintenance`, {
                title,
                description,
                condominium_id: user.condominium_id,
                provider_id: provider,
                scheduled_date: scheduledDate,
                estimated_cost: estimatedCost,
            });
            resetForm();
            setRefresh(prev => prev + 1);
        } catch (error) {
            alert("Error al registrar la mantención.");
        }
    };

    const resetForm = () => {
        setTitle("");
        setScheduledDate(getTodayISO());
        setEstimatedCost("");
        setCostDisplay("");
        setProvider("");
        setDescription("");
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (indexToRemove) => {
        setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const filteredData = Array.isArray(maintenances)
        ? maintenances.filter((m) =>
            m.title?.toLowerCase().includes(search.toLowerCase()) ||
            m.provider_name?.toLowerCase().includes(search.toLowerCase())
        ) : [];

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <>
            <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] overflow-visible">
                {/* COLUMNA IZQUIERDA (Formulario Naranja) */}
                <div className="w-full lg:w-[40%] h-full">
                    <div className="p-6 h-full flex flex-col overflow-hidden">
                        <MultiStepForm
                            className="w-full h-full md:w-full"
                            title="Agendar Mantención"
                            description="Planifica trabajos técnicos y preventivos."
                            currentStep={1}
                            totalSteps={1}
                            progress={Math.round(([title, provider, scheduledDate, estimatedCost].filter(f => f).length / 4) * 100)}
                            onBack={() => { }}
                            onNext={() => {
                                if (!title || !provider) {
                                    alert("Completa los campos obligatorios antes de agendar.");
                                    return;
                                }
                                handleSubmit();
                            }}
                            nextButtonText="Agendar Mantención"
                            fullWidthButton={true}
                            accentColor="orange"
                            icon={Wrench}
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Título de la Mantención *</Label>
                                    <Input placeholder="Ej: Revisión Ascensor" value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Proveedor *</Label>
                                        <Select value={provider} onValueChange={setProvider}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                            <SelectContent>
                                                {providers.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fecha Programada *</Label>
                                        <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Presupuesto Estimado *</Label>
                                    <Input placeholder="$ 0" value={costDisplay} onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setEstimatedCost(val);
                                        setCostDisplay(val ? formatCLP(val) : "");
                                    }} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción / Notas</Label>
                                    <textarea
                                        className="w-full min-h-[80px] rounded-md border border-slate-300 bg-[var(--body-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 hover:border-orange-400 transition-colors"
                                        style={{ resize: 'none' }}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Documentos Adjuntos (Presupuestos)</Label>
                                    <Input type="file" onChange={handleFileChange} multiple />
                                    {files.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-3">
                                            {files.map((file, index) => (
                                                <div key={index} className="relative group border rounded-lg p-2 flex flex-col items-center bg-slate-50">
                                                    <FileText className="h-6 w-6 text-orange-500 mb-1" />
                                                    <span className="text-[10px] text-slate-600 truncate w-full text-center">{file.name}</span>
                                                    <button type="button" onClick={() => removeFile(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"><X className="h-3 w-3" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </MultiStepForm>
                    </div>
                </div>

                {/* COLUMNA DERECHA (Tabla Naranja) */}
                <div className="w-full lg:w-[60%] h-full ">
                    <div className="p-6 h-full flex flex-col overflow-hidden">
                        <div className="w-full rounded-md border border-l-4 border-l-orange-500 bg-background overflow-hidden flex flex-col flex-1 shadow-sm font-sans">
                            <div className="flex items-center justify-between gap-4 border-b p-4 bg-orange-50/30" >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                        <Wrench className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold whitespace-nowrap text-orange-900">Control de Mantenciones</h3>
                                </div>
                                <Input
                                    className="w-[200px] text-sm focus-visible:ring-orange-500"
                                    placeholder="Buscar por título o proveedor..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <TableHeader>
                                        <TableRow className="sticky top-0 z-20 bg-orange-50/50 shadow-sm border-b-orange-100">
                                            {MAINTENANCE_COLUMNS.map(col => (
                                                <TableHead key={col.key} className="font-bold text-orange-800 tracking-wide">{col.label}</TableHead>
                                            ))}
                                            <TableHead />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={MAINTENANCE_COLUMNS.length + 1} className="text-center h-24 text-muted-foreground italic text-slate-400">No hay mantenciones registradas</TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map(m => (
                                                <TableRow key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="font-medium text-slate-700">{m.title}</TableCell>
                                                    <TableCell className="text-slate-600">{m.provider_name}</TableCell>
                                                    <TableCell className="text-slate-500">{new Date(m.scheduled_date).toLocaleDateString("es-CL")}</TableCell>
                                                    <TableCell className="tabular-nums font-semibold">{formatCLP(m.estimated_cost)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={cn(
                                                            "font-medium shadow-none border",
                                                            m.status_id === 1 && "bg-yellow-50 text-yellow-700 border-yellow-200",
                                                            m.status_id === 2 && "bg-orange-50 text-orange-700 border-orange-200", // Cambiado a naranja para ser coherente
                                                            m.status_id === 3 && "bg-red-50 text-red-700 border-red-200"
                                                        )}>
                                                            {m.status_name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right px-4">
                                                        <ActionMenu
                                                            expense={m}
                                                            onStatusChange={(id, sid) => handleStatusChange(m, sid)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </table>
                            </div>

                            {/* PAGINACIÓN TEMÁTICA */}
                            <div className="flex items-center justify-end p-4 border-t bg-slate-50/30">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="hover:border-orange-500 hover:text-orange-600"
                                >
                                    Anterior
                                </Button>
                                <div className="text-sm font-medium px-4 text-orange-900 text-xs">
                                    Página {currentPage} de {totalPages || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="hover:border-orange-500 hover:text-orange-600"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE PAGO (Con acento verde para denotar éxito/financiero) */}
            {isPayModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-green-500">
                        <div className="p-6 border-b bg-green-50/30 flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-green-900"><CreditCard className="text-green-600" /> Confirmar Pago</h3>
                            <button onClick={() => setIsPayModalOpen(false)} className="hover:bg-green-100 p-1 rounded-full transition-colors"><X className="h-5 w-5 text-green-600" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 italic">Registrando pago final para: <span className="font-semibold text-slate-800">{paymentData.maintTitle}</span></p>
                            <div className="space-y-2">
                                <Label>Monto Final Cobrado (CLP) *</Label>
                                <Input type="number" className="focus-visible:ring-green-500" value={paymentData.actual_cost}
                                    onChange={e => setPaymentData({ ...paymentData, actual_cost: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Número de Documento (Boleta/Factura) *</Label>
                                <Input placeholder="Ej: F-990" className="focus-visible:ring-green-500 uppercase font-mono" value={paymentData.document_number}
                                    onChange={e => setPaymentData({ ...paymentData, document_number: e.target.value })} />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsPayModalOpen(false)} className="text-slate-500">Cancelar</Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200" onClick={handleConfirmPayment}>Generar Registro en Gastos</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Maintenance;