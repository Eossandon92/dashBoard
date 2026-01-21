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
        if (parseInt(statusId) === 2) { // Si eligen PAGAR (ID 2 en tu tabla)
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

    const filteredData = Array.isArray(maintenances)
        ? maintenances.filter((m) =>
            m.title?.toLowerCase().includes(search.toLowerCase()) ||
            m.provider_name?.toLowerCase().includes(search.toLowerCase())
        ) : [];

    const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] overflow-visible">
            {/* FORMULARIO */}
            <div className="w-full lg:w-[40%] h-full p-6">
                <MultiStepForm
                    title="Agendar Mantención"
                    description="Planifica trabajos técnicos y preventivos."
                    progress={Math.round(([title, provider, scheduledDate, estimatedCost].filter(f => f).length / 4) * 100)}
                    onNext={() => title && provider ? handleSubmit() : alert("Completa los campos")}
                    nextButtonText="Agendar Mantención"
                    fullWidthButton
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
                    </div>
                </MultiStepForm>
            </div>

            {/* TABLA */}
            <div className="w-full lg:w-[60%] h-full p-6">
                <div className="w-full rounded-md border bg-background shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center gap-2"><Wrench /> Control</h3>
                        <Input className="w-[200px]" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm">
                            <TableHeader className="bg-slate-50 sticky top-0">
                                <TableRow>
                                    {MAINTENANCE_COLUMNS.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map(m => (
                                    <TableRow key={m.id}>
                                        <TableCell className="font-medium">{m.title}</TableCell>
                                        <TableCell>{m.provider_name}</TableCell>
                                        <TableCell>{new Date(m.scheduled_date).toLocaleDateString("es-CL")}</TableCell>
                                        <TableCell>{formatCLP(m.estimated_cost)}</TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "font-medium",
                                                m.status_id === 1 && "bg-yellow-100 text-yellow-800 border-yellow-200",
                                                m.status_id === 2 && "bg-green-100 text-green-800 border-green-200",
                                                m.status_id === 3 && "bg-red-100 text-red-800 border-red-200"
                                            )}>
                                                {m.status_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <ActionMenu
                                                expense={m}
                                                onStatusChange={(id, sid) => handleStatusChange(m, sid)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL DE PAGO */}
            {isPayModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard className="text-green-600" /> Pagar Mantención</h3>
                            <button onClick={() => setIsPayModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 italic">Registrando pago para: <span className="font-semibold text-slate-700">{paymentData.maintTitle}</span></p>
                            <div className="space-y-2">
                                <Label>Monto Final Cobrado (CLP) *</Label>
                                <Input type="number" value={paymentData.actual_cost}
                                    onChange={e => setPaymentData({ ...paymentData, actual_cost: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Número de Documento (Boleta/Factura) *</Label>
                                <Input placeholder="Ej: F-990" value={paymentData.document_number}
                                    onChange={e => setPaymentData({ ...paymentData, document_number: e.target.value })} />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsPayModalOpen(false)}>Cerrar</Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleConfirmPayment}>Confirmar y Generar Gasto</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;