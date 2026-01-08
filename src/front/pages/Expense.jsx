import {
    AlertTriangle,
    ArrowUpRight,
    FileText,
    Globe,
    Info,
    X,
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
import axios from "axios";
import { KpiCard } from "../../components/ui/kpi-card";
import { useAuth } from "../../context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL
const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const getTodayISO = () => new Date().toISOString().split("T")[0];



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


    const { user } = useAuth()
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;

    // Calculate progress
    // Each field contributes 20% since there are 5 fields
    const fields = [provider, category, expenseDate, amount, documentNumber];
    const filledFields = fields.filter((field) => field && field.trim() !== "").length; // Basic fields
    // You might want to consider files in progress, but requirement was simple. 
    // Let's keep the logic consistent with previous count, maybe just checks if basic info is there.
    const totalFields = 5;
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


    const tone =
        previousMonthTotal > currentMonthTotal ? "danger" : "success";

    return (
        <>
            <div className=" row   mt-5 mb-5 px-8 border border-danger">
                <div className="col-6 flex w-full justify-center p-6">
                    <MultiStepForm
                        title="Registro de Gasto"
                        description="Completa los datos para registrar un gasto del condominio."
                        currentStep={1}
                        totalSteps={1}
                        progress={progress}
                        progressText={`${progress}% completado`}
                        onBack={() => { }}
                        onNext={handleSubmit}
                        nextButtonText="Registrar Gasto"

                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* País */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label>Proveedor</Label>
                                    </div>
                                    <Select value={provider} onValueChange={setProvider}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Proveedor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providers.map((provider) => (
                                                <SelectItem key={provider.id} value={String(provider.id)}>
                                                    {provider.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label>Tipo de Gasto</Label>
                                    </div>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tipo de gasto" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Fecha */}
                                <div className="space-y-2">
                                    <Label>Fecha del gasto</Label>
                                    <Input
                                        type="date"
                                        value={expenseDate}
                                        onChange={(e) => setExpenseDate(e.target.value)}
                                    />
                                </div>

                                {/* N° Monto */}
                                <div className="space-y-2">
                                    <Label>Monto</Label>
                                    <Input
                                        placeholder="$ 0"
                                        value={amountDisplay}
                                        onChange={(e) => handleAmountChange(e)}
                                    />
                                </div>

                                {/* N° Documento */}
                                <div className="space-y-2">
                                    <Label>N° Documento</Label>
                                    <Input
                                        placeholder="Ej Número de factura 12345"
                                        value={documentNumber}
                                        onChange={(e) => setDocumentNumber(e.target.value)}
                                    />
                                </div>

                                {/* Observacion */}
                                <div className="space-y-2">
                                    <Label>Observación</Label>
                                    <textarea
                                        className="
                                w-full
                                min-h-[100px]
                                rounded-md
                                border
                                border-input
                                bg-background
                                px-3
                                py-2        
                                text-sm
                                resize-y
                                focus:outline-none
                                focus:ring-2
                                focus:ring-ring
                                "
                                        placeholder="Ej: Factura incluye enero y febrero"
                                        value={observation}
                                        onChange={(e) => setObservation(e.target.value)}
                                    />
                                </div>

                                {/*  Documento  Adjunto */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Documento Adjunto</Label>
                                    <Input
                                        type="file"
                                        placeholder="Opcional"
                                        onChange={handleFileChange}
                                        accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
                                        multiple
                                    />
                                    {files.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                            {files.map((file, index) => (
                                                <div key={index} className="relative group flex flex-col items-center justify-center p-2 border rounded-md hover:bg-slate-50 transition-colors">
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                                                        type="button"
                                                        title="Eliminar archivo"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>

                                                    {file.type.startsWith("image/") ? (
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={file.name}
                                                            className="h-20 w-20 object-cover rounded-md mb-2"
                                                        />
                                                    ) : (
                                                        <div className="h-20 w-20 flex items-center justify-center bg-slate-100 rounded-md mb-2">
                                                            <FileText className="h-10 w-10 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-center truncate w-full px-1" title={file.name}>
                                                        {file.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>
                    </MultiStepForm>
                </div>


                <div className="col-12 col-sm-6 col-md-5 col-lg-2 mb-5 p-6 ms-5">
                    <KpiCard
                        key={`${currentMonthTotal}-${previousMonthTotal}`}
                        label="📊  Comparativo de Gastos"
                        value={`Mes Actual ${formatCLP(currentMonthTotal)}`}
                        trend="flat"
                        caption={`Mes Anterior ${formatCLP(previousMonthTotal)}`}
                        tone={tone} />
                </div>


            </div>
        </>
    );
};

export default Expense;
