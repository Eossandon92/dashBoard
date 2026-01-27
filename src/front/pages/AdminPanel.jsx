import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

/* ===============================
   COLUMNAS
================================ */

const CONDOMINIO_COLUMNS = [
    { key: "nombre", label: "Nombre" },
    { key: "comuna", label: "Comuna" },
    { key: "direccion", label: "Dirección" },
    { key: "total_unidades", label: "Unidades" },
    { key: "email_contacto", label: "Email" },
    { key: "telefono_contacto", label: "Teléfono" },
    { key: "administrador_id", label: "Administrador" },
    { key: "estado", label: "Estado" },
];

const USER_COLUMNS = [
    { key: "first_name", label: "Nombre" },
    { key: "last_name", label: "Apellido" },
    { key: "email", label: "Email" },
    { key: "roles", label: "Roles" },
    { key: "condominio_id", label: "Condominio" },
    { key: "is_active", label: "Estado" },
];

const PROVIDER_COLUMNS = [
    { key: "name", label: "Nombre" },
    { key: "service_type", label: "Tipo de Servicio" },
    { key: "rut", label: "RUT" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Teléfono" },
    { key: "address", label: "Dirección" },
    { key: "notes", label: "Notas" },
    { key: "is_active", label: "Estado" },
];

const COMMON_AREA_COLUMNS = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
    { key: "price", label: "Precio" },
    { key: "is_active", label: "Estado" },
];

/* ===============================
   COMPONENTE
================================ */

