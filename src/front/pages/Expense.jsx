import {
    Info,
    X,
    Check,
    DollarSign,
    FileText,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../components/ui/tooltip";
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

const backendUrl = import.meta.env.VITE_BACKEND_URL
const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const getTodayISO = () => new Date().toISOString().split("T")[0];

const EXPENSE_COLUMNS = [
    { key: "provider", label: "Proveedor" },
    { key: "category", label: "Categoría" },
    { key: "amount", label: "Monto" },
    { key: "date", label: "Fecha" },
    { key: "document_number", label: "N° Docum" },
    { key: "status", label: "Estado" },
];

const Expense = () => {
    const [expenseDate, setExpenseDate] = useState(getTodayISO());
    const [amount, setAmount] = useState("");
    const [amountDisplay, setAmountDisplay] = useState("");
    const [documentNumber, setDocumentNumber] = useState("");
    const [files, setFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [providers, setProviders] = useState([]);
    const [provider, setProvider] = useState("");
    const [observation, setObservation] = useState("");
    const [refreshExpenses, setRefreshExpenses] = useState(0);
    const [search, setSearch] = useState("");
    const [expenses, setExpenses] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { user } = useAuth()

    const ITEMS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);

    const filteredExpenses = expenses.filter((e) =>
        e.document_number?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const paginatedExpenses = filteredExpenses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [statuses, setStatuses] = useState([]);

    const handleStartEdit = (expense) => {
        setEditingId(expense.id);
        setEditForm({
            provider_id: expense.provider_id ? String(expense.provider_id) : "",
            category_id: expense.category_id ? String(expense.category_id) : "",
            amount: expense.amount,
            expense_date: expense.expense_date ? expense.expense_date.split("T")[0] : "",
            document_number: expense.document_number || "",
            expense_status_id: expense.expense_status_id ? String(expense.expense_status_id) : "",
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleEditFormChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveEdit = async (id) => {
        try {
            const payload = { ...editForm, condominium_id: user.condominium_id };
            await axios.put(`${backendUrl}/api/expenses/${id}`, payload);
            setRefreshExpenses((prev) => prev + 1);
            handleCancelEdit();
        } catch (error) {
            console.error(error);
            alert("Error al actualizar el gasto");
        }
    };

    const handleChangeStatus = async (expenseId, newStatusId) => {
        try {
            await axios.put(`${backendUrl}/api/expenses/${expenseId}`, { expense_status_id: newStatusId });
            setRefreshExpenses((prev) => prev + 1);
        } catch (error) {
            console.error(error);
            alert("No se pudo actualizar el estado del gasto");
        }
    }

    const fields = [provider, category, expenseDate, amount, documentNumber, observation];
    const filledFields = fields.filter((field) => field && field.trim() !== "").length;
    const totalFields = 6;
    const progress = Math.round((filledFields / totalFields) * 100);

    const handleSubmit = async () => {
        try {
            const formData = new FormData()
            formData.append("provider_id", provider);
            formData.append("category_id", category);
            formData.append("condominium_id", user.condominium_id);
            formData.append("expense_date", expenseDate);
            formData.append("observation", observation);
            formData.append("amount", amount);
            formData.append("document_number", documentNumber);

            await axios.post(`${backendUrl}/api/expenses`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            resetForm();
            setRefreshExpenses((prev) => prev + 1);
        } catch (error) {
            console.error(error);
            alert("No se pudo registrar el gasto");
        }
    }

    const resetForm = () => {
        setExpenseDate(getTodayISO());
        setAmount("");
        setAmountDisplay("");
        setDocumentNumber("");
        setFiles([]);
        setCategory("");
        setProvider("");
        setObservation("");
    };

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        setAmount(rawValue);
        setAmountDisplay(rawValue === "" ? "" : formatCLP(Number(rawValue)));
    };

    const handleShowDetail = (expense) => {
        setSelectedExpense(expense);
        setIsDetailOpen(true);
    };

    const formatCLP = (value) => {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(value);
    };

    const handleFileChange = (e) => {
        if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    };

    const removeFile = (indexToRemove) => {
        setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        fetch(`${backendUrl}/api/expenses/category`).then(res => res.json()).then(data => setCategories(data));
        fetch(`${backendUrl}/api/providers`).then(res => res.json()).then(data => setProviders(data));
        fetch(`${backendUrl}/api/expenses/status`).then(res => res.json()).then(data => setStatuses(data));
    }, []);

    useEffect(() => {
        if (!user?.condominium_id) return;
        fetch(`${backendUrl}/api/expenses/condominium?condominium_id=${user.condominium_id}`)
            .then(res => res.json())
            .then(data => setExpenses(data));
    }, [user?.condominium_id, refreshExpenses]);

    return (
        <>
            <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] overflow-visible">
                {/* COLUMNA IZQUIERDA (Formulario) */}
                <div className="w-full lg:w-[40%] h-full">
                    <div className="p-6 h-full flex flex-col overflow-hidden">
                        <MultiStepForm
                            className="w-full h-full md:w-full"
                            title="Registro de Gasto"
                            description="Completa todos los campos obligatorios *."
                            currentStep={1}
                            totalSteps={1}
                            progress={progress}
                            progressText={`${progress}% completado`}
                            onBack={() => { }}
                            onNext={() => {
                                if (progress < 100) {
                                    alert("Debes completar todos los campos obligatorios antes de registrar.");
                                    return;
                                }
                                handleSubmit();
                            }}
                            nextButtonText="Registrar Gasto"
                            fullWidthButton={true}
                            accentColor="emerald"
                            icon={DollarSign}
                        >
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Proveedor *</Label>
                                        <Select value={provider} onValueChange={setProvider} required>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                            <SelectContent>{providers.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tipo de Gasto *</Label>
                                        <Select value={category} onValueChange={setCategory} required>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                            <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fecha del gasto *</Label>
                                        <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="focus-visible:ring-emerald-500" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Monto *</Label>
                                        <Input placeholder="$ 0" value={amountDisplay} onChange={handleAmountChange} className="focus-visible:ring-emerald-500" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>N° Documento *</Label>
                                        <Input placeholder="Ej: Factura 12345" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className="focus-visible:ring-emerald-500" required />
                                    </div>
                                    <div className="">
                                        <Label>Detalle *</Label>
                                        <textarea
                                            className="w-full min-h-[100px] rounded-md border border-slate-300 bg-[var(--body-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-emerald-500 transition-colors"
                                            style={{ resize: 'none' }}
                                            value={observation}
                                            onChange={(e) => setObservation(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Documento Adjunto</Label>
                                        <Input type="file" onChange={handleFileChange} multiple />
                                        {files.length > 0 && (
                                            <div className="grid grid-cols-2 gap-4 mt-2 sm:grid-cols-3 md:grid-cols-4">
                                                {files.map((file, index) => (
                                                    <div key={index} className="relative group border rounded-lg p-2 flex flex-col items-center bg-slate-50">
                                                        {file.type.startsWith("image/") ? (
                                                            <img src={URL.createObjectURL(file)} alt="preview" className="h-20 w-full object-cover rounded-md" />
                                                        ) : (
                                                            <div className="h-20 w-full flex items-center justify-center bg-slate-200 rounded-md"><FileText className="h-8 w-8 text-slate-500" /></div>
                                                        )}
                                                        <span className="text-xs text-slate-600 mt-2 truncate w-full text-center" title={file.name}>{file.name}</span>
                                                        <button type="button" onClick={() => removeFile(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"><X className="h-3 w-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </MultiStepForm>
                    </div>
                </div>

                {/* COLUMNA DERECHA (Tabla con Colores Temáticos) */}
                <div className="w-full lg:w-[60%] h-full ">
                    <div className="p-6 h-full flex flex-col overflow-hidden">
                        {/* border-l-4 y border-t-emerald le dan la identidad visual */}
                        <div className="w-full rounded-md border border-l-4 border-l-emerald-500 bg-background overflow-hidden flex flex-col flex-1 shadow-sm">
                            <div className="flex items-center justify-between gap-4 border-b p-4 bg-emerald-50/30" >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold whitespace-nowrap text-emerald-900">Historial de Gastos</h3>
                                </div>
                                <Input className="w-[180px] text-sm focus-visible:ring-emerald-500" placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <TableHeader>
                                        <TableRow className="sticky top-0 z-20 bg-emerald-50/50 shadow-sm border-b-emerald-100">
                                            {EXPENSE_COLUMNS.map((c) => (
                                                <TableHead key={c.key} className="font-bold text-emerald-800 tracking-wide">{c.label}</TableHead>
                                            ))}
                                            <TableHead className=""></TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {paginatedExpenses.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={EXPENSE_COLUMNS.length + 1} className="text-center h-24 text-muted-foreground">Sin datos</TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedExpenses.map((expense) => {
                                                const isEditing = editingId === expense.id;
                                                return (
                                                    <TableRow key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <TableCell>{isEditing ? (
                                                            <Select value={editForm.provider_id} onValueChange={(val) => handleEditFormChange("provider_id", val)}>
                                                                <SelectTrigger className="h-8 w-full"><SelectValue placeholder="Proveedor" /></SelectTrigger>
                                                                <SelectContent>{providers.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}</SelectContent>
                                                            </Select>
                                                        ) : expense.provider_name}</TableCell>
                                                        <TableCell>{isEditing ? (
                                                            <Select value={editForm.category_id} onValueChange={(val) => handleEditFormChange("category_id", val)}>
                                                                <SelectTrigger className="h-8 w-full"><SelectValue placeholder="Categoría" /></SelectTrigger>
                                                                <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}</SelectContent>
                                                            </Select>
                                                        ) : expense.category_name}</TableCell>
                                                        <TableCell className="text-left tabular-nums font-medium text-slate-700">{isEditing ? (
                                                            <Input className="h-8 w-24" type="number" value={editForm.amount} onChange={(e) => handleEditFormChange("amount", e.target.value)} />
                                                        ) : formatCLP(expense.amount)}</TableCell>
                                                        <TableCell className="px-1 text-slate-500">{isEditing ? (
                                                            <Input className="h-8 w-32" type="date" value={editForm.expense_date} onChange={(e) => handleEditFormChange("expense_date", e.target.value)} />
                                                        ) : new Date(expense.expense_date).toLocaleDateString("es-CL")}</TableCell>
                                                        <TableCell className="text-center font-mono text-xs">{isEditing ? (
                                                            <Input className="h-8 w-full" value={editForm.document_number} onChange={(e) => handleEditFormChange("document_number", e.target.value)} />
                                                        ) : expense.document_number || 'S/N'}</TableCell>
                                                        <TableCell className="text-left px-1">{isEditing ? (
                                                            <Select value={editForm.expense_status_id} onValueChange={(val) => handleEditFormChange("expense_status_id", val)}>
                                                                <SelectTrigger className="h-8 w-32"><SelectValue placeholder="Estado" /></SelectTrigger>
                                                                <SelectContent>{statuses.map((s) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}</SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <Badge className={cn(
                                                                "font-medium",
                                                                expense.status === "Pendiente" && "bg-yellow-100 text-yellow-800",
                                                                expense.status === "Pagado" && "bg-emerald-100 text-emerald-800",
                                                                expense.status === "Anulado" && "bg-red-100 text-red-800",
                                                                expense.status === "Aprobado" && "bg-blue-100 text-blue-800"
                                                            )}>{expense.status}</Badge>
                                                        )}</TableCell>
                                                        <TableCell className="text-right px-4">
                                                            {isEditing ? (
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="icon" variant="ghost" className="hover:bg-emerald-50 hover:text-emerald-600" onClick={() => handleSaveEdit(expense.id)}><Check className="h-4 w-4" /></Button>
                                                                    <Button size="icon" variant="ghost" className="hover:bg-red-50 hover:text-red-600" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                                                                </div>
                                                            ) : (
                                                                <ActionMenu expense={expense} onDetail={handleShowDetail} onEdit={handleStartEdit} onStatusChange={handleChangeStatus} />
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </table>
                            </div>

                            <div className="flex items-center justify-end p-4 border-t bg-slate-50/30">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                                >
                                    Anterior
                                </Button>
                                <div className="text-sm font-medium px-4 text-emerald-900">
                                    Página {currentPage} de {totalPages || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE DETALLE (Omitido por espacio, pero se mantiene igual) */}
            {isDetailOpen && selectedExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                            <div>
                                <h3 className="text-lg font-semibold text-emerald-900">Detalle del Gasto</h3>
                                <p className="text-sm text-emerald-600">Documento N° {selectedExpense.document_number || 'S/N'}</p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-emerald-100 rounded-full transition-colors"><X className="h-5 w-5 text-emerald-600" /></button>
                        </div>
                        {/* Contenido del modal se mantiene igual */}
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedExpense.status === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : selectedExpense.status === 'Anulado' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{selectedExpense.status}</span>
                                        <span className="text-sm text-slate-500">{selectedExpense.expense_date}</span>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Monto Total</label>
                                        <div className="text-3xl font-bold text-slate-800">${new Intl.NumberFormat('es-CL').format(selectedExpense.amount)}</div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100"><span className="text-xs text-slate-400 block mb-1">Proveedor</span><span className="font-medium text-slate-700">{selectedExpense.provider_name}</span></div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100"><span className="text-xs text-slate-400 block mb-1">Categoría</span><span className="font-medium text-slate-700">{selectedExpense.category_name}</span></div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100"><span className="text-xs text-slate-400 block mb-1">Observación</span><p className="text-sm text-slate-600 leading-relaxed">{selectedExpense.observation || "Sin observaciones registradas."}</p></div>
                                    </div>
                                </div>
                                <div className="border-l border-slate-100 md:pl-8">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><FileText className="h-4 w-4" /> Documentos Adjuntos</h4>
                                    <div className="space-y-4">
                                        {selectedExpense.documents && selectedExpense.documents.length > 0 ? (
                                            selectedExpense.documents.map((doc, index) => (
                                                <div key={index} className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-md transition-all">
                                                    {doc.url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                            <img src={doc.url} alt="Comprobante" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        </a>
                                                    ) : (
                                                        <div className="p-6 flex flex-col items-center justify-center text-slate-400"><FileText className="h-12 w-12 mb-2" /><a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">Ver Documento</a></div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-40 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-slate-50/50"><FileText className="h-8 w-8 mb-2 opacity-50" /><span className="text-sm">No hay archivos adjuntos</span></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Expense;