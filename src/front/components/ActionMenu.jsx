import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Pencil, Check, CircleX, Clock } from 'lucide-react';

const ActionMenu = ({ expense, onDetail, onEdit, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Asegúrate que estos IDs coincidan con tu Base de Datos
    const STATUS = {
        PENDIENTE: 1,
        APROBADO: 2,
        ANULADO: 3
    };

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
                title="Opciones"
            >
                <MoreHorizontal className="h-5 w-5 text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">

                    <div className="py-1">
                        {/* VER DETALLE */}
                        <button
                            onClick={() => { onDetail(expense); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                            <Eye className="h-4 w-4 text-blue-500" /> Ver Detalle
                        </button>

                        {/* EDITAR (Si no está anulado) */}
                        {expense.expense_status_id !== STATUS.ANULADO && (
                            <button
                                onClick={() => { onEdit(expense); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Pencil className="h-4 w-4 text-slate-500" /> Editar
                            </button>
                        )}
                    </div>

                    <div className="border-t border-slate-100"></div>

                    <div className="py-1">
                        {/* APROBAR (Si está pendiente) */}
                        {expense.expense_status_id === STATUS.PENDIENTE && (
                            <button
                                onClick={() => { onStatusChange(expense.id, STATUS.APROBADO); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                            >
                                <Check className="h-4 w-4" /> Aprobar
                            </button>
                        )}

                        {/* VOLVER A PENDIENTE (Si está aprobado) */}
                        {expense.expense_status_id === STATUS.APROBADO && (
                            <button
                                onClick={() => { onStatusChange(expense.id, STATUS.PENDIENTE); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2"
                            >
                                <Clock className="h-4 w-4" /> Pendiente
                            </button>
                        )}

                        {/* ANULAR (Si no está anulado) */}
                        {expense.expense_status_id !== STATUS.ANULADO && (
                            <button
                                onClick={() => { onStatusChange(expense.id, STATUS.ANULADO); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <CircleX className="h-4 w-4" /> Anular
                            </button>
                        )}
                        {/* RESTAURAR (Si está anulado) */}
                        {expense.expense_status_id === STATUS.ANULADO && (
                            <button
                                onClick={() => { onStatusChange(expense.id, STATUS.PENDIENTE); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                            >
                                <Clock className="h-4 w-4" /> Restaurar
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionMenu;