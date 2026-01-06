import * as React from "react";
import {
    AlertTriangle,
    ArrowUpRight,
    Globe,
    Info,
} from "lucide-react";

import { MultiStepForm } from "../../components/ui/multi-step-form";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
    const [country, setCountry] = React.useState("");
    const [startDate, setStartDate] = React.useState("");
    const [regNumber, setRegNumber] = React.useState("");
    const [confirmRegNumber, setConfirmRegNumber] = React.useState("");

    // Calculate progress
    // Each field contributes 25% since there are 4 fields
    const fields = [country, startDate, regNumber, confirmRegNumber];
    const filledFields = fields.filter((field) => field && field.trim() !== "").length;
    const totalFields = 4;
    const progress = Math.round((filledFields / totalFields) * 100);

    const handleSubmit = () => {
        if (regNumber !== confirmRegNumber) return;
        console.log("Registrando gasto:", { country, startDate, regNumber });
        alert("Gasto registrado exitosamente!");
    };

    return (
        <div className="flex w-full justify-center p-6">
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
                onClose={() => console.log("Cerrar formulario")}
                footerContent={
                    <a
                        href="#"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        ¿Necesitas ayuda? <ArrowUpRight className="h-4 w-4" />
                    </a>
                }
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* País */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>País</Label>
                                <TooltipIcon text="País donde se realizó el gasto." />
                            </div>
                            <Select value={country} onValueChange={setCountry}>
                                <SelectTrigger>
                                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Selecciona un país" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cl">Chile</SelectItem>
                                    <SelectItem value="ar">Argentina</SelectItem>
                                    <SelectItem value="pe">Perú</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fecha */}
                        <div className="space-y-2">
                            <Label>Fecha del gasto</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        {/* N° Documento */}
                        <div className="space-y-2">
                            <Label>N° Documento</Label>
                            <Input
                                placeholder="Ej: Factura 12345"
                                value={regNumber}
                                onChange={(e) => setRegNumber(e.target.value)}
                            />
                        </div>

                        {/* Confirmar N° Documento */}
                        <div className="space-y-2">
                            <Label>Confirmar N° Documento</Label>
                            <Input
                                placeholder="Repite el número"
                                value={confirmRegNumber}
                                onChange={(e) => setConfirmRegNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    {regNumber && confirmRegNumber && regNumber !== confirmRegNumber && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Los números no coinciden.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </MultiStepForm>
        </div>
    );
};

export default Expense;
