import {
    AlertTriangle,
    ArrowUpRight,
    FileText,
    Globe,
    Info,
    X,
    Pencil,
    Trash2,
    Plus,
    CircleX,
} from "lucide-react";
import * as React from "react";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "../../components/ui/alert";
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
import { KpiCard } from "../../components/ui/kpi-card";
import { useAuth } from "../../context/AuthContext";
import { cn } from "@/lib/utils";

const backendUrl = import.meta.env.VITE_BACKEND_URL
const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const getTodayISO = () => new Date().toISOString().split("T")[0];



/* ===============================
   COLUMNAS
================================ */

const EXPENSE_COLUMNS = [
    { key: "provider", label: "Proveedor" },
    { key: "category", label: "Categoría" },
    { key: "amount", label: "Monto" },
    { key: "date", label: "Fecha" },
    { key: "document_number", label: "N° Documento" },
    { key: "status", label: "Estado" },
];


/* -----------------------------
   Tooltip reutilizable
-------------------------------- */
const TooltipIcon = ({ text }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
                <p className="max-w-xs text-sm">{text}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

/* =============================
   EXPENSE / GASTOS
============================= */
const Expense = () => {
    // form state
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
    const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
    const [previousMonthTotal, setPreviousMonthTotal] = useState(0);
    const [refreshExpenses, setRefreshExpenses] = useState(0);
    const [activeTable, setActiveTable] = useState("Gastos");
    const [search, setSearch] = useState("");
    const [expenses, setExpenses] = useState([]);



    const { user } = useAuth()
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;

    // Calculate progress
    // Each field contributes 20% since there are 5 fields
    const fields = [provider, category, expenseDate, amount, documentNumber, observation];
    const filledFields = fields.filter((field) => field && field.trim() !== "").length; // Basic fields
    // You might want to consider files in progress, but requirement was simple. 
    // Let's keep the logic consistent with previous count, maybe just checks if basic info is there.
    const totalFields = 6;
    const progress = Math.round((filledFields / totalFields) * 100);
    const handleSubmit = async () => {
        try {

            const formData = new FormData()
            formData.append("provider_id", provider)
            formData.append("category_id", category)
            formData.append("condominium_id", user.condominium_id)
            formData.append("expense_date", expenseDate)
            formData.append("observation", observation)
            formData.append("amount", amount)
            formData.append("document_number", documentNumber)

            const response = await axios.post(
                `${backendUrl}/api/expenses`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            console.log("Gasto creado:", response.data)
            alert("Gasto registrado exitosamente!")
            resetForm()
            setRefreshExpenses((prev) => prev + 1);
        } catch (error) {
            console.error("Error:", error.response?.data || error)
            alert("No se pudo registrar el gasto")
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
        // Quita todo lo que no sea número
        const rawValue = e.target.value.replace(/\D/g, "");

        setAmount(rawValue);

        if (rawValue === "") {
            setAmountDisplay("");
        } else {
            setAmountDisplay(formatCLP(Number(rawValue)));
        }
    };

    const formatCLP = (value) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (indexToRemove) => {
        setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };
    const getCondominiumId = () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return null;

        try {
            const parsed = JSON.parse(storedUser);
            return parsed?.condominium_id ?? null;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetch(`${backendUrl}/api/expenses/category`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Error cargando categorías", err));
    }, []);

    useEffect(() => {
        fetch(`${backendUrl}/api/providers`)
            .then(res => res.json())
            .then(data => setProviders(data))
            .catch(err => console.error("Error cargando proveedores", err));
    }, []);

    useEffect(() => {
        if (!user?.condominium_id) return;

        fetch(
            `${backendUrl}/api/expenses/condominium?condominium_id=${user.condominium_id}`
        )
            .then(res => res.json())
            .then(data => {
                setExpenses(data);
            })
            .catch(err => console.error(err));
    }, [user?.condominium_id, refreshExpenses]);




    useEffect(() => {
        if (!user?.condominium_id) return;

        const fetchTotals = async () => {
            try {
                const [currentRes, previousRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/expenses/monthly`, {
                        params: {
                            condominium_id: user.condominium_id,
                            month,
                            year,
                        },
                    }),
                    axios.get(`${backendUrl}/api/expenses/monthly`, {
                        params: {
                            condominium_id: user.condominium_id,
                            month: previousMonth,
                            year: previousYear,
                        },
                    }),
                ]);

                setCurrentMonthTotal(currentRes.data.total_amount);
                setPreviousMonthTotal(previousRes.data.total_amount);
            } catch (err) {
                console.error("Error cargando totales", err);
            }
        };

        fetchTotals();
    }, [
        user?.condominium_id,
        month,
        year,
        previousMonth,
        previousYear,
        refreshExpenses,
    ]);

    const current = Number(currentMonthTotal) || 0;
    const previous = Number(previousMonthTotal) || 0;
    let tone = "success";

    if (current > previous) {
        tone = "warning";
    }

    if (current > previous * 1.3) {
        tone = "danger";
    }
    const trend =
        currentMonthTotal > previousMonthTotal
            ? "up"
            : currentMonthTotal < previousMonthTotal
                ? "down"
                : "flat";

    return (
        <>
            <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] overflow-visible">
                {/* COLUMNA IZQUIERDA */}
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
                        >
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                    {/* Proveedor */}
                                    <div className="space-y-2">
                                        <Label>Proveedor *</Label>
                                        <Select value={provider} onValueChange={setProvider} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Proveedor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {providers.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Tipo de Gasto */}
                                    <div className="space-y-2">
                                        <Label>Tipo de Gasto *</Label>
                                        <Select value={category} onValueChange={setCategory} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tipo de gasto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Fecha */}
                                    <div className="space-y-2">
                                        <Label>Fecha del gasto *</Label>
                                        <Input
                                            type="date"
                                            value={expenseDate}
                                            onChange={(e) => setExpenseDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Monto */}
                                    <div className="space-y-2">
                                        <Label>Monto *</Label>
                                        <Input
                                            placeholder="$ 0"
                                            value={amountDisplay}
                                            onChange={handleAmountChange}
                                            required
                                        />
                                    </div>

                                    {/* Documento */}
                                    <div className="space-y-2">
                                        <Label>N° Documento *</Label>
                                        <Input
                                            placeholder="Ej: Factura 12345"
                                            value={documentNumber}
                                            onChange={(e) => setDocumentNumber(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Observación */}
                                    <div className="space-y-2">
                                        <Label>Observación *</Label>
                                        <textarea
                                            className="w-full min-h-[100px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                                            value={observation}
                                            onChange={(e) => setObservation(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Archivos */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Documento Adjunto</Label>
                                        <Input
                                            type="file"
                                            onChange={handleFileChange}
                                            multiple
                                        />
                                    </div>
                                </div>
                            </div>
                        </MultiStepForm>
                    </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div className="w-full lg:w-[60%] h-full ">
                    <div className="p-6 h-full flex flex-col overflow-hidden">
                        <div className="w-full rounded-md border bg-background overflow-hidden flex flex-col flex-1 shadow-sm">
                            <div className="flex items-center justify-between gap-4 border-b p-4" >
                                <h3 className="text-xl font-bold  whitespace-nowrap">
                                    Historial de Gastos
                                </h3>
                                <Input
                                    className="w-[180px] text-sm"
                                    placeholder="Buscar…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>


                            <div className="flex-1 overflow-auto">
                                <table className="w-full caption-bottom text-sm">

                                    {/* HEADER */}
                                    <TableHeader>
                                        <TableRow className="sticky top-0 z-20 bg-slate-50 shadow-sm">
                                            {EXPENSE_COLUMNS.map((c) => (
                                                <TableHead
                                                    key={c.key}
                                                    className="font-semibold text-slate-600 tracking-wide"
                                                >
                                                    {c.label}
                                                </TableHead>
                                            ))}
                                            <TableHead className="text-center font-semibold text-slate-600 tracking-wide">
                                                Acciones

                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    {/* BODY */}
                                    <TableBody>
                                        {expenses.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={EXPENSE_COLUMNS.length + 1}
                                                    className="text-center h-24 text-muted-foreground"
                                                >
                                                    Sin datos
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            expenses
                                                .filter((e) =>
                                                    e.document_number?.toLowerCase().includes(search.toLowerCase())
                                                )
                                                .map((expense) => (
                                                    <TableRow key={expense.id}>
                                                        <TableCell>{expense.provider_name}</TableCell>
                                                        <TableCell>{expense.category_name}</TableCell>
                                                        <TableCell className="text-left tabular-nums">
                                                            {formatCLP(expense.amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(expense.expense_date).toLocaleDateString("es-CL")}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {expense.document_number}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={cn(
                                                                    "font-medium",
                                                                    expense.status === "Pendiente" &&
                                                                    "bg-yellow-100 text-yellow-800",
                                                                    expense.status === "Pagado" &&
                                                                    "bg-green-100 text-green-800"
                                                                )}
                                                            >
                                                                {expense.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex justify-center gap-3">
                                                                <Button size="icon" variant="ghost" className="hover:bg-slate-100">
                                                                    <Pencil className="h-4 w-4 text-slate-600" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="hover:bg-red-50 hover:text-red-600">
                                                                    <CircleX className="h-4 w-4 text-red-400 transition-colors" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </table>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </>
    );

};

export default Expense;