export default function AdminTables() {
    // Estado de Autenticación (CORREGIDO)
    const [authuser, setAuthuser] = useState(null);

    // Estados de la tabla
    const [activeTable, setActiveTable] = useState("users");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Estados para catálogos (Dropdowns)
    const [roles, setRoles] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [condominios, setCondominios] = useState([]);
    const [providers, setProviders] = useState([]);
    const [commonAreas, setCommonAreas] = useState([]);

    // Estados de edición/creación
    const [addingNew, setAddingNew] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newRow, setNewRow] = useState({});

    /* ===============================
       MODELOS VACÍOS
    ================================ */

    const emptyCondominio = {
        nombre: "",
        comuna: "",
        direccion: "",
        total_unidades: "",
        email_contacto: "",
        telefono_contacto: "",
        estado: "Activo",
        administrador_id: "",
    };

    const emptyUser = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        roles: [],
        condominio_id: "",
        is_active: true,
    };

    const emptyProvider = {
        name: "",
        service_type: "",
        rut: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        is_active: true,
    };

    const emptyCommonArea = {
        name: "",
        description: "",
        price: "",
        is_active: true,
    };

    /* ===============================
       MAPS (Para mostrar nombres en vez de IDs)
    ================================ */

    const adminsMap = useMemo(() => {
        const map = {};
        admins.forEach((a) => {
            map[a.id] = `${a.first_name} ${a.last_name}`;
        });
        return map;
    }, [admins]);

    const condominiosMap = useMemo(() => {
        const map = {};
        condominios.forEach((c) => {
            map[c.id] = c.nombre;
        });
        return map;
    }, [condominios]);

    /* ===============================
       EFECTOS (Fetch Data)
    ================================ */

    // 1. Cargar Usuario del LocalStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            try {
                setAuthuser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing authUser", e);
            }
        }
    }, []);

    // 2. Cargar catálogos iniciales
    useEffect(() => {
        fetch(`${API_BASE}/api/roles`)
            .then((res) => res.json())
            .then(setRoles);

        fetch(`${API_BASE}/api/users`)
            .then((res) => res.json())
            .then((users) =>
                setAdmins(users.filter((u) => u.roles?.includes("Admin")))
            );

        fetch(`${API_BASE}/api/condominios`)
            .then((res) => res.json())
            .then(setCondominios);

        fetch(`${API_BASE}/api/providers`)
            .then((res) => res.json())
            .then(setProviders);

        fetch(`${API_BASE}/api/common-areas`)
            .then((res) => res.json())
            .then(setCommonAreas);
    }, []);

    // 3. Cargar datos de la tabla activa y resetear formulario
    useEffect(() => {
        setLoading(true);
        setAddingNew(false);
        setEditingId(null);

        let url = `${API_BASE}/api/users`; // Default
        if (activeTable === "condominios") url = `${API_BASE}/api/condominios`;
        else if (activeTable === "providers") url = `${API_BASE}/api/providers`;
        else if (activeTable === "common-areas") {
            const condoId = authuser?.condominium_id;
            url = `${API_BASE}/api/common-areas${condoId ? `?condominio_id=${condoId}` : ""}`;
        }

        fetch(url)
            .then((res) => res.json())
            .then(setData)
            .finally(() => setLoading(false));

        // Seleccionar modelo vacío correcto
        if (activeTable === "condominios") setNewRow(emptyCondominio);
        else if (activeTable === "providers") setNewRow(emptyProvider);
        else if (activeTable === "common-areas") setNewRow({ ...emptyCommonArea, condominium_id: authuser?.condominium_id });
        else setNewRow({ ...emptyUser, condominio_id: authuser?.condominio_id });

    }, [activeTable, authuser]);

    /* ===============================
       LÓGICA DE COLUMNAS Y URLS
    ================================ */

    const columns =
        activeTable === "condominios"
            ? CONDOMINIO_COLUMNS
            : activeTable === "providers"
                ? PROVIDER_COLUMNS
                : activeTable === "common-areas"
                    ? COMMON_AREA_COLUMNS
                    : USER_COLUMNS;

    const baseUrl =
        activeTable === "condominios"
            ? `${API_BASE}/api/condominios`
            : activeTable === "providers"
                ? `${API_BASE}/api/providers`
                : activeTable === "common-areas"
                    ? `${API_BASE}/api/common-areas`
                    : `${API_BASE}/api/users`;

    /* ===============================
       FILTRO DE BÚSQUEDA
    ================================ */

    const filteredData = useMemo(() => {
        const value = search.toLowerCase();
        if (!Array.isArray(data)) return [];
        return data.filter((row) =>
            columns.some((col) =>
                row[col.key]?.toString().toLowerCase().includes(value)
            )
        );
    }, [data, search, columns]);

    /* ===============================
       GUARDAR (CREATE / UPDATE)
    ================================ */

    const handleSave = async () => {
        // Validaciones básicas
        if (activeTable === "condominios" && !newRow.administrador_id) {
            alert("Debe seleccionar un administrador");
            return;
        }
        if (activeTable === "users" && !editingId && !newRow.password) {
            alert("Debe ingresar password");
            return;
        }
        if (activeTable === "providers" && !newRow.name) {
            alert("Debe ingresar nombre del proveedor");
            return;
        }
        if (activeTable === "common-areas" && !newRow.name) {
            alert("Debe ingresar nombre del área común");
            return;
        }

        const isEdit = Boolean(editingId);
        const url = isEdit ? `${baseUrl}/${editingId}` : baseUrl;
        const method = isEdit ? "PUT" : "POST";

        let payload = { ...newRow };

        // Inyectamos condominium_id desde authuser
        if (!payload.condominium_id && authuser?.condominium_id) {
            payload.condominium_id = authuser.condominium_id;
        }

        if (activeTable === "condominios") {
            payload.total_unidades = Number(newRow.total_unidades);
        } else if (activeTable === "common-areas") {
            payload.price = Number(newRow.price);
        } else if (activeTable === "users" && isEdit) {
            payload = {
                first_name: newRow.first_name,
                last_name: newRow.last_name,
                email: newRow.email,
                roles: newRow.roles,
                is_active: newRow.is_active,
                condominio_id: newRow.condominio_id,
            };
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const resList = await fetch(baseUrl);
                const listData = await resList.json();
                setData(listData);

                setAddingNew(false);
                setEditingId(null);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || "Error al guardar"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    };

    /* ===============================
       ELIMINAR
    ================================ */

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar registro?")) return;
        await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
        setData(data.filter((d) => d.id !== id));
    };

    /* ===============================
       RENDER
    ================================ */

    return (
        <div className="w-full mx-0 my-6 rounded-lg border bg-background shadow-sm px-4">
            {/* --- TAB NAVIGATION --- */}
            <div className="flex gap-2 border-b p-4 overflow-x-auto">
                {authuser?.roles?.includes("SuperAdmin") && (
                    <Button
                        variant={activeTable === "condominios" ? "default" : "outline"}
                        onClick={() => setActiveTable("condominios")}
                    >
                        Condominios
                    </Button>
                )}
                <Button
                    variant={activeTable === "users" ? "default" : "outline"}
                    onClick={() => setActiveTable("users")}
                >
                    Usuarios
                </Button>

                <Button
                    variant={activeTable === "providers" ? "default" : "outline"}
                    onClick={() => setActiveTable("providers")}
                >
                    Proveedores
                </Button>

                <Button
                    variant={activeTable === "common-areas" ? "default" : "outline"}
                    onClick={() => setActiveTable("common-areas")}
                >
                    Areas Comunes
                </Button>

                {/* Se oculta el botón Nuevo si se está editando o agregando */}
                {!addingNew && (
                    <Button
                        className="ml-auto"
                        onClick={() => {
                            setAddingNew(true);
                            setEditingId(null);
                            if (activeTable === "condominios") setNewRow(emptyCondominio);
                            else if (activeTable === "providers") setNewRow(emptyProvider);
                            else if (activeTable === "common-areas") setNewRow({ ...emptyCommonArea, condominium_id: authuser?.condominium_id });
                            else setNewRow({ ...emptyUser, condominio_id: authuser?.condominio_id });
                        }}
                    >
                        <Plus className="mr-2 size-4" /> Nuevo
                    </Button>
                )}
            </div>

            {/* --- HEADER & SEARCH --- */}
            <div className="flex justify-between border-b p-4">
                <h1 className="text-xl font-bold capitalize">{activeTable.replace("-", " ")}</h1>
                {/* OCULTAR BÚSQUEDA AL EDITAR/AGREGAR */}
                {!addingNew && (
                    <Input
                        placeholder="Buscar..."
                        className="w-[220px]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                )}
            </div>

            {/* --- TABLE CONTENT --- */}
            {loading ? (
                <div className="p-6 text-center">Cargando...</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((c) => (
                                <TableHead key={c.key}>{c.label}</TableHead>
                            ))}
                            {/* OCULTAR CABECERA ACCIONES AL EDITAR/AGREGAR */}
                            {!addingNew && <TableHead className="text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {/* --- FORMULARIO DE CREACIÓN/EDICIÓN --- */}
                        {addingNew && (
                            <>
                                <TableRow className="bg-muted/40">
                                    {columns.map((col) => (
                                        <TableCell key={col.key}>
                                            {col.key === "administrador_id" ? (
                                                <select
                                                    className="w-full rounded-md border px-2 py-1"
                                                    value={newRow.administrador_id}
                                                    onChange={(e) =>
                                                        setNewRow({
                                                            ...newRow,
                                                            administrador_id: Number(e.target.value),
                                                        })
                                                    }
                                                >
                                                    <option value="">Seleccione...</option>
                                                    {admins.map((a) => (
                                                        <option key={a.id} value={a.id}>
                                                            {a.first_name} {a.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : col.key === "roles" ? (
                                                <select
                                                    className="w-full rounded-md border px-2 py-1"
                                                    value={newRow.roles?.[0] || ""}
                                                    onChange={(e) =>
                                                        setNewRow({
                                                            ...newRow,
                                                            roles: e.target.value ? [e.target.value] : [],
                                                        })
                                                    }
                                                >
                                                    <option value="">Seleccione...</option>
                                                    {roles.map((r) => (
                                                        <option key={r.id} value={r.name}>
                                                            {r.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : col.key === "condominio_id" ? (
                                                <select
                                                    className="w-full rounded-md border px-2 py-1"
                                                    value={newRow.condominio_id}
                                                    onChange={(e) =>
                                                        setNewRow({
                                                            ...newRow,
                                                            condominio_id: Number(e.target.value),
                                                        })
                                                    }
                                                >
                                                    <option value="">Seleccione...</option>
                                                    {condominios.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : col.key === "is_active" ? (
                                                <select
                                                    className="w-full rounded-md border px-2 py-1"
                                                    value={newRow.is_active}
                                                    onChange={(e) =>
                                                        setNewRow({
                                                            ...newRow,
                                                            is_active: e.target.value === "true",
                                                        })
                                                    }
                                                >
                                                    <option value="true">Activo</option>
                                                    <option value="false">Inactivo</option>
                                                </select>
                                            ) : (
                                                <Input
                                                    value={newRow[col.key] ?? ""}
                                                    onChange={(e) =>
                                                        setNewRow({
                                                            ...newRow,
                                                            [col.key]: e.target.value,
                                                        })
                                                    }
                                                />
                                            )}
                                        </TableCell>
                                    ))}
                                    {/* Celda vacía para mantener la estructura pero sin columna acciones */}
                                </TableRow>

                                {activeTable === "users" && !editingId && (
                                    <TableRow className="bg-muted/40">
                                        <TableCell colSpan={columns.length}>
                                            <Input
                                                type="password"
                                                placeholder="Password del nuevo usuario"
                                                value={newRow.password || ""}
                                                onChange={(e) =>
                                                    setNewRow({
                                                        ...newRow,
                                                        password: e.target.value,
                                                    })
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                <TableRow className="bg-muted/40">
                                    <TableCell colSpan={columns.length} className="text-right">
                                        <Button size="sm" onClick={handleSave}>
                                            Guardar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="ml-2"
                                            onClick={() => setAddingNew(false)}
                                        >
                                            Cancelar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </>
                        )}

                        {filteredData.map((row) => (
                            <TableRow key={row.id}>
                                {columns.map((col) => (
                                    <TableCell key={col.key}>
                                        {col.key === "roles" ? (
                                            row.roles?.join(", ")
                                        ) : col.key === "condominio_id" ? (
                                            condominiosMap[row.condominio_id] || "Sin asignar"
                                        ) : col.key === "administrador_id" ? (
                                            adminsMap[row.administrador_id] || "-"
                                        ) : col.key === "is_active" ? (
                                            <Badge variant={row.is_active ? "default" : "destructive"}>
                                                {row.is_active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        ) : col.key === "estado" ? (
                                            <Badge>{row.estado}</Badge>
                                        ) : (
                                            row[col.key] ?? "-"
                                        )}
                                    </TableCell>
                                ))}

                                {/* OCULTAR FILA DE ACCIONES AL EDITAR/AGREGAR */}
                                {!addingNew && (
                                    <TableCell className="flex justify-end gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setEditingId(row.id);
                                                setAddingNew(true);
                                                setNewRow(row);
                                            }}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDelete(row.id)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}